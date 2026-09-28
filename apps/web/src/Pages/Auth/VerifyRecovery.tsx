import { useState, useEffect, useRef } from 'react'
import AuthLayout from '../../Layout/AuthLayout'
import Input from '../../Components/Input'
import Vector from "../../assets/carbon_security.svg"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { verifyCodeSchema, type VerifyCodeInput } from '../../Validation/ActivationSchema'
import { showToast } from '../../utils/toastHelper'
import { useVerifyOTP } from '../../Hooks/Auth/useVerifyOTP'
import { useLocation, useNavigate } from 'react-router'
import api from '../../API'

export default function VerifyRecovery() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const { handleSubmit, formState: { errors }, reset, setValue } = useForm<VerifyCodeInput>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues : { code : ""}
    });

    const location = useLocation();
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const { email, expiresAt } = location.state || {};
        useEffect(() => {
        if (!email) {
            navigate("/login");
        }
    }, [email, navigate]);
    
    const [timeLeft, setTimeLeft] = useState(0);
    const [expiryTime, setExpiryTime] = useState(expiresAt);

    useEffect(() => {
    if (!expiryTime) return;

    const expiryTimestamp = new Date(expiryTime).getTime();
    const remaining = Math.max(
        0,
        Math.floor((expiryTimestamp - Date.now()) / 1000)
    );
    setTimeLeft(remaining);

    const timer = setInterval(() => {
        const remaining = Math.max(
            0,
            Math.floor((expiryTimestamp - Date.now()) / 1000)
        );

        setTimeLeft(remaining);

        if (remaining <= 0) {
            clearInterval(timer);
        }
    }, 1000);

    return () => clearInterval(timer);
    }, [expiryTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

        const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const digit = value.slice(-1);

        const updated = [...otp];
        updated[index] = digit;
        setOtp(updated);

        const code = updated.join("");
        setValue("code", code);

        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    
    const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
        if (otp[index]) {
            const updated = [...otp];
            updated[index] = "";
            setOtp(updated);
            setValue("code", updated.join(""));
            return;
        }

        if (index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }
    };

    const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pastedData) return;

    const updated = [...otp];

    pastedData.split("").forEach((digit, index) => {
        updated[index] = digit;
    });

    setOtp(updated);
    setValue("code", updated.join(""));

    const lastIndex = Math.min(pastedData.length - 1, 5);

    inputRefs.current[lastIndex]?.focus();
    };

    const { verifyOTP, loading, error} = useVerifyOTP()
    
    const submit = async (formData : VerifyCodeInput ) => {
            try {
                const result = await verifyOTP({ ...formData, email });
                if (email) {
                    localStorage.setItem("resetEmail", email);
                }
                console.log("Code request successful:", result);
                showToast(result.message, "success");
                reset();
                setOtp(["", "", "", "", "", ""]);
                navigate("/resetPassword", { state: { email } })
            } catch (err : any) {
                const message = err.response?.data?.error || err.response?.data?.message || error || "Failed to send OTP"
                console.error("Code request error error:", message);
                showToast(message, "error")
            }
    }
    
        const resendCode = async () => {
        try {
            const response = await api.post("/api/auth/codeReq", { email });
            showToast(response.data.message, "success");
            if (response.data?.expiresAt) {
                setExpiryTime(response.data.expiresAt)
                const newTime = Math.floor((new Date(response.data.expiresAt).getTime() - Date.now()) / 1000);
                setTimeLeft(newTime);
                setExpiryTime(response.data?.expiresAt)
                setOtp(["","","","","",""])
                setValue("code", "");
                inputRefs.current[0]?.focus();
            }
        } catch (err : any) {
            console.log("Failed to resend :", err);
            showToast(err.response?.data?.error || "Failed to resend code", "error");
        }
    };

    useEffect(() => {
    const code = otp.join("");

    if (code.length === 6) {
        handleSubmit(submit)();
    }}, [otp]);


  return (
    <AuthLayout>
        <div className="flex items-center justify-center mx-auto w-13.25 h-[52.18px] bg-[#DCF2EE] rounded-full mb-1">
            <img src={Vector} alt="" />
        </div>

        <form onSubmit={handleSubmit(submit)} className='text-center'>
            <label htmlFor="otp" className="text-[18px] font-semibold py-3">OTP Verification</label>
            <p>Enter the 6-digit code sent to {email}</p>

            <div className="flex gap-5 py-7">
                {otp.map((digit,index)=>{
            return <Input key={index} ref={(el)=>{
                inputRefs.current[index] = el;
            }}
            value={digit} onKeyDown={(e) => handleKeyDown(index, e)} onPaste={handlePaste}
            onChange={(e) => handleOtpChange(index, e.target.value)} type='text' inputMode="numeric" pattern="\d"
            maxLength={1} className="flex items-center justify-center text-center border-[1.5px] border-[#D9D9D9] w-11 h-11 text-[18px] font-semibold" />
            })}
            </div>

            {errors.code && <p className='text-red-500'>{errors.code.message}</p>}

            {timeLeft > 0 ? <p>Code expires in {formatTime(timeLeft)}</p> : 
            <p className="text-red-500 font-semibold">Code expired. Please request a new code.</p>}


            <div className='flex justify-between items-center pt-8'>
                <button onClick={resendCode} disabled={loading} className='w-44.25 h-13.5 rounded-md text-[#28574E] border-[1.5px] border-[#28574E] cursor-pointer hover:bg-[#28574E] hover:text-white' type='button'>Resend Code</button>
                <button disabled={loading || timeLeft <= 0} className='w-44.25 h-13.5 rounded-md text-white cursor-pointer bg-[#28574E] hover:bg-[#4f8379] ' type='submit'>{loading ? "Verifying..." : "Verify Code"}</button>
            </div>
        </form>
    </AuthLayout>
    )
}