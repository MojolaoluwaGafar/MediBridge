import type { ViewDeparmentModal } from '../../types/department'
import Button from '../Button'
import { Check } from "lucide-react"

export default function ViewDepartmentModal({ 
    icon : Icon, 
    field, 
    image, 
    overview, 
    services,
    onClose,
    onBooking
 }: ViewDeparmentModal & { onClose : ()=> void, onBooking : ()=> void}) {
  return (
    <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center h-dvh p-4'>
        <div className='w-120 max-w-full max-h-full overflow-y-auto scrollbar-none relative rounded-lg bg-white'>
      <h1 className='text-[#28574E] text-[26px] sm:text-[32px] font-semibold fontLibre flex items-center gap-2 pt-5 pb-2 pl-5 pr-14'><span>
        <Icon size={32} />
      </span>{field}</h1>
      <button onClick={onClose} aria-label='Close' className='absolute top-1 right-5 sm:right-8 text-[#605E5E] text-[32px]' type='button'>x</button>
      <div className='w-full h-0.5 bg-[#E7E4E4]'></div>
      <div className='p-5 flex flex-col gap-3'>
        {image && <img className='rounded-[15px] h-54.25 w-full object-cover' src={image} alt="" />}
        <h1 className='text-[20px] text-[#28574E] font-medium fontOutfit '>Department Overview</h1>
        <p className='text-[#3F484A] text-base sm:text-[18px] font-light fontOutfit'>{overview}</p>
        <h1 className='text-[#28574E] text-[20px] font-medium fontOutfit'>Services Offered</h1>
        <ul className='grid grid-cols-1 min-[400px]:grid-cols-2 gap-3' >
            {( services ?? []).map((service,idx) =>{
                return <li className='flex gap-2 text-[#141313] text-[16px] fontOutfit' key={idx}>
                   <span className='bg-[#28574E] flex shrink-0 items-center justify-center px-1 w-6 h-6 rounded-sm'><Check color='#ffffff' /></span> {service}
                </li>
            })}
        </ul>

        <div className='mt-8 sm:mt-15 flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:gap-4'>
            <Button type='button' variant='outline' width='w-full sm:w-45.25' content="Cancel" onClick={onClose} />
            <Button type='button' variant='primary' width='w-full sm:w-54' content="Book Appointment" onClick={onBooking} />
        </div>
      </div>
    </div>
    </div>
  )
}