import { useState } from 'react';
import { useTranslation } from "next-i18next";

export default function PasswordPrompt({ type, tab, onClose, onSuccess }) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const _onClose = () => {
    setPassword('');
    setError('');
    onClose();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError(t('__other.tab_password.inputPassword'));
      return;
    }

    try {
      const res = await fetch(`/api/config/validateTab?type=${type}&tab=${tab}&password=${password}`);
      const result = (await res.json()).result;
      console.log(result)

      if (result) {
        _onClose();
        onSuccess();
      } else {
        setError(t('__other.tab_password.passwordError'));
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div
      className="relative z-40 ease-in-out duration-300 transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-500 opacity-50" />
      <div className="fixed inset-0 z-20 overflow-y-auto">
        <div className="flex min-h-full min-w-full items-start justify-center text-center">
          <dialog className="mt-[10%] mx-auto max-w-[90%] md:max-w-[40%] rounded-md p-0 block font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-50 dark:bg-theme-800">
            <div className="rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                {t('__other.tab_password.inputPassword')}
              </h3>
              {error && (
                <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-theme-700 dark:text-theme-200 bg-theme-60 dark:bg-theme-800"
                    placeholder={t('__other.tab_password.password')}
                  />
                </div>
                <div className="flex space-x-3 justify-end">
                  <button
                    type="button"
                    onClick={_onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('__other.tab_password.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {t('__other.tab_password.ok')}
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        </div>
      </div>
    </div>



    // <div className="fixed inset-0 flex items-center justify-center z-50 text-theme-700 dark:text-theme-200">

    // </div>
  );
}