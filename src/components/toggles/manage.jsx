import { signOut, useSession } from "next-auth/react";
import { MdLogin, MdLogout } from "react-icons/md";

export default function Manage() {
  const { data: session } = useSession();

  const handleClick = () => {
    if (session) {
      signOut({ callbackUrl: `${window.location.origin}/` });
    } else {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  if (session) {
    return (
      <div
        id="manage"
        className="rounded-full flex align-middle self-center mr-3"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
      >
        <MdLogout
          className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
          title="登出"
          aria-label="登出"
        />
      </div>
    );
  }

  return (
    <div
      id="manage"
      className="rounded-full flex align-middle self-center mr-3"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <MdLogin
        className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
        title="登录"
        aria-label="登录"
      />
    </div>
  );
}
