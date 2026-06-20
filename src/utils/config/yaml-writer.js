import fs from "fs";
import path from "path";

import yaml from "js-yaml";

import { CONF_DIR } from "./config";
import { createBackup } from "./backup";

/**
 * Read and parse a YAML file
 * @param {string} filename - The filename (e.g., "services.yaml")
 * @returns {any} The parsed YAML content
 */
export function readYaml(filename) {
  const filePath = path.join(CONF_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, "utf8");
  return yaml.load(content);
}

/**
 * Write data to a YAML file with optional backup
 * @param {string} filename - The filename (e.g., "services.yaml")
 * @param {any} data - The data to write
 * @param {object} options - Options
 * @param {boolean} options.backup - Whether to create a backup before writing (default: true)
 */
export function writeYaml(filename, data, { backup = true } = {}) {
  if (backup) {
    createBackup([filename]);
  }

  const filePath = path.join(CONF_DIR, filename);
  const content = yaml.dump(data, {
    lineWidth: -1,
    noRefs: true,
    quotingType: '"',
    forceQuotes: false,
  });
  fs.writeFileSync(filePath, content, "utf8");
}

/**
 * Write multiple YAML files atomically (single backup for all)
 * @param {Array<{filename: string, data: any}>} files - Array of files to write
 */
export function writeMultipleYaml(files) {
  const fileNames = files.map((f) => f.filename);
  createBackup(fileNames);

  for (const { filename, data } of files) {
    const filePath = path.join(CONF_DIR, filename);
    const content = yaml.dump(data, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    });
    fs.writeFileSync(filePath, content, "utf8");
  }
}

/**
 * Add or update a service group in services.yaml
 * @param {string} groupName - The group name (e.g., "_s_web")
 * @param {Array} services - Array of service objects
 */
export function updateServiceGroup(groupName, services) {
  const existing = readYaml("services.yaml") || [];
  const groupIndex = existing.findIndex(
    (g) => Object.keys(g)[0] === groupName
  );

  if (groupIndex >= 0) {
    existing[groupIndex] = { [groupName]: services };
  } else {
    existing.push({ [groupName]: services });
  }

  writeYaml("services.yaml", existing);
}

/**
 * Delete a service group from services.yaml
 * @param {string} groupName - The group name to delete
 */
export function deleteServiceGroup(groupName) {
  const existing = readYaml("services.yaml") || [];
  const filtered = existing.filter(
    (g) => Object.keys(g)[0] !== groupName
  );
  writeYaml("services.yaml", filtered);
}

/**
 * Add or update a bookmark group in bookmarks.yaml
 * @param {string} groupName - The group name (e.g., "_b_ai_tool")
 * @param {Array} bookmarks - Array of bookmark objects
 */
export function updateBookmarkGroup(groupName, bookmarks) {
  const existing = readYaml("bookmarks.yaml") || [];
  const groupIndex = existing.findIndex(
    (g) => Object.keys(g)[0] === groupName
  );

  if (groupIndex >= 0) {
    existing[groupIndex] = { [groupName]: bookmarks };
  } else {
    existing.push({ [groupName]: bookmarks });
  }

  writeYaml("bookmarks.yaml", existing);
}

/**
 * Delete a bookmark group from bookmarks.yaml
 * @param {string} groupName - The group name to delete
 */
export function deleteBookmarkGroup(groupName) {
  const existing = readYaml("bookmarks.yaml") || [];
  const filtered = existing.filter(
    (g) => Object.keys(g)[0] !== groupName
  );
  writeYaml("bookmarks.yaml", filtered);
}

/**
 * Update settings.yaml
 * @param {object} settings - The new settings object
 */
export function updateSettings(settings) {
  writeYaml("settings.yaml", settings);
}

/**
 * Update widgets.yaml
 * @param {Array} widgets - The new widgets array
 */
export function updateWidgets(widgets) {
  writeYaml("widgets.yaml", widgets);
}
