import classNames from "classnames";
import ResolvedIcon from "components/resolvedicon";
import { useContext } from "react";
import { BookmarkContext } from "utils/contexts/bookmark";
import { SettingsContext } from "utils/contexts/settings";

export default function Item({ bookmark, iconOnly = false }) {
  const description = bookmark.description ?? new URL(bookmark.href).hostname;
  const { settings } = useContext(SettingsContext);
  const { setBookmark, setSublistDialogShow } = useContext(BookmarkContext);

  const showSublistDialog = (ev) => {
    if (bookmark.sublist) {
      ev.preventDefault();
      ev.stopPropagation();
      setBookmark(bookmark);
      setSublistDialogShow(true);
    }
  }

  return (
    <li
      key={bookmark.name}
      id={bookmark.id}
      className={classNames("bookmark", iconOnly && "grid")}
      data-name={bookmark.name}
    >
      <a
        href={bookmark.href}
        title={bookmark.name}
        rel="noreferrer"
        target={bookmark.target ?? settings.target ?? "_blank"}
        className={classNames(
          settings.cardBlur !== undefined && `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
          "text-left cursor-pointer transition-all rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10",
          iconOnly ? "h-[60px] w-[60px] grid" : "block w-full mb-3",
        )}
      >
        {iconOnly ? (
          <div className="flex items-center justify-center text-theme-700 hover:text-theme-700 dark:text-theme-200 text-xl font-medium rounded-md bookmark-icon py-0.5" onClick={showSublistDialog}>
            {bookmark.icon && (
              <div className="w-7 h-7">
                <ResolvedIcon icon={bookmark.icon} alt={bookmark.abbr} />
              </div>
            )}
            {!bookmark.icon && bookmark.abbr}
          </div>
        ) : (
          <div className="flex">
            <div className="shrink-0 flex items-center justify-center w-11 bg-theme-500/10 dark:bg-theme-900/50 text-theme-700 hover:text-theme-700 dark:text-theme-200 text-sm font-medium rounded-l-md bookmark-icon" onClick={showSublistDialog}>
              {bookmark.icon && (
                <div className="shrink-0 w-5 h-5">
                  <ResolvedIcon icon={bookmark.icon} alt={bookmark.abbr} />
                </div>
              )}
              {!bookmark.icon && bookmark.abbr}
              {!bookmark.icon && !bookmark.abbr && (
                <div className="shrink-0 w-5 h-5">
                  <ResolvedIcon icon={`https://favicon.pub/api/${getHost(bookmark.href)}`} alt={bookmark.abbr} />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden flex items-center justify-between rounded-r-md bookmark-text">
              <div className="pl-3 py-2 text-xs bookmark-name">{bookmark.name}</div>
              {bookmark.sublist ?
                (
                  <div className="flex items-center justify-end shrink truncate" onClick={showSublistDialog}>
                    <div className="flex-1 truncate pl-2 py-2 text-theme-500 dark:text-theme-300 text-xs bookmark-description">
                      {description}
                    </div>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" className="shrink-0 pr-1 inline transition-all text-theme-800 dark:text-theme-300 text-xl" height="0.8em" width="0.8em" xmlns="http://www.w3.org/2000/svg" onClick={showSublistDialog}>
                      <path d="M938.666667 128H298.666667c-29.44 0-52.693333 14.933333-68.053334 37.546667L0 511.786667l230.613333 346.24c15.36 22.613333 41.386667 37.973333 70.826667 37.973333H938.666667c47.146667 0 85.333333-38.186667 85.333333-85.333333V213.333333c0-47.146667-38.186667-85.333333-85.333333-85.333333zM384 576c-35.413333 0-64-28.586667-64-64s28.586667-64 64-64 64 28.586667 64 64-28.586667 64-64 64z m213.333333 0c-35.413333 0-64-28.586667-64-64s28.586667-64 64-64 64 28.586667 64 64-28.586667 64-64 64z m213.333334 0c-35.413333 0-64-28.586667-64-64s28.586667-64 64-64 64 28.586667 64 64-28.586667 64-64 64z" p-id="4818"></path>
                    </svg>
                  </div>
                ) :
                (
              <div className="shrink truncate px-2 py-2 text-theme-500 dark:text-theme-300 text-xs bookmark-description">
                {description}
              </div>
                )}
            </div>
          </div>
        )}
      </a>
    </li>
  );
}

function getHost(url) {
  if (url.includes('//')) {
    url = url.substring(url.indexOf('//') + 2);
  }
  if (url.includes('/')) {
    url = url.substring(0, url.indexOf('/'));
  }
  return url;
}