import { useState } from "react";
import { MdClose, MdSave, MdDelete } from "react-icons/md";

const WIDGET_TYPES = [
  "datetime", "search", "weather", "openweathermap", "openmeteo",
  "resources", "glances", "longhorn", "kubernetes", "stocks",
];

export default function WidgetEditor({ widget, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    type: widget?.type || "",
    fields: widget?.fields || null,
    hide_errors: widget?.hide_errors || false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const action = widget ? "update" : "add";
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "widgets",
          action,
          item: formData,
        }),
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
    if (!confirm(`确定要删除 widget "${formData.type}" 吗？`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "widgets",
          action: "delete",
          item: { type: formData.type },
        }),
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
            {widget ? "编辑 Widget" : "添加 Widget"}
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
            <label className="text-sm text-theme-700 dark:text-theme-300">类型 *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              disabled={!!widget}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200 disabled:opacity-50"
            >
              <option value="">选择类型</option>
              {WIDGET_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">配置 (JSON)</label>
            <textarea
              value={JSON.stringify(formData.fields, null, 2)}
              onChange={(e) => {
                try {
                  setFormData({ ...formData, fields: JSON.parse(e.target.value) });
                } catch {
                  // Allow invalid JSON during editing
                }
              }}
              rows={6}
              placeholder='{"key": "value"}'
              className="w-full mt-1 px-3 py-2 border rounded-md font-mono text-sm bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hide_errors}
              onChange={(e) => setFormData({ ...formData, hide_errors: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-theme-700 dark:text-theme-300">隐藏错误</span>
          </label>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-theme-200 dark:border-theme-700">
            {widget && (
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
