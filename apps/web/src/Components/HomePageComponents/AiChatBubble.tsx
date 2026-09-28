import Icon from "../../assets/Icon.svg"
import type { IMessage } from '../../types/message'

export default function AiChatBubble({ isMine = false, text }: IMessage) {
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3 md:mb-4`}>
      {!isMine && (
        <div className="flex items-start gap-2 md:gap-4 max-w-[90%]">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#28574E] flex items-center justify-center shrink-0">
            <img src={Icon} alt="" className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="bg-[#DCF2EE99] text-black px-3 py-2 md:px-4 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm break-words">
            <p className="text-sm md:text-base">{text}</p>
          </div>
        </div>
      )}

      {isMine && (
        <div className="bg-[#28574E] text-white px-3 py-2 md:px-4 rounded-tl-lg rounded-br-lg rounded-bl-lg shadow-sm max-w-[80%] md:max-w-[70%] break-words">
          <p className="text-sm md:text-base">{text}</p>
        </div>
      )}
    </div>
  )
}
