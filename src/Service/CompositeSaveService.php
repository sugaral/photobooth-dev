<?php

namespace Photobooth\Service;

/** Retry journal for the legacy composite endpoint; not an asset ownership system. */
final class CompositeSaveService
{
    private \PDO $db;

    public function __construct(string $path)
    {
        $this->db = new \PDO('sqlite:' . $path, null, null, [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
        $this->db->exec('PRAGMA busy_timeout = 30000');
        $this->db->exec('CREATE TABLE IF NOT EXISTS composite_saves (owner TEXT NOT NULL, request_id TEXT NOT NULL, digest TEXT NOT NULL, filename TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(owner, request_id))');
    }

    /** Reserve durably before any output, then serialize publication/retry. */
    public function begin(string $owner, string $requestId, string $digest): array
    {
        if (!preg_match('/^[a-f0-9]{32}$/D', $requestId) || !preg_match('/^[a-f0-9]{64}$/D', $digest) || $owner === '') {
            throw new \InvalidArgumentException('Invalid composite save identity');
        }
        $filename = 'edit_' . hash('sha256', $owner . ':' . $requestId) . '.jpg';
        $this->db->exec('BEGIN IMMEDIATE');
        try {
            $insert = $this->db->prepare('INSERT OR IGNORE INTO composite_saves(owner, request_id, digest, filename) VALUES (?, ?, ?, ?)');
            $insert->execute([$owner, $requestId, $digest, $filename]);
            $this->db->exec('COMMIT');
            $this->db->exec('BEGIN IMMEDIATE');
            $query = $this->db->prepare('SELECT * FROM composite_saves WHERE owner = ? AND request_id = ?');
            $query->execute([$owner, $requestId]);
            $row = $query->fetch(\PDO::FETCH_ASSOC);
            if (!$row || !hash_equals($row['digest'], $digest)) {
                throw new \DomainException('同一保存请求的图像内容发生变化，请重新编辑后保存');
            }
            return $row;
        } catch (\Throwable $e) {
            $this->rollback();
            throw $e;
        }
    }

    public function complete(string $owner, string $requestId): void
    {
        $query = $this->db->prepare('UPDATE composite_saves SET completed = 1 WHERE owner = ? AND request_id = ?');
        $query->execute([$owner, $requestId]);
        $this->db->exec('COMMIT');
    }

    public function rollback(): void
    {
        try { $this->db->exec('ROLLBACK'); } catch (\PDOException) { /* Already closed. */ }
    }
}
