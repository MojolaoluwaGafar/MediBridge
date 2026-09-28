import errorImage from "../assets/error404.png"
import { Link } from 'react-router'

export default function Error404() {
  return (
    <>
       <div className="container mx-auto flex items-center justify-center text-center px-10">
        <div>
            <img  className="mx-auto" src={errorImage} alt="error 404" />
            <h2 className="mb-3 text-lg font-semibold">Oh snap!, this is awkward.</h2>
            <p>But not as awkward as shaking someone that is to give you a first bump</p>
            <Link to="/"><button type="button" className="bg-[#0D9488] font-semibold rounded-[31px] w-[100px] h-[48px] text-white mt-3">Go back</button></Link>
        </div>
       </div>
    </>
  )
}
