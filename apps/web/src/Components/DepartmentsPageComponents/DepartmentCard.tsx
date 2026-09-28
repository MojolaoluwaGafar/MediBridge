import type { IDepCard } from '../../types/department'
import Button from '../Button'

export default function DepartmentCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  availableSpecialist,
  field,
  summary,
  onView,
}: IDepCard) {
  return (
    <div className="bg-white border border-[#DDDDDD] w-full lg:max-w-73.25 h-91.75 rounded-[20px] px-4 py-3 relative flex flex-col justify-evenly">
      <span style={{ color: iconColor, backgroundColor: iconBgColor }} className="p-2 rounded-full w-15 h-15 flex items-center justify-center">
        <Icon size={32} />
      </span>
      <span className="flex items-center justify-center bg-[#DCF2EE] w-26 h-7 rounded-[31px] text-[#28574E] absolute right-5 top-5">
        {availableSpecialist} specialties
      </span>
      <h1 className="text-[#28574E] text-[24px] font-semibold pt-2">{field}</h1>
      <p className="text-[#757575] text-[18px] pb-2">{summary}</p>
      <Button type="button" variant="outline" content="View Department" onClick={onView} />
    </div>
  );
}
