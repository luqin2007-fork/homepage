import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { MdLanguage, MdRouter } from "react-icons/md";
import { LocalModeContext } from "utils/contexts/localmode";

export default function LocalModeToggle() {
  const { localMode, setLocalMode } = useContext(LocalModeContext);
  const { t } = useTranslation();

  return (
    <div id="localMode" className="rounded-full flex align-middle self-center mr-3">
      { localMode ? (
        <MdRouter
          onClick={() => setLocalMode(false)}
          className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
          title={t('__other.localMode.localMode')}
        />
      ) : (
        <MdLanguage
          onClick={() => setLocalMode(true)}
          className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
          title={t('__other.localMode.webMode')}
        />
      ) }
    </div>
  );
}
