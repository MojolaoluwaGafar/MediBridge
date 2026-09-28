import React from "react";
import Button from "../Components/Button"
import { PiSignOut } from "react-icons/pi";

interface IModal {
    onClose : (e: React.MouseEvent<HTMLButtonElement>)=>void;
    onConfirm : (e: React.MouseEvent<HTMLButtonElement>)=>void

}
export default function LogoutModal({ onClose, onConfirm } : IModal) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md p-6 text-center flex flex-col items-center gap-3">
        <span className="bg-[#FFF1F1] text-[#EE2020] rounded-full h-24.75 w-24.75 flex items-center justify-center">
          <PiSignOut size={30} />
        </span>

        <p className="text-[28px] font-semibold">Confirm Log out</p>
        <p className="text-[20px] text-[#686565]">
          Are you sure you want to log out of your account?
        </p>

        <div className="flex gap-4">
          <Button
            type="button"
            onClick={onConfirm}
            className="text-white bg-[#EE2020] hover:bg-[#b21a1a]"
            content="Log out"
          />
          <button
            type="button"
            onClick={onClose}
            className="w-40 h-13 text-[#A3A2A2] border border-[#A3A2A2] hover:bg-[#d7d7d7] hover:text-[#000000] rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

