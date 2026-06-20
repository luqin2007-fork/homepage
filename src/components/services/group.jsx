import { Disclosure, Transition } from "@headlessui/react";
import classNames from "classnames";
import ResolvedIcon from "components/resolvedicon";
import List from "components/services/list";
import ServiceEditor from "components/editors/service-editor";
import { useContext, useEffect, useRef, useState } from "react";
import { MdAdd, MdKeyboardArrowDown } from "react-icons/md";
import { EditModeContext } from "utils/contexts/editmode";

import { columnMap } from "../../utils/layout/columns";

export default function ServicesGroup({
  group,
  layout,
  maxGroupColumns,
  disableCollapse,
  useEqualHeights,
  groupsInitiallyCollapsed,
  isSubgroup,
  isAuthenticated,
}) {
  const { editMode } = useContext(EditModeContext);
  const [showAddEditor, setShowAddEditor] = useState(false);
  const panel = useRef();

  useEffect(() => {
    if (layout?.initiallyCollapsed ?? groupsInitiallyCollapsed) panel.current.style.height = `0`;
  }, [layout, groupsInitiallyCollapsed]);

  let groupPadding = layout?.header === false ? "px-1" : "p-1 pb-0";
  if (isSubgroup) groupPadding = "";

  return (
    <div
      key={group.name}
      className={classNames(
        "services-group flex-1",
        layout?.style === "row" ? "basis-full" : "basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4",
        layout?.style !== "row" && maxGroupColumns ? `3xl:basis-1/${maxGroupColumns}` : "",
        groupPadding,
        isSubgroup ? "subgroup" : "",
      )}
    >
      <Disclosure defaultOpen={!(layout?.initiallyCollapsed ?? groupsInitiallyCollapsed)}>
        {({ open }) => (
          <>
            {layout?.header !== false && (
              <Disclosure.Button disabled={disableCollapse} className="flex w-full select-none items-center group">
                {layout?.icon && (
                  <div className="shrink-0 mr-2 w-7 h-7 service-group-icon">
                    <ResolvedIcon icon={layout.icon} />
                  </div>
                )}
                <h2 className="flex text-theme-800 dark:text-theme-300 text-xl font-medium service-group-name">
                  {group.name}
                </h2>
                {editMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAddEditor(true);
                    }}
                    className="ml-2 p-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    title="添加服务"
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
                setTimeout(() => {
                  panel.current.style.height = "auto";
                }, 150); // animation is 150ms
              }}
            >
              <Disclosure.Panel className="transition-all overflow-hidden duration-300 ease-out" ref={panel} static>
                <List
                  groupName={group.name}
                  services={group.services}
                  layout={layout}
                  useEqualHeights={layout?.useEqualHeights ?? useEqualHeights}
                  header={layout?.header !== false}
                  isAuthenticated={isAuthenticated}
                />
                {group.groups?.length > 0 && (
                  <div
                    className={`grid ${
                      layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col"
                    } gap-2`}
                  >
                    {group.groups.map((subgroup) => (
                      <ServicesGroup
                        key={subgroup.name}
                        group={subgroup}
                        layout={layout?.[subgroup.name]}
                        maxGroupColumns={maxGroupColumns}
                        disableCollapse={disableCollapse}
                        useEqualHeights={useEqualHeights}
                        groupsInitiallyCollapsed={groupsInitiallyCollapsed}
                        isSubgroup
                      />
                    ))}
                  </div>
                )}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>

      {showAddEditor && (
        <ServiceEditor
          groupName={group.name}
          onClose={() => setShowAddEditor(false)}
        />
      )}
    </div>
  );
}
