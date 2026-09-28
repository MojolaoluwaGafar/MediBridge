import {
  FaUserMd,
  FaHospital,
  FaUsers,
  FaRobot,
} from "react-icons/fa";

const statistics = [
  {
    icon: <FaUserMd />,
    value: "20+",
    label: "Doctors",
  },
  {
    icon: <FaHospital />,
    value: "8+",
    label: "Departments",
  },
  {
    icon: <FaUsers />,
    value: "2,000+",
    label: "Patients",
  },
  {
    icon: <FaRobot />,
    value: "24/7",
    label: "AI Support",
  },
];

const Statistics = () => {
  return (
    <section className="bg-[#28574E] py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-white/10 px-5 py-2 text-lg font-medium text-white border border-white/20">
            MediBridge Impact
          </span>

          <h2 className="mt-6 font-serif text-5xl font-bold text-white">
            Healthcare That Makes
            <br />
            A Difference
          </h2>

          <p className="mt-6 mx-auto max-w-3xl text-lg leading-8 text-white/80">
            Every number represents our commitment to making healthcare
            more connected, accessible, and patient-centered.
          </p>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {statistics.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[28px] border border-white/15 bg-white/10 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:text-[#28574E]"
            >
              <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-white text-3xl text-[#28574E]">
                {stat.icon}
              </div>

              <h3 className="mt-6 font-serif text-5xl font-bold">
                {stat.value}
              </h3>

              <p className="mt-3 text-lg font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Statistics;