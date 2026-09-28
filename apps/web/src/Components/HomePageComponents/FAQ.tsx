import { useState } from 'react'
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

interface IFAQ {
  question: string,
  answer: string,
  isOpen?: boolean,
  onToggle?: () => void
}

const FAQCard = ({ question, answer, isOpen, onToggle }: IFAQ) => {
  return (
    <div
      className="bg-white border border-[#DDDDDD] p-4 md:p-5 text-sm md:text-[20px] rounded-2xl w-full md:w-191.5 flex flex-col cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex justify-between items-center w-full">
        <h1 className="font-semibold text-[#191C1D] text-base md:text-lg">{question}</h1>
        {isOpen ? <FaAngleUp /> : <FaAngleDown />}
      </div>
      {isOpen && (
        <p className="mt-3 text-gray-600 leading-6 text-sm md:text-base">
          {answer || "Answer coming soon..."}
        </p>
      )}
    </div>
  )
}

export default function FAQ() {
  const [openID, setOpenID] = useState<number | null>(null)
  const questions: IFAQ[] = [
    {
      question: "Can I use the AI assistant for free?",
      answer: "Yes, you can access the AI assistant for free with basic features. Premium plans may unlock advanced support."
    },
    {
      question: "What is a patient ID and how do I find mine?",
      answer: "Your patient ID is a unique identifier assigned to you. You can find it on your hospital card, patient portal, or by contacting support."
    },
    {
      question: "How do I book an appointment?",
      answer: "You can book appointments directly through the MediBridge platform by selecting your department, doctor, and preferred time."
    }
  ]

  return (
    <div className="w-full px-5 md:px-10 pb-10 pt-10 bg-[#F5F5F5]">
      <div className="container mx-auto flex flex-col items-center">
        <span className="bg-[#DCF2EE] text-[#28574E] text-sm md:text-[18px] rounded-[31px] h-9 md:h-10.75 w-24 md:w-21 flex items-center justify-center">
          FAQ
        </span>
        <h1 className="text-[#141313] text-[22px] md:text-[34px] font-semibold fontLibre py-5 text-center md:text-left">
          Frequently Asked Questions
        </h1>

        <div className="flex flex-col items-center gap-4 w-full">
          {questions.map((question, index) => (
            <FAQCard
              key={index}
              {...question}
              isOpen={openID === index}
              onToggle={() => setOpenID(openID === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
