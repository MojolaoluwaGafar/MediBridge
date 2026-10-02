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
    <div
      className='grid gap-2 sm:gap-5 border p-2 sm:p-4 rounded-lg bg-[#FFFFFF] border-[#E7E4E4] mt-8 w-full max-w-173.5'
      style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
    >
        {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`text-sm sm:text-[18px] font-semibold flex flex-wrap gap-x-1 min-h-11 px-2 py-1 items-center justify-center text-center leading-tight transition rounded-md
          ${
            activeTab === tab.key
              ? "bg-[#28574E] text-white"
              : "text-[#605E5E] bg-[#F7F4F4] hover:bg-gray-100"
          }`}
        >
          <span>{tab.label}</span> <span>({tab.appointment})</span>
        </button>
      ))}
    </div>
  )
}