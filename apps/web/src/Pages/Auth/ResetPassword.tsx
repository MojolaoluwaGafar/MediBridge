import { useState } from 'react'
import AuthLayout from '../../Layout/AuthLayout'
import Button from '../../Components/Button'
import Input from '../../Components/Input'
import { useLocation, useNavigate } from 'react-router'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "../../Validation/ActivationSchema";
import { showToast } from "../../utils/toastHelper";
import { useResetPassword } from '../../Hooks/Auth/useResetPassword';
import { Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showCPassword, setShowCPassword] = useState<boolean>(false)
      
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ResetPasswordInput>({
  resolver: zodResolver(resetPasswordSchema)
  });

  const { resetPassword, loading, error } = useResetPassword();

  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email;
  const email = emailFromState || localStorage.getItem("resetEmail") || localStorage.getItem("activationEmail") || "";

  const submit = async(formData : ResetPasswordInput)=>{
    try {
      const result = await resetPassword({ ...formData, email });
      console.log("Password reset successful :", result);
      localStorage.setItem("authToken", result.token)
      showToast(result.message || "Password reset successful", "success");
      reset()
      navigate("/patientDashboard", { state : {
        firstname : result.user.firstname,
        lastname : result.user.lastname
      }})
    } catch (err) {
      console.error("Reset Password error:", err, error)
      showToast(error || "Failed to reset password", "error");
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
    <AuthLayout subHeading="You're just one step away from accessing your account." heading="Reset Your Password">
      <form onSubmit={handleSubmit(submit)}>
        <label className="text-[18px] font-semibold" htmlFor="newPassword">New Password</label>

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
        <Input {...register("confirmPassword")} id='confirmPassword' type='password' placeholder='Confirm your password' className='my-2'  />
        <button type="button" onClick={toggleCPassword} 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
        {showCPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        </div>
        {errors.confirmPassword && <p className='text-red-500'>{errors.confirmPassword.message}</p>}

        <Button disabled={loading} className='mt-8 mb-2' type="submit" content={loading ? "Updating..." : "Update Password" }  />
      </form>
    </AuthLayout>
  )
}