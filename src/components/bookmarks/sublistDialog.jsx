import classNames from "classnames";
import ResolvedIcon from "components/resolvedicon";
import { useContext, useEffect, useRef, useState } from 'react'
import { BookmarkContext } from 'utils/contexts/bookmark'
import { SettingsContext } from "utils/contexts/settings";

export default function SublistDialog() {
  const { bookmark, isSublistDialogShow, setSublistDialogShow } = useContext(BookmarkContext)
  const { settings } = useContext(SettingsContext);

  const [currentItemIndex, setCurrentItemIndex] = useState(null);

  const sublist = bookmark ? [bookmark, ...Object.keys(bookmark.sublist).map((k) => ({ name: k, ...bookmark.sublist[k] }))] : [];

  const closeAndReset = () => {
    setSublistDialogShow(false);
    setTimeout(() => setCurrentItemIndex(null), 200); // delay a little for animations
  };

  const handleItemHover = (event) => {
    setCurrentItemIndex(parseInt(event.target?.dataset?.index, 10));
  }

  const handleItemClick = (event) => {
    event.preventDefault();
    closeAndReset();
    window.open(sublist[currentItemIndex].href, event.metaKey ? "_blank" : (settings.target ?? "_blank"), "noreferrer");
  }

  const dialogRef = useRef(null);

  useEffect(() => {
    if (isSublistDialogShow && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isSublistDialogShow]);

  return (
    <div
      className={classNames(
        "relative z-40 ease-in-out duration-300 transition-opacity",
        !isSublistDialogShow && "hidden",
        isSublistDialogShow && "opacity-100",
        !isSublistDialogShow && "opacity-0",
      )}
      role="dialog"
      aria-modal="true"
      onClick={closeAndReset}
    >
      <div className="fixed inset-0 bg-gray-500 opacity-50" />
      <div className="fixed inset-0 z-20 overflow-y-auto">
        <div className="flex min-h-full min-w-full items-start justify-center text-center">
          <dialog className="mt-[10%] mx-auto min-w-[90%] max-w-[90%] md:min-w-[40%] md:max-w-[40%] rounded-md p-0 block font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-50 dark:bg-theme-800">
            <ul className="max-h-[60vh] overflow-y-auto m-2">
              {sublist.map((b, i) => (
                <li key={[b.name, b.href].filter((s) => s).join("-")}>
                  <button
                    type="button"
                    data-index={i}
                    onMouseEnter={handleItemHover}
                    onClick={handleItemClick}
                    className={classNames(
                      "flex flex-row w-full items-center justify-between rounded-md text-sm md:text-xl py-2 px-4 cursor-pointer text-theme-700 dark:text-theme-200",
                      i === currentItemIndex && "bg-theme-300/50 dark:bg-theme-700/50",
                    )}
                    title={b.description ?? b.href}
                  >
                    <div className="flex flex-row flex-none items-center mr-4 pointer-events-none">
                      <div className="w-5 text-xs mr-4">
                        {b.abbr ? b.abbr : <ResolvedIcon icon={b.icon ?? `https://favicon.pub/api/${getHost(b.href)}`} />}
                      </div>
                      <div className="flex flex-col md:flex-row flex-none text-left items-baseline mr-4 pointer-events-none">
                        <span className="mr-4">{b.name}</span>
                        <span className="text-xs text-theme-600 text-light">{b.description ?? b.href}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </dialog>
        </div>
      </div>
    </div>
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