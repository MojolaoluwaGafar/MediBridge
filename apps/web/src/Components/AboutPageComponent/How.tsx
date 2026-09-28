import React from "react";
import {
  FaUserPlus,
  FaCalendarCheck,
  FaUserMd,
  FaNotesMedical,
  FaComments,
} from "react-icons/fa";
import { HiArrowLongRight } from "react-icons/hi2";

const steps = [
  {
    title: "Activate Account",
    description: "Register securely to access all MediBridge services.",
    icon: <FaUserPlus />,
  },
  {
    title: "Book Appointment",
    description: "Choose a department and schedule a convenient visit.",
    icon: <FaCalendarCheck />,
  },
  {
    title: "Meet Doctor",
    description: "Connect with experienced healthcare professionals.",
    icon: <FaUserMd />,
  },
  {
    title: "Receive Care",
    description: "Receive personalized treatment and medical guidance.",
    icon: <FaNotesMedical />,
  },
  {
    title: "Stay Connected",
    description: "Keep in touch through follow-ups.",
    icon: <FaComments />,
  },
];

const How = () => {
  return (
    <section className="bg-[#F7F7F5] py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-[#DDF4EE] px-5 py-2 text-lg font-medium text-[#28574E]">
            How It Works
          </span>

          <h2 className="mt-6 font-serif text-5xl font-bold text-[#1E1E1E]">
            Your Healthcare Journey
            <br />
            In Five Simple Steps
          </h2>

          <p className="mt-6 mx-auto max-w-3xl text-lg leading-8 text-[#5B5B5B]">
            MediBridge brings every stage of your healthcare experience
            together in one secure and easy-to-use platform.
          </p>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-10 lg:flex-row">
          {steps.map((step, index) => (
            <React.Fragment key={step.title}>
              <div className="flex max-w-[220px] flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#28574E] text-3xl text-white shadow-lg">
                  {step.icon}
                </div>

                <div className="mt-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#DDF4EE] font-semibold text-[#28574E]">
                  {index + 1}
                </div>

                <h3 className="mt-5 font-serif text-2xl font-bold text-[#1E1E1E]">
                  {step.title}
                </h3>

                <p className="mt-3 leading-7 text-[#5B5B5B]">
                  {step.description}
                </p>
              </div>

              {index !== steps.length - 1 && (
                <div className="hidden lg:flex items-center justify-center text-[#28574E]">
                  <HiArrowLongRight className="text-5xl" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default How;