# Screensaver function

The screensaver keeps the start screen fresh and prevents burn‑in when guests are idle. Configure it in the Admin Panel under **General → Screensaver**.

## What it can show

- **Image**: Display a single image. Use `Screensaver image path`.
- **Video**: Loop a single video. Use `Screensaver video path`.
- **Folder**: Slide through curated photos in `private/screensavers/` in natural filename order (`1.jpg`, `2.jpg`, …). Supported: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`. Videos use the separate Video mode. Guest gallery photos are never included in Folder mode.
- **Gallery**: Cycle through gallery photos guests already took; falls back to the image path if the gallery is empty.

## Text overlay and styling

- Optional **Screensaver text** shows on top of the media.
- Choose **Text position** (`top-center`, `bottom-center`, `center`) to avoid covering key visuals.
- Adjust **Text backdrop color** and **Backdrop opacity** (0 = fully transparent, 1 = solid) if the text needs contrast; set opacity to `0` to turn the backdrop off.
- Use **Text color** and **Custom font file** for branding; upload fonts into `private/fonts/` and select them from the picker.
- In Gallery mode the overlay alternates between your text and event text to avoid screen burn.

## Timing

- **Timeout before screensaver**: minutes of no interaction before it starts. Set to `0` to keep the screensaver off even if enabled.
- **Slide change interval**: seconds of display before the next photo (minimum `1`). Folder mode then slides horizontally for 700 ms; reduced-motion preferences disable the slide animation. Has no effect for single image/video modes.
- A click, touch or key press hides the screensaver and resets the timer. The waking gesture is consumed so it does not also press a control underneath. Mouse movement resets the idle timer on the homepage but does not dismiss an active screensaver.
- Playback starts only on the idle homepage, not during capture, editing, payment, gallery viewing or quick settings. Switching away from the browser tab stops playback; returning restarts the idle countdown.

## Cabinet photo setup

In **General → Screensaver**, choose **Folder**, enable the screensaver and save. The local cabinet is configured for a **1 minute** idle timeout and **8 seconds** per photo.

Use **Upload screensaver photos** in this section, or open `/admin/upload/?folder=screensavers`. Upload landscape **1920×1080 (16:9)** photos with simple names such as `01.jpg`, `02.jpg`. The upload page displays the current order and image dimensions. Other proportions are shown whole inside a centered 16:9 frame with black letterboxing; originals are never stretched or cropped. File names must use letters, numbers, dots, hyphens or underscores; existing names are not overwritten by the uploader.

The local sample playlist contains copies of the user's `picture/1.jpg` through `picture/4.jpg` (1706×1279, approximately 4:3). Source files remain unchanged. Replace or remove display copies in `private/screensavers/` to change the playlist; the original `picture/` folder is not watched. New photos are read on the next entry into the screensaver, without restarting the server.

Use **Open preview** to enter immediately with saved settings. Save setting changes and refresh the cabinet homepage to apply them. With no playable photos, automatic playback leaves the homepage visible; preview explains that photos must be uploaded. Unreadable/deleted photos are skipped, and a single photo remains displayed without repeatedly animating.

Use the browser's full-screen/kiosk mode on the cabinet (F11 on Windows). This is a website screensaver and does not change the operating system's display power or sleep settings.

## Local verification

`scripts/test-screensaver.cjs` exercises the running website using Playwright and Edge: four-photo order and wraparound, idle timing, wake gestures, workflow guards, empty/single/broken photos, cancellation of delayed loads, reduced motion and responsive layouts. It does not change saved settings or media. Set `NODE_PATH` to the directory containing Playwright if it is not installed in the project; optionally set `PHOTOBOOTH_TEST_URL`.
