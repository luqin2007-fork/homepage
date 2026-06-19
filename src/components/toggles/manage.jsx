import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { MdDisplaySettings } from "react-icons/md";

export default function Manage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (session) {
      // TODO: 跳转管理页面
    } else {
      router.push("/auth/signin?callbackUrl=/");
    }
  };

  return (
    <div id="manage" className="rounded-full flex align-middle self-center mr-3">
      <MdDisplaySettings
        onClick={handleClick}
        className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer"
        title="管理"
        aria-label="管理"
      />
    </div>
  );
}
