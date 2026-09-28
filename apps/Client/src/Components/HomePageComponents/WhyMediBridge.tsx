import React from 'react'
import { CalendarDays, Astroid, MessageSquareMore } from 'lucide-react';
import AISupport from './AISupport';

interface ICardAd {
    id : number,
    icon : string | React.ReactNode,
    heading : string,
    subHeading : string
    className? : string
}

const cardDetails : ICardAd[] = [
    {
        id : 1,
        icon :  <CalendarDays />,
        heading : "Easy Booking",
        subHeading: "Find and schedule appointments with verified doctors in minutes.",
        className : "rounded-md bg-[#DCF2EE] text-[#28574E]"
    },
    {
        id : 2,
        icon :  <Astroid />,
        heading : "AI Support",
        subHeading: "Get instant calm responses to your health questions 24/7.",
        className : "rounded-md bg-[#FFEDDF] text-[#FF6F00] p-2 text-[#7065F0]"
    },
    {
        id : 3,
        icon :  <MessageSquareMore />,
        heading : "Message your care team",
        subHeading: "Secure conversations with doctors, with read receipts and attachments.",
        className : "rounded-md bg-[#DCF2EE] bg-[#E7E5FF] p-2 text-[#7065F0]"
    }
]

 const Card =({icon, heading,subHeading, className} : ICardAd)=>{
    return (
        <div className='w-88 bg-white text-center rounded-[20px] flex flex-col items-center justify-center p-5 gap-2 border border-[#D1D5D5]'>
            <span className={`${className} h-12 w-12 flex items-center justify-center`}>{icon}</span>
            <h1 className='text-[24px] font-semibold'>{heading}</h1>
            <p className='text-[#757575] text-[18px]'>{subHeading}</p>
        </div>
    )
 }

export default function WhyMediBridge() {
  return (
    <div className='bg-[#F5F5F5] pt-10 lg:pt-87.5 w-full px-5'>
        <div className='container flex flex-col items-center mx-auto text-center gap-3'>
        <h1 className='text-[18px] text-[#28574E] bg-[#DCF2EE] rounded-[31px] w-45.25 h-10.75 flex items-center justify-center'>Why MediBridge</h1>
        <h1 className='text-[34px] fontLibre'>A calmer way to care for yourself</h1>
        <p className='text-[#757575] text-[20px] lg:w-119.75'>One platform connecting patients with the right care, exactly when they need it.</p>
        
        <div className='flex flex-col lg:flex lg:flex-row gap-6 mt-8'>
            {cardDetails.map((cardDetails)=>{
            return <Card key={cardDetails.id} {...cardDetails}  />
        })}
        </div>

        <AISupport />



        </div>
    </div>
  )
}