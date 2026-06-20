import { useContext } from "react";
import { MdEdit, MdEditOff } from "react-icons/md";
import { EditModeContext } from "utils/contexts/editmode";

export default function EditModeToggle() {
  const { editMode, setEditMode } = useContext(EditModeContext);

  return (
    <div
      id="editMode"
      className="rounded-full flex align-middle self-center mr-3"
      onClick={() => setEditMode(!editMode)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setEditMode(!editMode)}
    >
      {editMode ? (
        <MdEditOff
          className="text-blue-500 w-6 h-6 cursor-pointer"
          title="退出编辑模式"
          aria-label="退出编辑模式"
        />
      ) : (
        <MdEdit
          className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
          title="编辑模式"
          aria-label="编辑模式"
        />
      )}
    </div>
  );
}
