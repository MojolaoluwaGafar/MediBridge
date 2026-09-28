import { useState } from 'react'
import RegisterLayout from '../../Layout/RegisterLayout'
import Input from '../../Components/Input'
import { Link, useLocation, useNavigate } from 'react-router'
import Button from '../../Components/Button'
import Image from "../../assets/Frame 2121455033 (1).svg"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setPasswordSchema, type SetPasswordInput } from '../../Validation/ActivationSchema'
import { useSetPassword } from '../../Hooks/Auth/useSetPassword'
import { showToast } from '../../utils/toastHelper'
import { Eye, EyeOff } from 'lucide-react'

export default function SetPassword() {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showCPassword, setShowCPassword] = useState<boolean>(false)

    const { register, handleSubmit, formState : { errors}, reset} = useForm<SetPasswordInput>({
        resolver : zodResolver(setPasswordSchema)
    })

    const { setPassword, loading, error } = useSetPassword()
    
    const navigate = useNavigate()
    const location = useLocation()
    const emailFromState = location.state?.email
    const email = emailFromState || localStorage.getItem("activationEmail") || localStorage.getItem("resetEmail") || ""

    const submit = async(formData : SetPasswordInput)=>{
        try {
            const result = await setPassword({ ...formData, email });
            console.log("Password set successfully :", result);
            if (result) {
            localStorage.setItem("authToken", result.token)
            localStorage.setItem("user", JSON.stringify(result.user))  
            }
            showToast(result.message || "Password set successfully", "success");
            reset()
            navigate("/patientDashboard", { state : {
                firstname : result.user.firstname,
                lastname : result.user.lastname,
                email : result.user.email,
            }})
        } catch (err) {
            console.error("Set Password error:", err, error)
            showToast(error || "Failed to set password", "error");
        }
    }
    
    const togglePassword = (e : React.MouseEvent<HTMLButtonElement>)=>{
        e.preventDefault();
        setShowPassword(prev => !prev);
    }

    const toggleCPassword = (e : React.MouseEvent<HTMLButtonElement>)=>{
        e.preventDefault();
        setShowCPassword(prev => !prev);
    }
    
    return (
    <RegisterLayout heading='Secure Your Access' subHeading='Your health data is protected with industry-leading encryption. Step 3 of 3: finalise your security credentials.' image={Image}>
        <form onSubmit={handleSubmit(submit)} className='border border-[#D1D5D5] rounded-xl w-full my-4 lg:my-0 p-8'>
            <div className='flex flex-col lg:flex-row gap-2 items-center justify-between'>
            <p className='flex items-center gap-2 text-[#28574E]'><span className='h-8 w-8 rounded-full flex items-center justify-center bg-[#28574E] text-white'>1</span> Identity</p>
            <span className='bg-[#28574E] w-full lg:w-[45.5px] h-0.5'></span>
            <p className='flex items-center gap-2 text-[#28574E]'><span className='h-8 w-8 rounded-full flex items-center justify-center bg-[#28574E] text-white'>2</span> OTP</p>
            <span className='bg-[#E1E3E3] w-full lg:w-[45.5px] h-0.5'></span>
            <p className='flex items-center gap-2 text-[#28574E]'><span className='h-8 w-8 rounded-full flex items-center justify-center bg-[#28574E] text-white'>3</span> Set Up</p>
            </div>
        <h1 className="text-[28px] font-semibold pt-5">Set Up Password</h1>
        <p className="pb-5 text-[#757575] text-[18px]">finalise your security credentials.</p>

        <label className="text-[18px] font-semibold" htmlFor="newPassword">Password</label>
        <div className='relative'>
            <Input {...register("password")} id='newPassword' type={showPassword ? "text" : "password"} placeholder='Enter your new password' className='my-2'  />
            <button type="button" onClick={togglePassword} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        {errors.password && <p className='text-red-500'>{errors.password.message}</p>}
        <label  className="text-[18px] font-semibold" htmlFor="confirmPassword">Confirm Password</label>

        <div className='relative'>
            <Input {...register("confirmPassword")} id='confirmPassword' type={showCPassword ? "text" : "password"} placeholder='Confirm your password' className='my-2'  />
            <button type="button" onClick={toggleCPassword} 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showCPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
        </div>
        {errors.confirmPassword && <p className='text-red-500'>{errors.confirmPassword.message}</p>}

        <div className='flex gap-2 items-center py-2'>
            <input {...register("terms")} className='h-5 w-6' id='checkBox' type="checkbox" />
            <label className='text-[18px]' htmlFor="checkBox">I agree to the <Link to=""><span className='text-[#28574E]'>Terms of Service</span></Link> and <Link to=""><span className='text-[#28574E]'>Privacy Policy</span></Link></label>
        </div>
        {errors.terms && <p className='text-red-500'>{errors.terms.message}</p>}

        <Button className='my-5' type='submit' content={loading ? "Activating..." : "Activate Account"}
        disabled={loading} />

        <p className='pt-8 text-center'>Need help? <Link to=""><span className='text-[#28574E] font-semibold'>Contact Support</span></Link></p>
        </form>
    </RegisterLayout>
    )
}