import { useState } from 'react'
import Button from '../../Button'
import DisplayDept from './DisplayDept';
import { Search } from "lucide-react";
import PageHeader from '../../PortalComponents/PageHeader';
import BookAppointmentModal from '../DashBoard/BookAppointmentModal';

interface Props {
  searchTerm?: string;
  setSearchTerm?: React.Dispatch<React.SetStateAction<string>>;
}

export default function Department({ searchTerm: controlledSearchTerm, setSearchTerm: setControlledSearchTerm }: Props) {
    const [internalSearchTerm, setInternalSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [showBooking, setShowBooking] = useState(false);
    const searchTerm = controlledSearchTerm ?? internalSearchTerm;
    const setSearchTerm = setControlledSearchTerm ?? setInternalSearchTerm;

  return (
    <div>
        {showBooking && (
          <BookAppointmentModal onClose={() => setShowBooking(false)} />
        )}

        <PageHeader
          title="Departments"
          description="Find the right department for your healthcare needs"
          action={
            <Button
              width="w-full sm:w-[250px]"
              type="button"
              content="Book New Appointment"
              onClick={() => setShowBooking(true)}
            />
          }
        />

        <div className='w-full bg-[#FFFFFF] border border-[#E6E3E3] flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-5 p-5 rounded-xl my-5'>
            <label className="flex-1 min-w-0">
                <span className="block pb-1">Search</span>
                <span className="relative block w-full max-w-xl">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Search color="#605E5E" size={18} />
                    </span>
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search condition, department..."
                        className="h-10 w-full rounded-lg border border-[#E7E4E4] pl-10 pr-4 text-sm focus:outline-none focus:border-[#28574E]"
                    />
                </span>
            </label>
            <label className="flex flex-col w-full sm:w-40">
                <span className="pb-1">Filter</span>
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
            </label>
        </div>

        <div>
            <DisplayDept searchTerm={searchTerm} selectedCategory={selectedCategory} />
        </div>
    </div>
  )
}
