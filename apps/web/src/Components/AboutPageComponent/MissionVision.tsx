import { FaHeartbeat, FaEye } from "react-icons/fa";

const MissionVision = () => {
  return (
    <section className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="inline-flex items-center rounded-full bg-[#DDF4EE] px-5 py-2 text-lg font-medium text-[#28574E]">
            Mission & Vision
          </span>

          <h2 className="mt-6 font-serif text-6xl font-bold text-[#1E1E1E]">
            Guided by Purpose,
            <br />
            Driven by Care
          </h2>

          <p className="mt-6 max-w-3xl mx-auto text-lg leading-9 text-[#5B5B5B]">
            Everything we build is inspired by our commitment to improving
            healthcare experiences for patients and providers alike.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[32px] bg-[#F7F7F5] p-10 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#28574E] text-white">
              <FaHeartbeat className="text-3xl" />
            </div>

            <h3 className="mt-8 font-serif text-3xl font-bold text-[#1E1E1E]">
              Our Mission
            </h3>

            <p className="mt-6 text-lg leading-8 text-[#5B5B5B]">
              To simplify healthcare by connecting patients with trusted
              medical professionals through secure technology, seamless
              communication, and accessible digital healthcare services that
              put people first.
            </p>
          </div>

          <div className="rounded-[32px] bg-[#28574E] p-10 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[#28574E]">
              <FaEye className="text-3xl" />
            </div>

            <h3 className="mt-8 font-serif text-3xl font-bold">
              Our Vision
            </h3>

            <p className="mt-6 text-lg leading-8 text-white/90">
              To create a future where quality healthcare is easily
              accessible to everyone, empowering healthier communities
              through innovation, trust, and meaningful human connections.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;