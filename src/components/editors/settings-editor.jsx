import { useCallback, useEffect, useState } from "react";
import { MdClose, MdSave, MdRestore, MdDelete } from "react-icons/md";

const SETTING_SECTIONS = [
  { key: "basic", label: "基础设置", fields: ["title", "description", "language", "base", "startUrl"] },
  { key: "theme", label: "主题", fields: ["theme", "color", "headerStyle", "cardBlur", "iconStyle"] },
  { key: "layout", label: "布局", fields: ["fullWidth", "maxGroupColumns", "maxBookmarkGroupColumns", "disableCollapse", "groupsInitiallyCollapsed", "useEqualHeights", "bookmarksStyle"] },
  { key: "background", label: "背景", fields: ["background", "backgroundOpacity"] },
  { key: "quicklaunch", label: "快速启动", fields: ["quicklaunch"] },
  { key: "providers", label: "Providers", fields: ["providers"] },
  { key: "other", label: "其他", fields: ["target", "showStats", "statusStyle", "hideVersion", "disableUpdateCheck", "disableIndexing", "hideErrors", "instanceName"] },
  { key: "backups", label: "备份恢复", fields: [] },
];

export default function SettingsEditor({ onClose }) {
  const [settings, setSettings] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backups, setBackups] = useState([]);
  const [restoring, setRestoring] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/config?type=settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/undo");
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (err) {
      console.error("Failed to fetch backups:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchBackups();
  }, [fetchSettings, fetchBackups]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "settings", data: settings }),
      });

      if (res.ok) {
        onClose();
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId) => {
    if (!confirm(`确定要恢复到备份 ${backupId} 吗？当前配置将被覆盖。`)) {
      return;
    }

    setRestoring(true);
    try {
      const res = await fetch("/api/admin/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupId }),
      });

      if (res.ok) {
        onClose();
        window.location.reload();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRestoring(false);
    }
  };

  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (key) => {
    const value = settings[key];

    if (typeof value === "boolean") {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => updateField(key, e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-theme-700 dark:text-theme-300">{key}</span>
        </label>
      );
    }

    if (typeof value === "number") {
      return (
        <div>
          <label className="text-sm text-theme-700 dark:text-theme-300">{key}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => updateField(key, Number(e.target.value))}
            className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
          />
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div>
          <label className="text-sm text-theme-700 dark:text-theme-300">{key}</label>
          <textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                updateField(key, JSON.parse(e.target.value));
              } catch {
                // Allow invalid JSON during editing
              }
            }}
            rows={6}
            className="w-full mt-1 px-3 py-2 border rounded-md font-mono text-sm bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="text-sm text-theme-700 dark:text-theme-300">{key}</label>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => updateField(key, e.target.value)}
          className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
        />
      </div>
    );
  };

  if (!settings) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-theme-50 dark:bg-theme-800 rounded-lg p-6">
          <div className="animate-spin w-8 h-8 border-2 border-theme-400 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    );
  }

  const currentSection = SETTING_SECTIONS.find((s) => s.key === activeSection);
  const fields = currentSection?.fields.filter((f) => f in settings) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-theme-50 dark:bg-theme-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-200 dark:border-theme-700">
          <h2 className="text-lg font-semibold text-theme-800 dark:text-theme-200">
            设置
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
            >
              <MdSave className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={onClose}
              className="p-2 text-theme-500 hover:text-theme-700 dark:hover:text-theme-300"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 border-r border-theme-200 dark:border-theme-700 overflow-y-auto">
            {SETTING_SECTIONS.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-4 py-3 text-sm ${
                  activeSection === section.key
                    ? "bg-theme-200 dark:bg-theme-700 text-theme-800 dark:text-theme-200"
                    : "text-theme-600 dark:text-theme-400 hover:bg-theme-100 dark:hover:bg-theme-700"
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                {error}
              </div>
            )}

            {fields.map((key) => (
              <div key={key}>{renderField(key)}</div>
            ))}

            {activeSection === "backups" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-theme-800 dark:text-theme-200">备份历史</h3>
                <p className="text-sm text-theme-600 dark:text-theme-400">
                  每次修改配置前会自动备份。可选择恢复到之前的版本。
                </p>
                {backups.length === 0 ? (
                  <div className="text-theme-500 dark:text-theme-400 text-sm">
                    暂无备份记录
                  </div>
                ) : (
                  <div className="space-y-2">
                    {backups.map((backup) => (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-3 bg-theme-100 dark:bg-theme-700 rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-medium text-theme-800 dark:text-theme-200">
                            {backup.id}
                          </div>
                          <div className="text-xs text-theme-500 dark:text-theme-400">
                            {backup.files.join(", ")}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRestore(backup.id)}
                          disabled={restoring}
                          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm flex items-center gap-1"
                        >
                          <MdRestore className="w-4 h-4" />
                          恢复
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {fields.length === 0 && activeSection !== "backups" && (
              <div className="text-theme-500 dark:text-theme-400 text-sm">
                此分类暂无已配置的字段
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
