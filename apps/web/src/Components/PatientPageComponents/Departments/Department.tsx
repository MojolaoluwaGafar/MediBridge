import { useState } from 'react'
import Button from '../../Button'
import DisplayDept from './DisplayDept';
import { Search } from "lucide-react";

interface Props {
  searchTerm?: string;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
}

export default function Department({ searchTerm: controlledSearchTerm, setSearchTerm: setControlledSearchTerm }: Props) {
    const [internalSearchTerm, setInternalSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const searchTerm = controlledSearchTerm ?? internalSearchTerm;
    const setSearchTerm = setControlledSearchTerm ?? setInternalSearchTerm;

  return (
    <div className='relative'>
        <h1 className="fontOutfit font-semibold text-[24px]">Departments</h1>
        <p className="text-[#707070] text-[16px] font-light">Find the right department for your healthcare needs</p>
        
        <Button width="w-[250px]"
        className="absolute right-0 top-0" type="button"
        content="Book New Appointment"
        />

        <div className='w-full bg-[#FFFFFF] border border-[#E6E3E3] flex justify-between gap-5 h-26.5 p-5 rounded-xl my-5'>
             <div className="w-full">
                <p>Search</p>
            <div className="relative w-full max-w-md lg:max-w-xl">
            <span className="absolute left-3 top-5 -translate-y-1/2">
              <Search color="#605E5E" size={18} />
            </span>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search condition, department..."
              className="h-10 w-full rounded-lg border border-[#E7E4E4] pl-10 pr-4 text-sm focus:outline-none"
            />
             </div>
          </div>
             <div className="flex flex-col w-40">
                <p>Filter</p>
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-[#E6E3E3] h-10 rounded-md px-2"
                >
                    <option value="All">All</option>
                    <option value="Medical">Medical</option>
                    <option value="Surgical">Surgical</option>
                    <option value="Diagnostics">Diagnostics</option>
                    <option value="Mental Health">Mental Health</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Women & Children">Women & Children</option>
                </select>
            </div>
        </div>

        <div>
            <DisplayDept searchTerm={searchTerm} selectedCategory={selectedCategory} />
        </div>
    </div>
  )
}
