import {
  FaHeart,
  FaShieldAlt,
  FaHandshake,
  FaUniversalAccess,
} from "react-icons/fa";

const values = [
  {
    title: "Compassion",
    description:
      "We believe every patient deserves empathy, respect, and personalized care throughout their healthcare journey.",
    icon: <FaHeart />,
  },
  {
    title: "Privacy",
    description:
      "Your health information is protected with secure technology and handled with the highest standards of confidentiality.",
    icon: <FaShieldAlt />,
  },
  {
    title: "Trust",
    description:
      "We foster confidence by connecting patients with trusted healthcare professionals and reliable medical information.",
    icon: <FaHandshake />,
  },
  {
    title: "Accessibility",
    description:
      "Healthcare should be available to everyone through simple, inclusive, and easy-to-use digital experiences.",
    icon: <FaUniversalAccess />,
  },
];

const CoreValues = () => {
  return (
    <section className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-[#DDF4EE] px-5 py-2 text-lg font-medium text-[#28574E]">
            Our Core Values
          </span>

          <h2 className="mt-6 font-serif text-5xl font-bold text-[#1E1E1E]">
            The Principles That
            <br />
            Guide Everything We Do
          </h2>

          <p className="mt-6 mx-auto max-w-3xl text-lg leading-8 text-[#5B5B5B]">
            At MediBridge, our values shape every feature we build and every
            experience we create. They define how we serve patients,
            support healthcare professionals, and earn the trust of our
            community.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {values.map((value) => (
            <div
              key={value.title}
              className="group rounded-[32px] bg-[#F7F7F5] p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-[#28574E] hover:shadow-xl"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#28574E] text-3xl text-white transition-colors duration-300 group-hover:bg-white group-hover:text-[#28574E]">
                {value.icon}
              </div>

              <h3 className="mt-8 font-serif text-3xl font-bold text-[#1E1E1E] transition-colors duration-300 group-hover:text-white">
                {value.title}
              </h3>

              <p className="mt-5 leading-8 text-[#5B5B5B] transition-colors duration-300 group-hover:text-white/90">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;