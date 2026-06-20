import { useState } from "react";
import { MdClose, MdSave, MdDelete } from "react-icons/md";

export default function GroupEditor({ group, type, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    name: group?.name || "",
    tab: group?.tab || "",
    bookmarkTab: group?.bookmarkTab || "",
    style: group?.style || "row",
    columns: group?.columns || 4,
    header: group?.header !== false,
    protected: group?.protected || false,
    autohide: group?.autohide || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const settingsRes = await fetch("/api/admin/config?type=settings");
      const settings = await settingsRes.json();

      if (!settings.layout) settings.layout = {};

      const layoutData = {};
      if (formData.tab) layoutData.tab = formData.tab;
      if (formData.bookmarkTab) layoutData.bookmarkTab = formData.bookmarkTab;
      if (formData.style !== "row") layoutData.style = formData.style;
      layoutData.columns = formData.columns;
      if (!formData.header) layoutData.header = false;
      if (formData.protected) layoutData.protected = true;
      if (formData.autohide) layoutData.autohide = true;

      settings.layout[formData.name] = layoutData;

      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "settings", data: settings }),
      });

      if (res.ok) {
        onSave?.();
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

  const handleDelete = async () => {
    if (!confirm(`确定要删除分组 "${formData.name}" 吗？`)) return;

    setLoading(true);
    try {
      const settingsRes = await fetch("/api/admin/config?type=settings");
      const settings = await settingsRes.json();

      if (settings.layout?.[formData.name]) {
        delete settings.layout[formData.name];
      }

      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "settings", data: settings }),
      });

      if (res.ok) {
        onDelete?.();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-theme-50 dark:bg-theme-800 rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-200 dark:border-theme-700">
          <h2 className="text-lg font-semibold text-theme-800 dark:text-theme-200">
            {group ? "编辑分组" : "添加分组"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-theme-500 hover:text-theme-700 dark:hover:text-theme-300"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">分组名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="_s_web 或 _b_ai_tool"
              disabled={!!group}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200 disabled:opacity-50"
            />
          </div>

          {type === "service" && (
            <div>
              <label className="text-sm text-theme-700 dark:text-theme-300">Tab</label>
              <input
                type="text"
                value={formData.tab}
                onChange={(e) => setFormData({ ...formData, tab: e.target.value })}
                placeholder="所属 Tab 名称"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
              />
            </div>
          )}

          {type === "bookmark" && (
            <div>
              <label className="text-sm text-theme-700 dark:text-theme-300">Bookmark Tab</label>
              <input
                type="text"
                value={formData.bookmarkTab}
                onChange={(e) => setFormData({ ...formData, bookmarkTab: e.target.value })}
                placeholder="所属 Bookmark Tab 名称"
                className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
              />
            </div>
          )}

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">布局样式</label>
            <select
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            >
              <option value="row">行</option>
              <option value="column">列</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">列数</label>
            <input
              type="number"
              value={formData.columns}
              onChange={(e) => setFormData({ ...formData, columns: Number(e.target.value) })}
              min={1}
              max={8}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.header}
              onChange={(e) => setFormData({ ...formData, header: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-theme-700 dark:text-theme-300">显示标题</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.protected}
              onChange={(e) => setFormData({ ...formData, protected: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-theme-700 dark:text-theme-300">需要登录</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.autohide}
              onChange={(e) => setFormData({ ...formData, autohide: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-theme-700 dark:text-theme-300">无内容时自动隐藏</span>
          </label>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-theme-200 dark:border-theme-700">
            {group && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-1"
              >
                <MdDelete className="w-4 h-4" />
                删除
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-theme-300 dark:border-theme-600 rounded-md text-theme-700 dark:text-theme-300 hover:bg-theme-100 dark:hover:bg-theme-700"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
              >
                <MdSave className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
