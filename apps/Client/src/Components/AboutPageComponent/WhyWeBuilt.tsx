import {
  FaClock,
  FaCalendarCheck,
  FaUserMd,
  FaNotesMedical,
  FaCommentMedical,
} from "react-icons/fa";

const reasons = [
  {
    icon: <FaClock />,
    title: "Long waiting times",
  },
  {
    icon: <FaCalendarCheck />,
    title: "Managing appointments",
  },
  {
    icon: <FaUserMd />,
    title: "Finding specialists",
  },
  {
    icon: <FaNotesMedical />,
    title: "Accessing reliable health information",
  },
  {
    icon: <FaCommentMedical />,
    title: "Problems connecting with doctors",
  },
];

const WhyWeBuilt = () => {
  return (
    <section className="bg-[#F7F7F5] py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <span className="inline-flex rounded-full bg-[#DDF4EE] px-5 py-2 text-lg font-medium text-[#28574E]">
              Why We Built MediBridge
            </span>

            <h2 className="mt-6 font-serif text-5xl font-bold leading-tight text-[#1E1E1E]">
              Healthcare Shouldn't
              <br />
              Be This Difficult.
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#5B5B5B]">
              Every day, patients face unnecessary challenges when trying
              to access quality healthcare. MediBridge was built to remove
              these barriers and create a healthcare experience that is
              simple, connected, and centered around people.
            </p>

            <div className="mt-10 space-y-5">
              {reasons.map((reason) => (
                <div
                  key={reason.title}
                  className="flex items-center gap-5 rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:translate-x-2 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#28574E] text-xl text-white">
                    {reason.icon}
                  </div>

                  <h3 className="text-lg font-semibold text-[#1E1E1E]">
                    {reason.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>

<div className="flex items-center">
  <div className="rounded-[36px] bg-[#28574E] p-12 text-white shadow-xl">
    <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white/15 mb-8">
      <FaCommentMedical className="text-4xl text-white" />
    </div>

    <h3 className="font-serif text-4xl font-bold leading-tight">
      Better Healthcare,
      <br />
      Built Around You.
    </h3>

    <p className="mt-8 text-lg leading-8 text-white/90">
      We believe technology should remove barriers, not create them.
      MediBridge was designed to simplify every step of the healthcare
      journey, helping patients connect with trusted doctors, manage
      appointments effortlessly, and access reliable health guidance
      whenever they need it.
    </p>

    <div className="mt-10 space-y-4 border-l-2 border-white/30 pl-6">
      <div>
        <h4 className="font-semibold text-xl">
          Simplicity
        </h4>
        <p className="mt-1 text-white/80">
          Easy to use for everyone.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-xl">
          Connection
        </h4>
        <p className="mt-1 text-white/80">
          Bringing patients and healthcare providers together.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-xl">
          Confidence
        </h4>
        <p className="mt-1 text-white/80">
          Trusted information and secure communication.
        </p>
      </div>
    </div>
  </div>
</div>
        </div>
      </div>
    </section>
  );
};

export default WhyWeBuilt;