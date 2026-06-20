import { getToken } from "next-auth/jwt";

import { listBackups, restoreBackup, getBackupFiles } from "utils/config/backup";
import createLogger from "utils/logger";

const logger = createLogger("admin-undo");

export default async function handler(req, res) {
  // Verify admin authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return res.status(403).json({ error: "Forbidden: admin access required" });
  }

  try {
    switch (req.method) {
      case "GET":
        return handleGet(req, res);
      case "POST":
        return handlePost(req, res);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error("Admin undo error: %s", error.message);
    return res.status(500).json({ error: error.message });
  }
}

function handleGet(req, res) {
  const backups = listBackups();
  const result = backups.map((id) => ({
    id,
    files: getBackupFiles(id),
  }));
  return res.json(result);
}

function handlePost(req, res) {
  const { backupId } = req.body;

  if (!backupId) {
    return res.status(400).json({ error: "backupId is required" });
  }

  const restoredFiles = restoreBackup(backupId);
  logger.info("Restored backup %s: %s", backupId, restoredFiles.join(", "));

  return res.json({
    success: true,
    restoredFiles,
  });
}
