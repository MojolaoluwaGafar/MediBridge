import AppLayout from '../Layout/AppLayout'
import OurStory from '../Components/AboutPageComponent/OurStory'
import MissionVision from '../Components/AboutPageComponent/MissionVision'
import WhyWeBuilt from '../Components/AboutPageComponent/WhyWeBuilt'
import CoreValues from '../Components/AboutPageComponent/CoreValues'
import How from '../Components/AboutPageComponent/How'
import Statistics from '../Components/AboutPageComponent/Statistics'
import CTA from '../Components/AboutPageComponent/CTA'


export default function AboutPage() {
  return (
    <AppLayout 
    headerProps={{
        className: "aboutBg",
        heading: "Connecting People. Connecting Care.",
        subHeading: "Making healthcare simpler, faster and more human through technology.",
        others : (
            <div>
            {/* <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-2 font-serif text-lg font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
            ABOUT MEDIBRIDGE
            </span> */}
            </div>
        )
    }}>
        <OurStory />
        <MissionVision />
        <WhyWeBuilt />
        <CoreValues />
        <How />
        <Statistics />
        <CTA />
    </AppLayout>
  )
}