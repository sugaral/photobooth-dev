# Ensures the Windows mobile hotspot is on with the kiosk SSID/password.
# Called by local-services.ps1 on start; safe to run repeatedly.
# NOTE: must run under Windows PowerShell 5.1 (WinRT types resolve there).
param(
    [string]$Ssid = 'photobooth',
    [string]$Passphrase = '88888888'
)
$logDir = Join-Path (Split-Path -Parent $PSScriptRoot) 'var/log'
New-Item -ItemType Directory -Path $logDir -Force | Out-Null
$out = Join-Path $logDir 'hotspot.log'
try {
    [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager,Windows.Networking.NetworkOperators,ContentType=WindowsRuntime] | Out-Null
    [Windows.Networking.Connectivity.NetworkInformation,Windows.Networking.Connectivity,ContentType=WindowsRuntime] | Out-Null
    Add-Type -AssemblyName System.Runtime.WindowsRuntime
    $methods = [System.WindowsRuntimeSystemExtensions].GetMethods()
    $asTaskAction = $methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType -eq [Windows.Foundation.IAsyncAction] } | Select-Object -First 1
    $asTaskGeneric = $methods | Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.IsGenericMethod } | Select-Object -First 1
    $profile = [Windows.Networking.Connectivity.NetworkInformation]::GetInternetConnectionProfile()
    if ($null -eq $profile) { "$(Get-Date -Format o) SKIP no internet connection profile" | Add-Content $out; exit 0 }
    $mgr = [Windows.Networking.NetworkOperators.NetworkOperatorTetheringManager]::CreateFromConnectionProfile($profile)
    $needConfig = $true
    try {
        $current = $mgr.GetCurrentAccessPointConfiguration()
        $needConfig = ($current.Ssid -ne $Ssid -or $current.Passphrase -ne $Passphrase)
    } catch {
        "$(Get-Date -Format o) WARN cannot read AP config: $($_.Exception.Message)" | Add-Content $out
    }
    if ($needConfig) {
        try {
            $cfg = New-Object Windows.Networking.NetworkOperators.NetworkOperatorTetheringAccessPointConfiguration
            $cfg.Ssid = $Ssid
            $cfg.Passphrase = $Passphrase
            $task = $asTaskAction.Invoke($null, @($mgr.ConfigureAccessPointAsync($cfg)))
            $task.Wait()
        } catch {
            "$(Get-Date -Format o) WARN configure failed: $($_.Exception.Message)" | Add-Content $out
        }
    }
    if ($mgr.TetheringOperationalState -ne 'On') {
        $op = $mgr.StartTetheringAsync()
        $task = $asTaskGeneric.MakeGenericMethod([Windows.Networking.NetworkOperators.NetworkOperatorTetheringOperationResult]).Invoke($null, @($op))
        $task.Wait()
        "$(Get-Date -Format o) START $($task.Result.Status) $($task.Result.AdditionalErrorMessage)" | Add-Content $out
        Start-Sleep -Seconds 6
        "$(Get-Date -Format o) STATE $($mgr.TetheringOperationalState)" | Add-Content $out
    } else {
        "$(Get-Date -Format o) OK already on" | Add-Content $out
    }
} catch {
    "$(Get-Date -Format o) FAIL $($_.Exception.Message)" | Add-Content $out
}
