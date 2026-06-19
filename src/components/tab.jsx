import classNames from "classnames";
import { useContext } from "react";
import { TabContext } from "utils/contexts/tab";

function slugify(tabName) {
  return tabName.toString().replace(/\s+/g, "-").toLowerCase();
}

export function slugifyAndEncode(tabName) {
  return tabName !== undefined ? encodeURIComponent(slugify(tabName)) : "";
}

export default function Tab({ tab, isBookmarkTab }) {
  const { activeTab, setActiveTab, activeBookmarkTab, setActiveBookmarkTab } = useContext(TabContext);

  const matchesTab = isBookmarkTab
    ? decodeURIComponent(activeBookmarkTab) === slugify(tab)
    : decodeURIComponent(activeTab) === slugify(tab);

  const handleClick = () => {
    if (isBookmarkTab) {
      setActiveBookmarkTab(slugifyAndEncode(tab));
    } else {
      setActiveTab(slugifyAndEncode(tab));
      window.location.hash = `#${slugifyAndEncode(tab)}`;
    }
  };

  return (
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
        onClick={handleClick}
      >
        {tab}
      </button>
    </li>
  );
}
