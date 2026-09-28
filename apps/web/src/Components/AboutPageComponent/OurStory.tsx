import StoryImage from "../../assets/about-story.jpg";

const OurStory = () => {
  return (
    <section className="bg-[#F7F7F5] py-28">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 items-center gap-16">
          <div className="relative">
            <img
              src={StoryImage}
              alt="Our Story"
              className="w-full h-[580px] object-cover rounded-[32px] shadow-lg"
            />
          </div>

          <div>
            <span className="inline-flex items-center rounded-full bg-[#DDF4EE] px-5 py-2 text-lg font-medium text-[#28574E] font-outfit">
              Our Story
            </span>

            <h2 className="mt-6 font-serif text-5xl font-bold leading-tight text-[#1E1E1E]">
              Building a Bridge Between
              <br />
              People and Better Healthcare
            </h2>

            <p className="mt-8 text-lg leading-8 text-[#5B5B5B] font-outfit">
              MediBridge was created to make healthcare simpler, more
              connected, and more accessible. We believe that finding the
              right care should be effortless, whether you're booking an
              appointment, speaking with a healthcare professional, or
              seeking trusted health guidance. By combining compassionate
              care with innovative technology, MediBridge helps bridge the
              gap between patients and the support they need, making every
              healthcare journey more seamless and human.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;