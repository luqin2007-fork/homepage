import { getToken } from "next-auth/jwt";

import {
  readYaml,
  writeYaml,
  updateServiceGroup,
  deleteServiceGroup,
  updateBookmarkGroup,
  deleteBookmarkGroup,
  updateSettings,
  updateWidgets,
} from "utils/config/yaml-writer";
import { listBackups } from "utils/config/backup";
import createLogger from "utils/logger";

const logger = createLogger("admin-config");

const VALID_TYPES = ["services", "bookmarks", "widgets", "settings"];

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
      case "PUT":
        return handlePut(req, res);
      case "POST":
        return handlePost(req, res);
      case "DELETE":
        return handleDelete(req, res);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error("Admin config error: %s", error.message);
    return res.status(500).json({ error: error.message });
  }
}

function handleGet(req, res) {
  const { type } = req.query;

  if (type === "backups") {
    return res.json(listBackups());
  }

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type: ${type}` });
  }

  const data = readYaml(`${type}.yaml`);
  return res.json(data ?? {});
}

function handlePut(req, res) {
  const { type, data } = req.body;

  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type: ${type}` });
  }

  writeYaml(`${type}.yaml`, data);
  return res.json({ success: true });
}

function handlePost(req, res) {
  const { type, action, group, item, key, value } = req.body;

  switch (type) {
    case "services":
      return handleServicePost(req, res, action, group, item);
    case "bookmarks":
      return handleBookmarkPost(req, res, action, group, item);
    case "widgets":
      return handleWidgetPost(req, res, action, item);
    case "settings":
      return handleSettingsPost(req, res, action, key, value);
    default:
      return res.status(400).json({ error: `Invalid type: ${type}` });
  }
}

function handleServicePost(req, res, action, group, item) {
  if (action === "updateGroup") {
    updateServiceGroup(group, item);
    return res.json({ success: true });
  }

  if (action === "deleteGroup") {
    deleteServiceGroup(group);
    return res.json({ success: true });
  }

  if (action === "add" || action === "update") {
    const services = readYaml("services.yaml") || [];
    const groupObj = services.find((g) => Object.keys(g)[0] === group);

    if (!groupObj) {
      return res.status(404).json({ error: `Group not found: ${group}` });
    }

    const groupServices = groupObj[group];
    const serviceIndex = groupServices.findIndex(
      (s) => Object.keys(s)[0] === item.name
    );

    if (action === "add") {
      if (serviceIndex >= 0) {
        return res.status(409).json({ error: `Service already exists: ${item.name}` });
      }
      const { name, ...serviceData } = item;
      groupServices.push({ [name]: serviceData });
    } else {
      if (serviceIndex < 0) {
        return res.status(404).json({ error: `Service not found: ${item.name}` });
      }
      const { name, ...serviceData } = item;
      groupServices[serviceIndex] = { [name]: serviceData };
    }

    writeYaml("services.yaml", services);
    return res.json({ success: true });
  }

  if (action === "delete") {
    const services = readYaml("services.yaml") || [];
    const groupObj = services.find((g) => Object.keys(g)[0] === group);

    if (!groupObj) {
      return res.status(404).json({ error: `Group not found: ${group}` });
    }

    groupObj[group] = groupObj[group].filter(
      (s) => Object.keys(s)[0] !== item.name
    );

    writeYaml("services.yaml", services);
    return res.json({ success: true });
  }

  return res.status(400).json({ error: `Invalid action: ${action}` });
}

function handleBookmarkPost(req, res, action, group, item) {
  if (action === "updateGroup") {
    updateBookmarkGroup(group, item);
    return res.json({ success: true });
  }

  if (action === "deleteGroup") {
    deleteBookmarkGroup(group);
    return res.json({ success: true });
  }

  if (action === "add" || action === "update") {
    const bookmarks = readYaml("bookmarks.yaml") || [];
    const groupObj = bookmarks.find((g) => Object.keys(g)[0] === group);

    if (!groupObj) {
      return res.status(404).json({ error: `Group not found: ${group}` });
    }

    const groupBookmarks = groupObj[group];
    const bookmarkIndex = groupBookmarks.findIndex(
      (b) => Object.keys(b)[0] === item.name
    );

    if (action === "add") {
      if (bookmarkIndex >= 0) {
        return res.status(409).json({ error: `Bookmark already exists: ${item.name}` });
      }
      const { name, ...bookmarkData } = item;
      groupBookmarks.push({ [name]: [bookmarkData] });
    } else {
      if (bookmarkIndex < 0) {
        return res.status(404).json({ error: `Bookmark not found: ${item.name}` });
      }
      const { name, ...bookmarkData } = item;
      groupBookmarks[bookmarkIndex] = { [name]: [bookmarkData] };
    }

    writeYaml("bookmarks.yaml", bookmarks);
    return res.json({ success: true });
  }

  if (action === "delete") {
    const bookmarks = readYaml("bookmarks.yaml") || [];
    const groupObj = bookmarks.find((g) => Object.keys(g)[0] === group);

    if (!groupObj) {
      return res.status(404).json({ error: `Group not found: ${group}` });
    }

    groupObj[group] = groupObj[group].filter(
      (b) => Object.keys(b)[0] !== item.name
    );

    writeYaml("bookmarks.yaml", bookmarks);
    return res.json({ success: true });
  }

  return res.status(400).json({ error: `Invalid action: ${action}` });
}

function handleWidgetPost(req, res, action, item) {
  const widgets = readYaml("widgets.yaml") || [];

  if (action === "add") {
    widgets.push(item);
    writeYaml("widgets.yaml", widgets);
    return res.json({ success: true });
  }

  if (action === "update") {
    const index = widgets.findIndex((w) => w.type === item.type);
    if (index >= 0) {
      widgets[index] = item;
    } else {
      widgets.push(item);
    }
    writeYaml("widgets.yaml", widgets);
    return res.json({ success: true });
  }

  if (action === "delete") {
    const filtered = widgets.filter((w) => w.type !== item.type);
    writeYaml("widgets.yaml", filtered);
    return res.json({ success: true });
  }

  return res.status(400).json({ error: `Invalid action: ${action}` });
}

function handleSettingsPost(req, res, action, key, value) {
  if (action === "updateLayout") {
    const settings = readYaml("settings.yaml") || {};
    if (!settings.layout) settings.layout = {};
    settings.layout[key] = value;
    updateSettings(settings);
    return res.json({ success: true });
  }

  if (action === "deleteLayout") {
    const settings = readYaml("settings.yaml") || {};
    if (settings.layout) {
      delete settings.layout[key];
    }
    updateSettings(settings);
    return res.json({ success: true });
  }

  if (action === "update") {
    const settings = readYaml("settings.yaml") || {};
    settings[key] = value;
    updateSettings(settings);
    return res.json({ success: true });
  }

  return res.status(400).json({ error: `Invalid action: ${action}` });
}

function handleDelete(req, res) {
  const { type, group, name } = req.query;

  if (type === "services") {
    const services = readYaml("services.yaml") || [];
    const groupObj = services.find((g) => Object.keys(g)[0] === group);
    if (groupObj) {
      groupObj[group] = groupObj[group].filter(
        (s) => Object.keys(s)[0] !== name
      );
      writeYaml("services.yaml", services);
    }
    return res.json({ success: true });
  }

  if (type === "bookmarks") {
    const bookmarks = readYaml("bookmarks.yaml") || [];
    const groupObj = bookmarks.find((g) => Object.keys(g)[0] === group);
    if (groupObj) {
      groupObj[group] = groupObj[group].filter(
        (b) => Object.keys(b)[0] !== name
      );
      writeYaml("bookmarks.yaml", bookmarks);
    }
    return res.json({ success: true });
  }

  return res.status(400).json({ error: `Invalid type: ${type}` });
}
