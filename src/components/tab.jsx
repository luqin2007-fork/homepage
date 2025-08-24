import classNames from "classnames";
import { useContext, useState } from "react";
import { TabContext } from "utils/contexts/tab";

import PasswordPrompt from "./PasswordPrompt";

function slugify(tabName) {
  return tabName.toString().replace(/\s+/g, "-").toLowerCase();
}

export function slugifyAndEncode(tabName) {
  return tabName !== undefined ? encodeURIComponent(slugify(tabName)) : "";
}

export default function Tab({ tab, isBookmarkTab }) {
  const { activeTab, setActiveTab, activeBookmarkTab, setActiveBookmarkTab } = useContext(TabContext);

  const matchesTab = isBookmarkTab ? decodeURIComponent(activeBookmarkTab) === slugify(tab) : decodeURIComponent(activeTab) === slugify(tab);

  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const _setActiveTab = () => {
    if (isBookmarkTab) {
        setActiveBookmarkTab(slugifyAndEncode(tab));
      } else {
        setActiveTab(slugifyAndEncode(tab));
        window.location.hash = `#${slugifyAndEncode(tab)}`;
      }
  }

  const handleTabClick = async () => {
    const resHasPassword = await fetch(`/api/config/isTabHasPassword?type=${isBookmarkTab ? "bookmarkTabs" : "serviceTabs"}&tab=${slugifyAndEncode(tab)}`);
    const hasPassword = await resHasPassword.json();

    if (hasPassword.result) {
      setShowPasswordPrompt(true);
    } else {
      _setActiveTab();
    }
  };

  return (
    <>
      <li
        key={tab}
        role="presentation"
        className={classNames("text-theme-700 dark:text-theme-200 relative h-10 w-full rounded-md flex")}
      >
        <button
          id={`${tab}-tab`}
          type="button"
          role="tab"
          aria-controls={`#${tab}`}
          aria-selected={matchesTab ? "true" : "false"}
          className={classNames(
            "w-full rounded-md m-1",
            matchesTab ? "bg-theme-300/20 dark:bg-white/10" : "hover:bg-theme-100/20 dark:hover:bg-white/5",
          )}
          onClick={handleTabClick}
        >
          {tab}
        </button>
      </li>
      {showPasswordPrompt && (
        <PasswordPrompt
          type={isBookmarkTab ? "bookmarkTabs" : "serviceTabs"}
          tab={slugifyAndEncode(tab)}
          onClose={() => setShowPasswordPrompt(false)}
          onSuccess={_setActiveTab}
        />
      )}
    </>
  );
}
