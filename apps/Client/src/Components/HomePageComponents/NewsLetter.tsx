import Button from '../Button'

export default function NewsLetter() {
  return (
    <div className="w-full pt-10 md:pt-20 pb-15 md:pb-25 px-5 md:px-15 bg-[#F5F5F5]">
      <div className="container mx-auto flex flex-col items-center gap-5 bg-[#28574E] rounded-2xl md:rounded-4xl py-8 md:py-10 px-5">
        
        <h1 className="fontLibre text-white font-bold text-[22px] md:text-[34px] text-center">
          Stay informed on your health
        </h1>
        
        <p className="text-[#DAD8D8] text-sm md:text-[18px] text-center w-full md:w-175">
          Get the latest health tips, medical news, and app updates delivered to your inbox once a week.
        </p>

        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <input
            className="border border-[#FFFFFF] text-white bg-transparent rounded-lg px-3 py-2 w-full md:w-80.5 h-11 md:h-13.5 placeholder:text-sm md:placeholder:text-base"
            placeholder="Enter your email address"
            type="email"
          />
          <Button
            variant="secondary"
            content="Subscribe"
            type="button"
            width="w-full md:w-[174px]"
          />
        </div>

      </div>
    </div>
  )
}
