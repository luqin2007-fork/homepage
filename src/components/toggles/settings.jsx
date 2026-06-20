import { useState } from "react";
import { MdSettings } from "react-icons/md";
import SettingsEditor from "components/editors/settings-editor";

export default function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        id="settings"
        className="rounded-full flex align-middle self-center mr-3"
        onClick={() => setIsOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(true)}
      >
        <MdSettings
          className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
          title="设置"
          aria-label="设置"
        />
      </div>

      {isOpen && <SettingsEditor onClose={() => setIsOpen(false)} />}
    </>
  );
}
