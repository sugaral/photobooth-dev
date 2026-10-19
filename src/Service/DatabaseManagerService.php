<?php

namespace Photobooth\Service;

use Photobooth\Enum\FolderEnum;

/**
 * Class DatabaseManager
 *
 * Manages the database, including adding and deleting files.
 */
class DatabaseManagerService
{
    public string $databaseFile = '';
    public string $imageDirectory = '';

    public function __construct()
    {
        $config = ConfigurationService::getInstance()->getConfiguration();
        $this->databaseFile = FolderEnum::DATA->absolute() . DIRECTORY_SEPARATOR . $config['database']['file'] . '.txt';
        $this->imageDirectory = FolderEnum::IMAGES->absolute();
    }

    /**
     * Get the list of files from the database file.
     */
    public function getContentFromDB(): array
    {
        try {
            return $this->withDatabaseLock(fn () => $this->readDatabase(), false);
        } catch (\Exception $e) {
            // do nothing
        }

        return [];
    }

    /** Use a stable lock file: replacing/unlinking the data file must not bypass the lock. */
    private function withDatabaseLock(callable $operation, bool $exclusive = true): mixed
    {
        if ($this->databaseFile === '') {
            throw new \RuntimeException('Database not defined.');
        }
        $lock = fopen($this->databaseFile . '.lock', 'c');
        if ($lock === false) {
            throw new \RuntimeException('Cannot open gallery database lock.');
        }
        try {
            if (!flock($lock, $exclusive ? LOCK_EX : LOCK_SH)) {
                throw new \RuntimeException('Cannot lock gallery database.');
            }
            return $operation();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /** Mutation must reject corrupt data rather than silently replacing it with an empty list. */
    private function readDatabase(): array
    {
        if (!is_file($this->databaseFile)) {
            return [];
        }
        $data = file_get_contents($this->databaseFile);
        if ($data === false) {
            throw new \RuntimeException('Cannot read gallery database.');
        }
        $decoded = json_decode($data, true, 512, JSON_THROW_ON_ERROR);
        if (!is_array($decoded) || !array_is_list($decoded)) {
            throw new \RuntimeException('Invalid gallery database content.');
        }
        return $decoded;
    }

    private function writeDatabase(array $content): void
    {
        $json = json_encode(array_values($content), JSON_THROW_ON_ERROR);
        $temporary = tempnam(dirname($this->databaseFile), '.gallery-');
        if ($temporary === false) {
            throw new \RuntimeException('Cannot create temporary gallery database.');
        }
        try {
            if (file_put_contents($temporary, $json) !== strlen($json)) {
                throw new \RuntimeException('Cannot write gallery database.');
            }
            if (is_file($this->databaseFile)) {
                chmod($temporary, fileperms($this->databaseFile) & 0777);
            }
            if (!rename($temporary, $this->databaseFile)) {
                throw new \RuntimeException('Cannot publish gallery database.');
            }
        } finally {
            if (is_file($temporary)) {
                unlink($temporary);
            }
        }
    }

    /**
     * Get the list of images from the images directory.
     */
    public function getFilesFromDirectory(): array
    {
        // check if the directory is defined and non-empty
        if (!isset($this->imageDirectory) || empty($this->imageDirectory)) {
            throw new \Exception('Directory not defined.');
        }

        try {
            // open the directory
            $dh = opendir($this->imageDirectory);
            if ($dh === false) {
                throw new \Exception('Failed to open directory: ' . $this->imageDirectory);
            }

            // read the files in the directory
            $files = [];
            while (false !== ($filename = readdir($dh))) {
                $files[] = $filename;
            }
            closedir($dh);

            // filter the files to include only images with .jpg or .jpeg extensions
            $images = preg_grep('/\.(jpg|jpeg)$/i', $files);
            if ($images === false) {
                return [];
            }

            return $images;
        } catch (\Exception $e) {
            // do nothing
        }

        return [];
    }

    /**
     * Append a new content by name to the database file.
     */
    public function appendContentToDB(string $content): void
    {
        if (!$content) {
            throw new \Exception('Invalid content.');
        }

        // check if the database file is defined and non-empty
        if (!isset($this->databaseFile) || empty($this->databaseFile)) {
            throw new \Exception('Database not defined.');
        }

        $this->withDatabaseLock(function () use ($content): void {
            $currContent = $this->readDatabase();
            if (!in_array($content, $currContent, true)) {
                $currContent[] = $content;
                $this->writeDatabase($currContent);
            }
        });
    }

    /**
     * Delete an entry by name from the database file.
     */
    public function deleteContentFromDB(string $content): void
    {
        if (!$content) {
            throw new \Exception('Invalid filename.');
        }

        // check if the database file is defined and non-empty
        if (!isset($this->databaseFile) || empty($this->databaseFile)) {
            throw new \Exception('Database not defined.');
        }
        $this->withDatabaseLock(function () use ($content): void {
            $currContent = $this->readDatabase();
            $index = array_search($content, $currContent, true);
            if ($index !== false) {
                unset($currContent[$index]);
                $this->writeDatabase($currContent);
            }
        });
    }

    /**
     * Check if an content exists in the database file.
     */
    public function isInDB(string $content): bool
    {
        if (!$content) {
            throw new \Exception('Invalid filename.');
        }

        // check if the database file is defined and non-empty
        if (!isset($this->databaseFile) || empty($this->databaseFile)) {
            throw new \Exception('Database not defined.');
        }

        $currContent = $this->getContentFromDB();

        return in_array($content, $currContent);
    }

    /**
     * Returns the size of the database file in bytes.
     */
    public function getDBSize(): int
    {
        if (file_exists($this->databaseFile)) {
            return (int) filesize($this->databaseFile);
        }
        return 0;
    }

    /**
     * Rebuilds the image database by scanning the image directory and creating a new database
     * file with the names of all files sorted by modification time.
     *
     * @return string The string "success" if the database was rebuilt successfully, or "error"
     *                if an error occurred during the rebuilding process.
     */
    public function rebuildDB(): string
    {
        // check if the database file is defined and non-empty
        if (!isset($this->databaseFile) || empty($this->databaseFile)) {
            throw new \Exception('Database not defined.');
        }

        // check if the file directory is defined and non-empty
        if (!isset($this->imageDirectory) || empty($this->imageDirectory)) {
            throw new \Exception('File directory not defined.');
        }

        try {
            return $this->withDatabaseLock(function (): string {
                $output = [];
                foreach (new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($this->imageDirectory, \FilesystemIterator::SKIP_DOTS | \FilesystemIterator::UNIX_PATHS)) as $value) {
                    if ($value->isFile() && strtolower(pathinfo($value->getFilename(), PATHINFO_EXTENSION)) === 'jpg') {
                        $output[] = [$value->getMTime(), $value->getFilename()];
                    }
                }

                if (!empty($output)) {
                    usort($output, function ($a, $b) {
                        return $a[0] <=> $b[0];
                    });
                }

                $this->writeDatabase(array_column($output, 1));
                return 'success';
            });
        } catch (\Exception $e) {
            return 'error';
        }
    }

    public static function getInstance(): self
    {
        if (!isset($GLOBALS[self::class])) {
            $GLOBALS[self::class] = new self();
        }

        return $GLOBALS[self::class];
    }
}
