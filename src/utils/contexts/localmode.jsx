import { createContext, useMemo, useState } from "react";

export const LocalModeContext = createContext();

export function LocalModeProvider({ initial, children }) {
    const [localMode, setLocalMode] = useState(false);

    const value = useMemo(() => ({ localMode, setLocalMode }), [localMode]);

    return <LocalModeContext.Provider value={value}>{children}</LocalModeContext.Provider>;
}
