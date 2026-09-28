import React, { useState } from 'react'
import { FaStar } from "react-icons/fa";
import { GrPrevious, GrNext } from "react-icons/gr";
import Jordan from "../../assets/121054511_158666599245775_8379300751700607816_n (1).svg"
import Priya from "../../assets/121054511_158666599245775_8379300751700607816_n.svg"
import Marcus from "../../assets/121054511_158666599245775_8379300751700607816_n.svg"
import { motion, AnimatePresence } from 'framer-motion';

interface Card {
  id?: number,
  icon: React.ReactNode,
  comment: string,
  avatar: string,
  name: string,
  role: string
}

const Card = ({ icon, comment, avatar, name, role }: Card) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="border border-[#DDDDDD] bg-[#EEEDED] w-full sm:w-96 p-4 md:p-5 flex flex-col justify-center rounded-md gap-4"
    >
      <div>{icon}</div>
      <h1 className="text-[#403F3F] text-sm md:text-base">{comment}</h1>
      <span className="w-full h-0.5 bg-[#D2D0D0]"></span>
      <div className="flex items-center gap-3">
        <img className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" src={avatar} alt="" />
        <div className="flex flex-col gap-1 md:gap-2 justify-center">
          <p className="text-[#363636] font-semibold text-sm md:text-base">{name}</p>
          <p className="text-[#656565] text-xs md:text-sm">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Patientstories() {
  const stories: Card[][] = [
    [
      {
        icon: <div className="flex flex-row gap-1 md:gap-2 text-yellow-500"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>,
        comment: `"I rescheduled my mother's cardiology visit in under a minute. The whole family is on it now."`,
        avatar: Jordan,
        name: "Jordan A.",
        role: "Family caregiver"
      },
      {
        icon: <div className="flex flex-row gap-1 md:gap-2 text-yellow-500"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>,
        comment: `"MediCare isn't just a hospital, it's a partner in my family's health. The pediatrics team is simply the best in the state."`,
        avatar: Priya,
        name: "Priya S.",
        role: "Patient"
      },
      {
        icon: <div className="flex flex-row gap-1 md:gap-2 text-yellow-500"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>,
        comment: `"The AI support helped me prep questions before my visit. My doctor noticed the difference."`,
        avatar: Marcus,
        name: "Marcus W.",
        role: "Patient"
      }
    ],
    [
      {
        icon: <div className="flex flex-row gap-1 md:gap-2 text-yellow-500"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>,
        comment: `"I rescheduled my mother's cardiology visit in under a minute. The whole family is on it now."`,
        avatar: Jordan,
        name: "Jordan B.",
        role: "Family caregiver"
      },
      {
        icon: <div className="flex flex-row gap-1 md:gap-2 text-yellow-500"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>,
        comment: `"MediCare isn't just a hospital, it's a partner in my family's health. The pediatrics team is simply the best in the state."`,
        avatar: Priya,
        name: "Priya T.",
        role: "Patient"
      },
      {
        icon: <div className="flex flex-row gap-1 md:gap-2 text-yellow-500"><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></div>,
        comment: `"The AI support helped me prep questions before my visit. My doctor noticed the difference."`,
        avatar: Marcus,
        name: "Marcus X.",
        role: "Patient"
      }
    ],
  ]

  const [index, setIndex] = useState<number>(0)
  const handleNext = () => setIndex((prev) => (prev + 1) % stories.length)
  const handlePrev = () => setIndex((prev) => (prev - 1 + stories.length) % stories.length)

  return (
    <div className="w-full px-5 md:px-10 py-10 md:py-20 bg-[#F5F5F5]">
      <div className="mx-auto container relative">
        <span className="text-[#28574E] sm:flex mx-auto lg:m-0 text-sm md:text-[18px] bg-[#DCF2EE] flex items-center justify-center w-32 md:w-40.75 h-9 md:h-10.75 rounded-[31px]">
          Patient stories
        </span>
        <h1 className="text-[22px] md:text-[34px] fontLibre font-semibold leading-snug md:leading-10 py-4 text-center md:text-left">
          Real people. Real care. Real coordination
        </h1>
        <div className="flex gap-3 md:gap-5 absolute top-0 right-3 md:right-1">
          <button type="button" onClick={handlePrev} className="bg-[#DBD7D7] rounded-full w-9 h-9 md:w-10.75 md:h-10.75 text-[#757575] text-lg md:text-[20px] flex justify-center items-center"><GrPrevious /></button>
          <button type="button" onClick={handleNext} className="bg-[#28574E] rounded-full w-9 h-9 md:w-10.75 md:h-10.75 text-white text-lg md:text-[20px] flex justify-center items-center"><GrNext /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8">
          <AnimatePresence>
            {stories[index].map((story, id) => (
              <Card key={id} {...story} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
