import { TriangleAlert } from "lucide-react"
import Icon from "../../assets/Icon.svg"
import type { IMessage } from '../../types/message'

const URGENCY_NOTICE = {
  urgent: {
    text: "This sounds like it needs attention today.",
    className: "bg-amber-50 text-amber-900",
  },
  emergency: {
    text: "This may be an emergency. Call emergency services now.",
    className: "bg-red-50 text-red-800",
  },
}

export default function AiChatBubble({ isMine = false, text, urgency }: IMessage) {
  const notice = !isMine && urgency && urgency !== "routine" ? URGENCY_NOTICE[urgency] : null

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3 md:mb-4`}>
      {!isMine && (
        <div className="flex items-start gap-2 md:gap-4 max-w-[90%]">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#28574E] flex items-center justify-center shrink-0">
            <img src={Icon} alt="" className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="bg-[#DCF2EE99] text-black px-3 py-2 md:px-4 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm break-words">
            {notice && (
              <p role="alert" className={`mb-2 flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium md:text-sm ${notice.className}`}>
                <TriangleAlert size={16} className="shrink-0" />
                {notice.text}
              </p>
            )}
            <p className="text-sm md:text-base whitespace-pre-line">{text}</p>
          </div>
        </div>
      )}

      {isMine && (
        <div className="bg-[#28574E] text-white px-3 py-2 md:px-4 rounded-tl-lg rounded-br-lg rounded-bl-lg shadow-sm max-w-[80%] md:max-w-[70%] break-words">
          <p className="text-sm md:text-base whitespace-pre-line">{text}</p>
        </div>
      )}
    </div>
  )
}
