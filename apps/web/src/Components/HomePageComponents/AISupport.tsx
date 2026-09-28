import { Lock, Brain, SquareCheckBig } from 'lucide-react'
import ChatContainer from './ChatContainer'
import { Link } from 'react-router'

export default function AISupport() {
  return (
    <div className='mx-auto container flex flex-col lg:flex lg:flex-row items-center justify-between w-full py-10 px-5 lg:px-20 lg:py-25 text-start'>
        <div className='w-full lg:w-1/2 flex flex-col gap-2'>
            <span className='text-[18px] text-[#28574E] bg-[#DCF2EE] rounded-[31px] w-33.5 h-10.75 flex items-center justify-center'>AI Support</span>
            <h1 className='text-[34px] font-semibold fontLibre leading-10'>Ask anything about your health instantly.</h1>
            <p className='text-[#757575] text-[20px] lg:w-120.25'>Get calm, private support from MediBridge AI before you even sign up. Talk through symptoms, prepare for a visit, or just think out loud.</p>
            <ul className='flex flex-col gap-3 pt-3'>
                <li className='flex gap-2 text-[#494949]'><span className='text-[#28574E]'><Lock /></span>Anonymous — nothing leaves this device.</li>
                <li className='flex gap-2 text-[#494949]'><span className='text-[#28574E]'><Brain /></span>Anonymous — nothing leaves this device.</li>
                <li className='flex gap-2 text-[#494949]'><span className='text-[#28574E]'><SquareCheckBig /></span>Anonymous — nothing leaves this device.</li>
            </ul>
            <Link to="/support"><button type='button' className='my-4 w-[215px] text-white bg-[#28574E] cursor-pointer hover:bg-[#4f8379] h-13.5 font-semibold rounded-lg'>Start Free AI chat</button></Link>
        </div>

        <div className='w-full pt-5 lg:pt-0 lg:w-1/2'>
            <ChatContainer preview />
        </div>

    </div>
  )
}