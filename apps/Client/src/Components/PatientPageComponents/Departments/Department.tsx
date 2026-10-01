import { useState } from 'react'
import Button from '../../Button'
import DisplayDept from './DisplayDept';
import PageHeader from '../../PortalComponents/PageHeader';
import SearchFilterBar, { type FilterOption } from '../../PortalComponents/SearchFilterBar';
import BookAppointmentModal from '../DashBoard/BookAppointmentModal';

const CATEGORY_OPTIONS: FilterOption[] = [
  "All",
  "Medical",
  "Surgical",
  "Diagnostics",
  "Mental Health",
  "Emergency",
  "Women & Children",
].map((category) => ({ value: category, label: category }));

interface Props {
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
}

export default function Department({ searchTerm: controlledSearchTerm, setSearchTerm: setControlledSearchTerm }: Props) {
    const [internalSearchTerm, setInternalSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [showBooking, setShowBooking] = useState(false);
    const searchTerm = controlledSearchTerm ?? internalSearchTerm;
    const setSearchTerm = setControlledSearchTerm ?? setInternalSearchTerm;

  return (
    <div>
        {showBooking && <BookAppointmentModal onClose={() => setShowBooking(false)} />}

        <PageHeader
          title="Departments"
          description="Find the right department for your healthcare needs"
          action={
            <Button
              type="button"
              width="w-full sm:w-[250px]"
              content="Book New Appointment"
              onClick={() => setShowBooking(true)}
            />
          }
        />

        <SearchFilterBar
          search={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search condition, department..."
          filter={selectedCategory}
          onFilterChange={setSelectedCategory}
          filterOptions={CATEGORY_OPTIONS}
        />

        <div>
            <DisplayDept searchTerm={searchTerm} selectedCategory={selectedCategory} />
        </div>
    </div>
  )
}
