import { MdDisplaySettings } from "react-icons/md";

export default function Manage({ setManageDialogShow }) {
  return (
    <div id="manage" className="rounded-full flex align-middle self-center mr-3">
      <MdDisplaySettings onClick={() => setManageDialogShow(true)} className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer" />
    </div>
  );
}
