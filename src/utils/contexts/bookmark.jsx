import { createContext, useMemo, useState } from "react";

export const BookmarkContext = createContext();

export function BookmarkProvider({ initial, children }) {
    const [bookmark, setBookmark] = useState(false);
    const [isSublistDialogShow, setSublistDialogShow] = useState(false);

    const value = useMemo(() => ({ bookmark, setBookmark, isSublistDialogShow, setSublistDialogShow }), [bookmark, isSublistDialogShow]);

    return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}
