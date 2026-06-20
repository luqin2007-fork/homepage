import { Disclosure, Transition } from "@headlessui/react";
import classNames from "classnames";
import List from "components/bookmarks/list";
import ErrorBoundary from "components/errorboundry";
import ResolvedIcon from "components/resolvedicon";
import BookmarkEditor from "components/editors/bookmark-editor";
import { useContext, useEffect, useRef, useState } from "react";
import { MdAdd, MdKeyboardArrowDown } from "react-icons/md";
import { EditModeContext } from "utils/contexts/editmode";

export default function BookmarksGroup({
  bookmarks,
  layout,
  disableCollapse,
  groupsInitiallyCollapsed,
  bookmarksStyle,
  maxGroupColumns,
  isAuthenticated,
}) {
  const { editMode } = useContext(EditModeContext);
  const [showAddEditor, setShowAddEditor] = useState(false);
  const panel = useRef();

  useEffect(() => {
    if (layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) panel.current.style.height = `0`;
  }, [layout, groupsInitiallyCollapsed]);

  return (
    <div
      key={bookmarks.name}
      className={classNames(
        "bookmark-group flex-1 overflow-hidden",
        layout?.style === "row" ? "basis-full" : `basis-full md:basis-1/${maxGroupColumns ? maxGroupColumns : 4} lg:basis-1/${maxGroupColumns ? maxGroupColumns : 5} xl:basis-1/${maxGroupColumns ? maxGroupColumns : 6}`,
        layout?.style !== "row" && maxGroupColumns && parseInt(maxGroupColumns, 10) > 6
          ? `3xl:basis-1/${maxGroupColumns}`
          : "",
        layout?.header === false ? "px-1" : "p-1 pb-0",
      )}
    >
      <Disclosure defaultOpen={!(layout?.initiallyCollapsed ?? groupsInitiallyCollapsed)}>
        {({ open }) => (
          <>
            {layout?.header !== false && (
              <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
                {layout?.icon && (
                  <div className="shrink-0 mr-2 w-7 h-7 bookmark-group-icon">
                    <ResolvedIcon icon={layout.icon} />
                  </div>
                )}
                <h2 className="text-theme-800 dark:text-theme-300 text-xl font-medium bookmark-group-name">
                  {layout.name ?? bookmarks.name}
                </h2>
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddEditor(true);
                    }}
                    className="ml-2 p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="添加书签"
                  >
                    <MdAdd className="w-4 h-4" />
                  </button>
                )}
                <MdKeyboardArrowDown
                  className={classNames(
                    disableCollapse ? "hidden" : "",
                    "transition-all opacity-0 group-hover:opacity-100 ml-auto text-theme-800 dark:text-theme-300 text-xl",
                    open ? "" : "rotate-180",
                  )}
                />
              </Disclosure.Button>
            )}
            <Transition
              // Otherwise the transition group does display: none and cancels animation
              className="block!"
              unmount={false}
              beforeLeave={() => {
                panel.current.style.height = `${panel.current.scrollHeight}px`;
                setTimeout(() => {
                  panel.current.style.height = `0`;
                }, 1);
              }}
              beforeEnter={() => {
                panel.current.style.height = `0px`;
                setTimeout(() => {
                  panel.current.style.height = `${panel.current.scrollHeight}px`;
                }, 1);
              }}
            >
              <Disclosure.Panel className="transition-all overflow-hidden duration-300 ease-out" ref={panel} static>
                <ErrorBoundary>
                  <List bookmarks={bookmarks.bookmarks} layout={layout} bookmarksStyle={bookmarksStyle} isAuthenticated={isAuthenticated} groupName={bookmarks.name} />
                </ErrorBoundary>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>

      {showAddEditor && (
        <BookmarkEditor
          groupName={bookmarks.name}
          onClose={() => setShowAddEditor(false)}
        />
      )}
    </div>
  );
}
