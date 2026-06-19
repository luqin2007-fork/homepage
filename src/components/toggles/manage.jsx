import { useSession } from "next-auth/react";
import { MdDisplaySettings } from "react-icons/md";

export default function Manage() {
  const { data: session } = useSession();

  const handleClick = () => {
    console.log("Manage clicked, session:", session);
    if (!session) {
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
    }
  };

  return (
    <div
      id="manage"
      className="rounded-full flex align-middle self-center mr-3"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      <MdDisplaySettings
        className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
        title="管理"
        aria-label="管理"
      />
    </div>
  );
}
