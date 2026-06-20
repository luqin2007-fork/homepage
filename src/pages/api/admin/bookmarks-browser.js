import fs from "fs";
import path from "path";
import os from "os";

import { getToken } from "next-auth/jwt";
import createLogger from "utils/logger";

const logger = createLogger("admin-bookmarks-browser");

// Browser bookmark file paths
const BOOKMARK_PATHS = {
  chrome: [
    path.join(os.homedir(), ".config/google-chrome/Default/Bookmarks"),
    path.join(os.homedir(), ".config/chromium/Default/Bookmarks"),
    path.join(os.homedir(), ".config/google-chrome/Profile 1/Bookmarks"),
  ],
  edge: [
    path.join(os.homedir(), ".config/microsoft-edge/Default/Bookmarks"),
  ],
  brave: [
    path.join(os.homedir(), ".config/BraveSoftware/Brave-Browser/Default/Bookmarks"),
  ],
};

function findBookmarkFile() {
  for (const [browser, paths] of Object.entries(BOOKMARK_PATHS)) {
    for (const p of paths) {
      if (fs.existsSync(p)) {
        return { browser, path: p };
      }
    }
  }
  return null;
}

function parseBookmarkNode(node) {
  if (node.type === "url") {
    return {
      type: "bookmark",
      name: node.name,
      url: node.url,
      dateAdded: node.date_added,
    };
  }

  if (node.type === "folder") {
    return {
      type: "folder",
      name: node.name,
      children: (node.children || []).map(parseBookmarkNode).filter(Boolean),
      dateAdded: node.date_added,
    };
  }

  return null;
}

function parseChromeBookmarks(data) {
  try {
    const parsed = JSON.parse(data);
    const roots = [];

    if (parsed.roots) {
      for (const [key, value] of Object.entries(parsed.roots)) {
        if (key === "sync_transaction_version") continue;
        const parsed_node = parseBookmarkNode(value);
        if (parsed_node) {
          roots.push(parsed_node);
        }
      }
    }

    return roots;
  } catch (e) {
    logger.error("Failed to parse bookmarks: %s", e.message);
    return [];
  }
}

function parseBookmarksHtml(html) {
  // Parse Netscape Bookmark File Format (used by Firefox, Chrome export)
  const bookmarks = [];
  const lines = html.split("\n");
  let currentFolder = null;
  const folderStack = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Folder start
    const folderMatch = trimmed.match(/<DT><H3[^>]*>([^<]+)<\/H3>/);
    if (folderMatch) {
      const folder = {
        type: "folder",
        name: folderMatch[1],
        children: [],
      };
      if (currentFolder) {
        folderStack.push(currentFolder);
        currentFolder.children.push(folder);
      } else {
        bookmarks.push(folder);
      }
      currentFolder = folder;
      continue;
    }

    // Bookmark
    const bookmarkMatch = trimmed.match(/<DT><A[^>]*HREF="([^"]*)"[^>]*>([^<]+)<\/A>/);
    if (bookmarkMatch) {
      const bookmark = {
        type: "bookmark",
        name: bookmarkMatch[2],
        url: bookmarkMatch[1],
      };
      if (currentFolder) {
        currentFolder.children.push(bookmark);
      } else {
        bookmarks.push(bookmark);
      }
      continue;
    }

    // Folder end
    if (trimmed === "</DL><p>" || trimmed === "</DL>") {
      if (folderStack.length > 0) {
        currentFolder = folderStack.pop();
      } else {
        currentFolder = null;
      }
    }
  }

  return bookmarks;
}

export default async function handler(req, res) {
  // Verify admin authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return res.status(403).json({ error: "Forbidden: admin access required" });
  }

  // Handle POST with uploaded bookmark data
  if (req.method === "POST") {
    try {
      const { data, format } = req.body;

      if (!data) {
        return res.status(400).json({ error: "No bookmark data provided" });
      }

      let bookmarks;
      if (format === "html") {
        bookmarks = parseBookmarksHtml(data);
      } else {
        // Default to Chrome JSON format
        bookmarks = parseChromeBookmarks(data);
      }

      return res.json({
        browser: "uploaded",
        bookmarks,
      });
    } catch (error) {
      logger.error("Error parsing uploaded bookmarks: %s", error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  // Handle GET - read from filesystem
  try {
    const bookmarkFile = findBookmarkFile();

    if (!bookmarkFile) {
      return res.json({
        browser: null,
        bookmarks: [],
        message: "No browser bookmarks found on server. You can upload a bookmarks file.",
      });
    }

    const data = fs.readFileSync(bookmarkFile.path, "utf8");
    const bookmarks = parseChromeBookmarks(data);

    return res.json({
      browser: bookmarkFile.browser,
      bookmarks,
    });
  } catch (error) {
    logger.error("Error reading browser bookmarks: %s", error.message);
    return res.status(500).json({ error: error.message });
  }
}
