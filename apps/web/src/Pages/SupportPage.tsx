import AppLayout from '../Layout/AppLayout'
import MessageContainer from '../Components/SupportPageComponent/MessageContainer'

export default function SupportPage() {
  return (
    <AppLayout
      headerProps={{
        className: "supportBg",
        heading: "Talk to MediCare AI Support",
        subHeading:
          "Describe your symptoms or ask any hospital-related question. The AI will guide you step-by-step.",
      }}
    >
      <div className="bg-[#F5F5F5] py-10 md:py-25 w-full flex flex-col gap-10 md:gap-19 items-center justify-center">
        <div className="container flex flex-col items-center mx-auto text-center gap-3 px-5">
          <h1 className="text-sm md:text-[18px] text-[#28574E] bg-[#DCF2EE] rounded-[31px] w-32 md:w-45.25 h-9 md:h-10.75 flex items-center justify-center fontOutfit">
            AI Support
          </h1>
          <h1 className="fontLibre text-[22px] md:text-[34px] font-semibold">
            How can I help today
          </h1>
          <p className="text-sm md:text-[20px] fontOutfit w-full md:w-122.5 text-[#757575]">
            No login required. Conversations are private and not stored to your record.
          </p>
        </div>

        <div className="w-full md:w-175.5 px-5 md:px-0 pb-10">
          <MessageContainer />
        </div>
      </div>
    </AppLayout>
  )
}
