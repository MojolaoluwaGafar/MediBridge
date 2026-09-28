import Constructing from "../../assets/Page_Under_Construction.png"

export default function Error404() {
  return (
    <>
       <div className="container mx-auto flex items-center justify-center text-center px-10">
        <div>
            <img  className="mx-auto h-80" src={Constructing} alt="error 404" />
        </div>
       </div>
    </>
  )
}
