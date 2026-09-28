import React from 'react'

export interface Tab {
    key: string;
    label: string;
    appointment : number,
}

type Props = {
    tabs : Tab[],
    activeTab : string
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

export default function Tabs({
    tabs,
    activeTab,
    setActiveTab
}: Props) { 
  return (
    <div className='flex justify-between gap-5 border p-4 rounded-lg bg-[#FFFFFF] border-[#E7E4E4] mt-8 w-173.5'>
        {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`text-[18px] font-semibold flex gap-2 w-52.5 h-11 items-center justify-center pl-5 transition rounded-md
          ${
            activeTab === tab.key
              ? "bg-[#28574E] text-white"
              : "text-[#605E5E] bg-[#F7F4F4] hover:bg-gray-100"
          }`}
        >
          {tab.label} ({tab.appointment})
        </button>
      ))}
    </div>
  )
}