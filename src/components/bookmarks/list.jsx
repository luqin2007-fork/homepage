import classNames from "classnames";
import Item from "components/bookmarks/item";

import { columnMap } from "../../utils/layout/columns";

export default function List({ bookmarks, layout, bookmarksStyle, isAuthenticated }) {
  const filteredBookmarks = bookmarks.filter((bookmark) => !bookmark.protected || isAuthenticated);
  
  let classes = layout?.style === "row" ? `grid ${columnMap[layout?.columns]} gap-x-2` : "flex flex-col bookmark-list";
  // 子项过多时显示两列
  if (filteredBookmarks.length >= 5) classes = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-2 mb-2 mt-3 bookmark-list' 
  const style = {};
  if (layout?.iconsOnly || bookmarksStyle === "icons") {
    classes = "grid gap-2 bookmark-list";
    style.gridTemplateColumns = "repeat(auto-fill, minmax(60px, 1fr))";
  }
  return (
    <ul className={classNames(classes, "mb-2", layout?.header === false ? "" : "mt-3")} style={style}>
      {filteredBookmarks.map((bookmark) => (
        <Item
          key={`${bookmark.name}-${bookmark.href}`}
          bookmark={bookmark}
          iconOnly={layout?.iconsOnly || bookmarksStyle === "icons"}
        />
      ))}
    </ul>
  );
}
