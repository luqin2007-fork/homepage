import { createContext, useMemo, useState } from "react";

export const EditModeContext = createContext();

export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(false);

  const value = useMemo(() => ({ editMode, setEditMode }), [editMode]);

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}
