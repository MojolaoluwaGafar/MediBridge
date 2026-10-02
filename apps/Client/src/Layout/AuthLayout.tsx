import React from 'react'
import Logo from "../assets/MediBridgeLogo.svg"
import Footer from "../Components/Footer"
import { Link } from 'react-router'

type Props = {
    heading? : string,
    subHeading? : string,
    children : React.ReactNode
}

export default function AuthLayout({heading, subHeading, children}: Props) {
  return (
   <div>
     <div className='authBg min-h-dvh w-full flex items-center justify-center px-4 py-8'>
        <div className='container flex items-center justify-center mx-auto'>
            <div className='bg-white rounded-lg w-full max-w-117.5 h-auto py-6 px-5 sm:px-8'>
                <Link to="/"><img className='flex mx-auto my-4' src={Logo} alt="" /></Link>

                <h1 className='text-[24px] sm:text-[28px] font-semibold fontOutfit'>{heading}</h1>
                <p className='text-base sm:text-[18px] text-[#757575] fontOutfit'>{subHeading}</p>

                <div className='pt-4'>
                    {children}
                </div>
            </div>
        </div>
    </div>

    <Footer />
   </div>
  )
}