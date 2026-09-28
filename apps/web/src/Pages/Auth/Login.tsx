import { useState } from 'react'
import AuthLayout from '../../Layout/AuthLayout'
import Input from '../../Components/Input'
import { Link } from 'react-router'
import Button from '../../Components/Button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { loginSchema , type LoginInput } from '../../Validation/ActivationSchema'
import { useLogin } from '../../Hooks/Auth/useLogin'
import { showToast } from '../../utils/toastHelper'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../Hooks/Auth/useAuth'

export default function Login() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  })

  const { login, loading, error } = useLogin()
  const { login: loginUser } = useAuth();

  const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword(prev => !prev);
  }

  const submit = async (data: LoginInput) => {
    try {
      const result = await login(data);
      loginUser(result.token, result.user)
      showToast(result.message || "Login successful", "success");
      reset()
      navigate("/patientDashboard")
    } catch (err) {
      console.error("Login error :", err, error);
      showToast(error || "Login failed", "error")
    }
  }

  return (
    <AuthLayout
      heading="Welcome Back"
      subHeading="Access your healthcare records, appointments, and care team."
    >
      <form onSubmit={handleSubmit(submit)} className="w-full max-w-md mx-auto px-4">
        <label className="text-[18px] font-semibold fontOutfit" htmlFor="userId">
          Hospital Patient ID / User ID
        </label>
        <Input
          {...register("UserId")}
          className="my-2 w-full"
          placeholder="Enter your Patient ID"
          type="text"
          id="userId"
        />
        {errors.UserId && <p className="text-red-500 font-semibold">{errors.UserId.message}</p>}

        <label className="text-[18px] font-semibold fontOutfit" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <Input
            {...register("password")}
            className="my-2 pr-10 w-full"
            placeholder="Enter your password"
            type={showPassword ? "text" : "password"}
            id="password"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 font-semibold">{errors.password.message}</p>}

        <Link to="/forgotPassword">
          <p className="text-[#28574E] text-[18px] py-1 fontOutfit">Forgot password?</p>
        </Link>

        <Button
          className="mt-8 mb-2 w-full"
          type="submit"
          content={loading ? "Signing in..." : "Sign in"}
          disabled={loading}
        />

        <Link to="/activate">
          <p className="text-center pt-3 fontOutfit">
            First time here? <span className="text-[#28574E] font-semibold">Activate Account</span>
          </p>
        </Link>
      </form>
    </AuthLayout>
  )
}
