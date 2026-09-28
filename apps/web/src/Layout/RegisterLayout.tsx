import React from 'react'
import Logo from "../assets/MediBridgeLogo.svg"
import Footer from '../Components/Footer'

type Props = {
  children: React.ReactNode,
  heading: string,
  subHeading: string,
  ul?: React.ReactNode,
  image: string,
}

export default function RegisterLayout({ heading, subHeading, children, ul, image }: Props) {
  return (
    <div>
      <div className="w-full flex flex-col lg:flex-row justify-between">
        <div className="w-full lg:w-1/2 hidden lg:flex">
          <div className="authBgGradient px-6 md:px-10 pt-8 pb-10 lg:pb-15 w-full h-auto flex flex-col items-center justify-center gap-6 lg:gap-8.75">
            <div className="container mx-auto flex flex-col justify-center w-full max-w-md lg:max-w-[436px]">
              <img className="w-32 md:w-46 h-auto my-2" src={Logo} alt="MediBridge Logo" />
              <h1 className="text-[#28574E] text-[28px] md:text-[40px] font-semibold fontLibre leading-tight py-2">
                {heading}
              </h1>
              <p className="text-[#3E3B3B] text-sm md:text-[18px] py-2 fontOutfit">{subHeading}</p>
              <div className="pt-4 pb-8 fontOutfit">{ul}</div>
              <img className="w-full max-w-md lg:w-109 h-auto lg:h-[314.05px]" src={image} alt="Illustration" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 px-6 md:px-10 flex items-center justify-center">
          <div className="container mx-auto flex items-center justify-center fontOutfit w-full max-w-md lg:max-w-lg">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
