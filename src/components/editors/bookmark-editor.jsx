import { useCallback, useEffect, useState } from "react";
import { MdClose, MdSave, MdDelete, MdAdd, MdChevronRight, MdExpandMore, MdBookmark, MdFolder, MdArrowForward } from "react-icons/md";

function BookmarkTree({ nodes, onSelect, level = 0 }) {
  const [expanded, setExpanded] = useState({});

  const toggle = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!nodes || nodes.length === 0) return null;

  return (
    <ul className={level > 0 ? "ml-4" : ""}>
      {nodes.map((node, index) => {
        const key = `${level}-${index}`;
        const isFolder = node.type === "folder";

        return (
          <li key={key}>
            <div
              className="flex items-center gap-1 py-1 px-2 hover:bg-theme-200 dark:hover:bg-theme-600 rounded cursor-pointer text-sm"
              onClick={() => {
                if (isFolder) {
                  toggle(key);
                } else {
                  onSelect(node);
                }
              }}
            >
              {isFolder ? (
                <>
                  {expanded[key] ? (
                    <MdExpandMore className="w-4 h-4 shrink-0 text-theme-500" />
                  ) : (
                    <MdChevronRight className="w-4 h-4 shrink-0 text-theme-500" />
                  )}
                  <MdFolder className="w-4 h-4 shrink-0 text-yellow-500" />
                </>
              ) : (
                <>
                  <span className="w-4" />
                  <MdBookmark className="w-4 h-4 shrink-0 text-blue-500" />
                </>
              )}
              <span className="truncate text-theme-700 dark:text-theme-200">
                {node.name}
              </span>
            </div>
            {isFolder && expanded[key] && (
              <BookmarkTree
                nodes={node.children}
                onSelect={onSelect}
                level={level + 1}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function BookmarkEditor({ bookmark, groupName, onClose, onSave, onDelete, sublistOnly = false }) {
  const [formData, setFormData] = useState({
    name: bookmark?.name || "",
    href: bookmark?.href || "",
    icon: bookmark?.icon || "",
    description: bookmark?.description || "",
    abbr: bookmark?.abbr || "",
    protected: bookmark?.protected || false,
  });

  const [sublist, setSublist] = useState(() => {
    if (bookmark?.sublist && typeof bookmark.sublist === "object") {
      return Object.entries(bookmark.sublist).map(([name, data]) => ({
        name,
        href: data?.href || "",
        icon: data?.icon || "",
        description: data?.description || "",
      }));
    }
    return [];
  });

  const [browserBookmarks, setBrowserBookmarks] = useState([]);
  const [browserName, setBrowserName] = useState(null);
  const [loadingBrowser, setLoadingBrowser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addTarget, setAddTarget] = useState("main"); // "main" or "sublist"

  const fetchBrowserBookmarks = useCallback(async () => {
    setLoadingBrowser(true);
    try {
      const res = await fetch("/api/admin/bookmarks-browser");
      if (res.ok) {
        const data = await res.json();
        setBrowserBookmarks(data.bookmarks || []);
        setBrowserName(data.browser);
      }
    } catch (err) {
      console.error("Failed to fetch browser bookmarks:", err);
    } finally {
      setLoadingBrowser(false);
    }
  }, []);

  useEffect(() => {
    fetchBrowserBookmarks();
  }, [fetchBrowserBookmarks]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadingBrowser(true);
    try {
      const text = await file.text();
      const isHtml = file.name.endsWith(".html") || file.name.endsWith(".htm");

      const res = await fetch("/api/admin/bookmarks-browser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: text, format: isHtml ? "html" : "json" }),
      });

      if (res.ok) {
        const data = await res.json();
        setBrowserBookmarks(data.bookmarks || []);
        setBrowserName(data.browser || "uploaded");
      }
    } catch (err) {
      console.error("Failed to parse bookmarks file:", err);
    } finally {
      setLoadingBrowser(false);
    }
  };

  const handleBrowserSelect = (node) => {
    if (addTarget === "main") {
      setFormData({
        ...formData,
        name: formData.name || node.name,
        href: node.url,
      });
    } else {
      setSublist([...sublist, {
        name: node.name,
        href: node.url,
        icon: "",
        description: "",
      }]);
    }
  };

  const addSublistItem = () => {
    setSublist([...sublist, { name: "", href: "", icon: "", description: "" }]);
  };

  const updateSublistItem = (index, field, value) => {
    const updated = [...sublist];
    updated[index] = { ...updated[index], [field]: value };
    setSublist(updated);
  };

  const removeSublistItem = (index) => {
    setSublist(sublist.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const action = bookmark ? "update" : "add";
      const submitData = { ...formData };

      if (sublist.length > 0) {
        submitData.sublist = {};
        for (const item of sublist) {
          if (item.name && item.href) {
            submitData.sublist[item.name] = {
              href: item.href,
              ...(item.icon && { icon: item.icon }),
              ...(item.description && { description: item.description }),
            };
          }
        }
      }

      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bookmarks",
          action,
          group: groupName,
          item: submitData,
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
    if (!confirm(`确定要删除书签 "${formData.name}" 吗？`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bookmarks",
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
      <div className="bg-theme-50 dark:bg-theme-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme-200 dark:border-theme-700">
          <h2 className="text-lg font-semibold text-theme-800 dark:text-theme-200">
            {bookmark ? "编辑书签" : "添加书签"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-theme-500 hover:text-theme-700 dark:hover:text-theme-300"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Two columns */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left panel - Form */}
          <div className="w-1/2 border-r border-theme-200 dark:border-theme-700 overflow-y-auto p-4 space-y-4">
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
                disabled={!!bookmark}
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
              <label className="text-sm text-theme-700 dark:text-theme-300">缩写</label>
              <input
                type="text"
                value={formData.abbr}
                onChange={(e) => setFormData({ ...formData, abbr: e.target.value })}
                placeholder="用于无图标时显示"
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

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.protected}
                onChange={(e) => setFormData({ ...formData, protected: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-theme-700 dark:text-theme-300">需要登录</span>
            </label>

            {/* Sublist Section */}
            <div className="border-t border-theme-200 dark:border-theme-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-theme-700 dark:text-theme-300">
                  二级菜单 (Sublist)
                </label>
                <button
                  type="button"
                  onClick={addSublistItem}
                  className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 flex items-center gap-1"
                >
                  <MdAdd className="w-3 h-3" />
                  添加
                </button>
              </div>

              {sublist.length === 0 ? (
                <p className="text-xs text-theme-500 dark:text-theme-400">
                  暂无二级菜单项
                </p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {sublist.map((item, index) => (
                    <div key={index} className="p-3 bg-theme-100 dark:bg-theme-700 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-theme-500 dark:text-theme-400">
                          项 {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSublistItem(index)}
                          className="p-1 text-red-500 hover:text-red-600"
                        >
                          <MdDelete className="w-3 h-3" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateSublistItem(index, "name", e.target.value)}
                        placeholder="名称 *"
                        required
                        className="w-full px-2 py-1 border rounded text-sm bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
                      />
                      <input
                        type="url"
                        value={item.href}
                        onChange={(e) => updateSublistItem(index, "href", e.target.value)}
                        placeholder="链接 *"
                        required
                        className="w-full px-2 py-1 border rounded text-sm bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
                      />
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => updateSublistItem(index, "icon", e.target.value)}
                        placeholder="图标"
                        className="w-full px-2 py-1 border rounded text-sm bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
                      />
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateSublistItem(index, "description", e.target.value)}
                        placeholder="描述"
                        className="w-full px-2 py-1 border rounded text-sm bg-theme-50 dark:bg-theme-800 border-theme-300 dark:border-theme-600 text-theme-700 dark:text-theme-200"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right panel - Browser bookmarks */}
          <div className="w-1/2 overflow-y-auto p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-theme-700 dark:text-theme-300 mb-2">
                浏览器书签
              </h3>
              {browserName ? (
                <p className="text-xs text-theme-500 dark:text-theme-400">
                  来源: {browserName}
                </p>
              ) : (
                <div className="text-xs text-theme-500 dark:text-theme-400">
                  <p className="mb-2">未找到浏览器书签文件</p>
                  <p className="mb-2">获取书签的方式：</p>
                  <ul className="list-disc list-inside mb-3 space-y-1">
                    <li>Chrome/Edge: 地址栏输入 <code className="bg-theme-200 dark:bg-theme-600 px-1 rounded">chrome://bookmarks</code> → 右上角 ⋮ → 导出书签</li>
                    <li>Firefox: 书签管理器 → 导入和备份 → 导出书签 → HTML 格式</li>
                  </ul>
                  <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 text-xs">
                    <MdAdd className="w-3 h-3" />
                    上传书签文件
                    <input
                      type="file"
                      accept=".json,.html,.htm"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Add target selector */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-theme-500 dark:text-theme-400">点击书签添加到：</span>
                <button
                  type="button"
                  onClick={() => setAddTarget("main")}
                  className={`px-2 py-1 text-xs rounded ${
                    addTarget === "main"
                      ? "bg-blue-500 text-white"
                      : "bg-theme-200 dark:bg-theme-600 text-theme-700 dark:text-theme-300"
                  }`}
                >
                  主书签
                </button>
                <button
                  type="button"
                  onClick={() => setAddTarget("sublist")}
                  className={`px-2 py-1 text-xs rounded ${
                    addTarget === "sublist"
                      ? "bg-blue-500 text-white"
                      : "bg-theme-200 dark:bg-theme-600 text-theme-700 dark:text-theme-300"
                  }`}
                >
                  二级菜单
                </button>
                <label className="inline-flex items-center gap-1 px-2 py-1 bg-theme-200 dark:bg-theme-600 text-theme-700 dark:text-theme-300 rounded cursor-pointer hover:bg-theme-300 dark:hover:bg-theme-500 text-xs ml-auto">
                  <MdAdd className="w-3 h-3" />
                  更换
                  <input
                    type="file"
                    accept=".json,.html,.htm"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {loadingBrowser ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-theme-400 border-t-transparent rounded-full" />
              </div>
            ) : browserBookmarks.length > 0 ? (
              <div className="border border-theme-200 dark:border-theme-700 rounded-lg p-2 max-h-[60vh] overflow-y-auto">
                <BookmarkTree
                  nodes={browserBookmarks}
                  onSelect={handleBrowserSelect}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-theme-500 dark:text-theme-400 text-sm">
                未找到浏览器书签文件
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between p-4 border-t border-theme-200 dark:border-theme-700">
          {bookmark && (
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
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
            >
              <MdSave className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
