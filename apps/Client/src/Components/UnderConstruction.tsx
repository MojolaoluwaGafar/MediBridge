import Constructing from "../assets/Page_Under_Construction.png"
import { Link } from 'react-router'

export default function Error404() {
  return (
    <>
       <div className="container mx-auto flex items-center justify-center text-center px-10">
        <div>
            <img  className="mx-auto h-80" src={Constructing} alt="error 404" />
            <Link to="/"><button type="button" className="bg-[#0D9488] font-semibold rounded-[31px] px-5 h-[48px] text-white mt-3">Go back to homepage</button></Link>
        </div>
       </div>
    </>
  )
}
