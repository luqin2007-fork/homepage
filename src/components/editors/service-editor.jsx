import { useState } from "react";
import { MdClose, MdSave, MdDelete } from "react-icons/md";

export default function ServiceEditor({ service, groupName, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    name: service?.name || "",
    href: service?.href || "",
    icon: service?.icon || "",
    description: service?.description || "",
    localHref: service?.localHref || "",
    localIcon: service?.localIcon || "",
    protected: service?.protected || false,
    ...(service?.widget ? { widget: service.widget } : {}),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const action = service ? "update" : "add";
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "services",
          action,
          group: groupName,
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
    if (!confirm(`确定要删除服务 "${formData.name}" 吗？`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "services",
          action: "delete",
          group: groupName,
          item: { name: formData.name },
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
            {service ? "编辑服务" : "添加服务"}
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
            <label className="text-sm text-theme-700 dark:text-theme-300">名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={!!service}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">链接 *</label>
            <input
              type="url"
              value={formData.href}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              required
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            />
          </div>

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">图标</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="图标名称或 URL"
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            />
          </div>

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">描述</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            />
          </div>

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">局域网链接</label>
            <input
              type="text"
              value={formData.localHref}
              onChange={(e) => setFormData({ ...formData, localHref: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            />
          </div>

          <div>
            <label className="text-sm text-theme-700 dark:text-theme-300">局域网图标</label>
            <input
              type="text"
              value={formData.localIcon}
              onChange={(e) => setFormData({ ...formData, localIcon: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.protected}
              onChange={(e) => setFormData({ ...formData, protected: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-theme-700 dark:text-theme-300">需要登录</span>
          </label>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-theme-200 dark:border-theme-700">
            {service && (
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
