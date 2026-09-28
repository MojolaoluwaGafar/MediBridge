import RegisterLayout from '../../Layout/RegisterLayout'
import image from "../../assets/identityForm.svg"
import Vector from "../../assets/Container.svg"
import Input from '../../Components/Input'
import Button from '../../Components/Button'
import { FaArrowRight } from "react-icons/fa6";
import { Link, useNavigate } from 'react-router'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyUserSchema, type VerifyUserInput } from '../../Validation/ActivationSchema'
import { useVerifyUser } from '../../Hooks/Auth/useVerifyUser'
import { showToast } from "../../utils/toastHelper";

export default function Activate() {
    const { register, handleSubmit, formState : { errors }, reset } = useForm<VerifyUserInput>({
        resolver : zodResolver(VerifyUserSchema)
    })

    const { verifyUser, loading, error} = useVerifyUser()

    const navigate = useNavigate()

    const submit = async (formData : VerifyUserInput)=>{
        try {
            const result = await verifyUser(formData);
            localStorage.setItem("authToken", result.token)
            console.log("ID Verification success :", result);
            showToast(result.message || "Verification code sent to your email", "success")
            reset()
            navigate("/verifyActivation", { state : {
                email : result.user.email,
                expiresAt : result.expiresAt
            }})
        } catch (err : any) {
            const message = err.response?.data?.error || err.response?.data?.message || error || "ID Verification failed";
            console.error("ID Verification error:", message )
            showToast(message, "error")
        }     
    }

  return (
    <RegisterLayout image={image} subHeading="Manage appointments, view medical information, chat with your care team, and receive support in one place." heading="Access your care anytime"
    ul={<ul className="flex flex-col gap-3">
        <li className="flex gap-4 font-semibold"><img src={Vector} alt="" />Book and manage appointments</li>
        <li className="flex gap-4 font-semibold"><img src={Vector} alt="" />Access visit history</li>
        <li className="flex gap-4 font-semibold"><img src={Vector} alt="" />Message your healthcare team</li>
        <li className="flex gap-4 font-semibold"><img src={Vector} alt="" />AI support assistance</li>
        <li className="flex gap-4 font-semibold"><img src={Vector} alt="" />Appointment reminders</li>
    </ul>}
    >
        <form
  onSubmit={handleSubmit(submit)}
  className="border border-[#D1D5D5] rounded-xl w-full max-w-lg lg:max-w-2xl mx-auto p-6 md:p-8 my-4 lg:my-0"
>
  <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
    <p className="flex items-center gap-2">
      <span className="h-8 w-8 rounded-full flex items-center justify-center bg-[#28574E] text-white">1</span> Identity
    </p>
    <span className="bg-[#E1E3E3] w-full lg:w-[45.5px] h-0.5"></span>
    <p className="flex items-center gap-2">
      <span className="h-8 w-8 rounded-full flex items-center justify-center bg-[#E1E3E3] text-[#3E3B3B]">2</span> OTP
    </p>
    <span className="bg-[#E1E3E3] w-full lg:w-[45.5px] h-0.5"></span>
    <p className="flex items-center gap-2">
      <span className="h-8 w-8 rounded-full flex items-center justify-center bg-[#E1E3E3] text-[#3E3B3B]">3</span> Set Up
    </p>
  </div>

  <h1 className="text-[22px] md:text-[28px] font-semibold pt-5">Activate your account</h1>
  <p className="pb-5 text-[#757575] text-sm md:text-[18px]">
    Verify your hospital details to set up portal access.
  </p>

  <label className="py-2 font-semibold" htmlFor="id">Hospital Patient ID / User ID</label>
  <Input {...register("UserId")} id="id" className="my-3 w-full" type="text" placeholder="Enter your Patient ID" />
  {errors.UserId && <p className="text-red-500">{errors.UserId.message}</p>}

  <label className="py-2 font-semibold" htmlFor="email">Email Address</label>
  <Input {...register("Email")} id="email" className="my-3 w-full" type="email" placeholder="Enter your email address" />
  {errors.Email && <p className="text-red-500">{errors.Email.message}</p>}

  <label className="py-2 font-semibold" htmlFor="number">Registered Phone Number</label>
  <Input {...register("RegisteredNumber")} id="number" className="my-3 w-full" type="tel" placeholder="(+234) 000-0000" />
  {errors.RegisteredNumber && <p className="text-red-500">{errors.RegisteredNumber.message}</p>}

  <Button
    disabled={loading}
    className="my-4 w-full"
    type="submit"
    content={
      loading
        ? "Verifying..."
        : <span className="flex items-center gap-2 justify-center">Verify identity<FaArrowRight /></span>
    }
  />

  <h1 className="text-center text-[#757575] text-sm md:text-[18px]">
    Already have an account? <Link to="/login"><span className="text-[#28574E]">Log In</span></Link>
  </h1>

  <div className="bg-[#D1D5D5] h-[0.3px] w-full my-8"></div>

  <h1 className="text-center text-sm md:text-[18px] text-[#6F797A]">
    Need help with your Patient ID? <Link to=""><span className="text-[#00454B] font-semibold">Contact Support</span></Link>
  </h1>
</form>

    </RegisterLayout>
    )
}