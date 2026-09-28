import AuthLayout from '../../Layout/AuthLayout'
import Input from '../../Components/Input'
import Button from '../../Components/Button'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../Validation/ActivationSchema'
import { useCodeReq } from '../../Hooks/Auth/useCodeReq'
import { showToast } from '../../utils/toastHelper'

export default function ForgotPassword() {
    const { register, handleSubmit, formState : { errors }, reset} = useForm<ForgotPasswordInput>({
        resolver : zodResolver(forgotPasswordSchema)
    });

    const { codeReq, loading, error } = useCodeReq()
    const navigate = useNavigate()
    const submit = async (formData : ForgotPasswordInput ) => {
        try {
            const result = await codeReq(formData);
            console.log("Code request successful:", result);
            localStorage.setItem("resetEmail", result.email);
            showToast(result.message, "success");
            reset()
            navigate("/verifyRecovery", { state : {
                email : result.email,
                expiresAt : result.expiresAt
            }})
        } catch (err) {
            console.error("Code request error error:", err, error);
            showToast(error || "Failed to send code", "error")
        }
    }

  return (
    <AuthLayout heading="Forgot Your Password?" subHeading="We’ll send a 6-digit verification code to your email to reset your password.">
        <form onSubmit={handleSubmit(submit)}>
            <label className="text-[18px] font-semibold" htmlFor="email">Email Address</label>
            <Input {...register("email")} className='my-2' id='email' type='email' placeholder='Enter your email address' />
            {errors.email && <p className='text-red-500'>{errors.email.message}</p>}
            <Button className='mt-8 mb-2' type="submit" content={loading ? "Sending..." : "Send Code"} disabled={loading} />

            <Link to="/login"><p className="text-center pt-3">Remember your password <span className="text-[#28574E] font-semibold">Log in</span></p></Link>
        </form>
    </AuthLayout>
)
}