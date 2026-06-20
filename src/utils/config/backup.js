import fs from "fs";
import path from "path";

import { CONF_DIR } from "./config";

const BACKUP_DIR = path.join(CONF_DIR, "backups");
const MAX_BACKUPS = 10;

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Create a backup of the specified YAML files
 * @param {string[]} fileNames - Array of filenames to backup (e.g., ["services.yaml", "bookmarks.yaml"])
 * @returns {string} The backup directory path
 */
export function createBackup(fileNames) {
  ensureBackupDir();

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, timestamp);

  fs.mkdirSync(backupPath, { recursive: true });

  for (const fileName of fileNames) {
    const src = path.join(CONF_DIR, fileName);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(backupPath, fileName));
    }
  }

  cleanOldBackups();

  return backupPath;
}

/**
 * List all backups (sorted by time, newest first)
 * @returns {string[]} Array of backup directory names
 */
export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) {
    return [];
  }

  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => {
      const fullPath = path.join(BACKUP_DIR, f);
      return fs.statSync(fullPath).isDirectory();
    })
    .sort()
    .reverse()
    .slice(0, MAX_BACKUPS);
}

/**
 * Get the files contained in a backup
 * @param {string} backupId - The backup directory name
 * @returns {string[]} Array of filenames in the backup
 */
export function getBackupFiles(backupId) {
  const backupPath = path.join(BACKUP_DIR, backupId);
  if (!fs.existsSync(backupPath)) {
    return [];
  }
  return fs.readdirSync(backupPath).filter((f) => f.endsWith(".yaml"));
}

/**
 * Restore files from a backup
 * @param {string} backupId - The backup directory name
 * @returns {string[]} Array of restored filenames
 */
export function restoreBackup(backupId) {
  const backupPath = path.join(BACKUP_DIR, backupId);
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupId}`);
  }

  const files = getBackupFiles(backupId);
  const restoredFiles = [];

  for (const file of files) {
    const src = path.join(backupPath, file);
    const dest = path.join(CONF_DIR, file);
    fs.copyFileSync(src, dest);
    restoredFiles.push(file);
  }

  return restoredFiles;
}

/**
 * Delete old backups, keeping only the most recent MAX_BACKUPS
 */
function cleanOldBackups() {
  const backups = listBackups();
  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    for (const backup of toDelete) {
      const backupPath = path.join(BACKUP_DIR, backup);
      fs.rmSync(backupPath, { recursive: true, force: true });
    }
  }
}
