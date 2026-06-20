import { useCallback, useEffect, useRef, useState } from "react";
import { MdUndo } from "react-icons/md";

export default function UndoButton() {
  const [backups, setBackups] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/undo");
      if (res.ok) {
        const data = await res.json();
        setBackups(data);
      }
    } catch (error) {
      console.error("Failed to fetch backups:", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBackups();
    }
  }, [isOpen, fetchBackups]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRestore = async (backupId) => {
    if (!confirm(`确定要恢复到备份 ${backupId} 吗？当前配置将被覆盖。`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupId }),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(`恢复失败: ${data.error}`);
      }
    } catch (error) {
      alert(`恢复失败: ${error.message}`);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        id="undo"
        className="rounded-full flex align-middle self-center mr-3"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(!isOpen)}
      >
        <MdUndo
          className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
          title="撤销"
          aria-label="撤销"
        />
      </div>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 max-h-80 overflow-y-auto bg-theme-50 dark:bg-theme-800 rounded-lg shadow-lg border border-theme-200 dark:border-theme-700 z-50">
          <div className="p-2 text-sm font-medium text-theme-700 dark:text-theme-300 border-b border-theme-200 dark:border-theme-700">
            备份历史
          </div>
          {backups.length === 0 ? (
            <div className="p-3 text-sm text-theme-500 dark:text-theme-400">
              暂无备份
            </div>
          ) : (
            <ul>
              {backups.map((backup) => (
                <li
                  key={backup.id}
                  className="border-b border-theme-100 dark:border-theme-700 last:border-0"
                >
                  <button
                    className="w-full text-left px-3 py-2 hover:bg-theme-100 dark:hover:bg-theme-700 transition-colors"
                    onClick={() => handleRestore(backup.id)}
                    disabled={loading}
                  >
                    <div className="text-sm font-medium text-theme-700 dark:text-theme-200">
                      {backup.id}
                    </div>
                    <div className="text-xs text-theme-500 dark:text-theme-400">
                      {backup.files.join(", ")}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
