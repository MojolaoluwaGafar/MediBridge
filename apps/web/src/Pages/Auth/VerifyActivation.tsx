import { useState, useEffect, useRef } from 'react'
import RegisterLayout from '../../Layout/RegisterLayout'
import Frame from "../../assets/Frame 2121455033.svg"
import Input from '../../Components/Input'
import Button from '../../Components/Button'
import { useNavigate, useLocation } from 'react-router'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyCodeSchema, type VerifyCodeInput } from '../../Validation/ActivationSchema'
import { useVerifyCode } from '../../Hooks/Auth/useVerifyCode'
import { showToast } from "../../utils/toastHelper";
import api from '../../API'

export default function VerifyActivation() {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const { handleSubmit, formState : { errors }, reset, setValue} = useForm<VerifyCodeInput>({
        resolver : zodResolver(verifyCodeSchema),
        defaultValues : { code : "" }
    })
    
    const { verifyCode, loading, error } = useVerifyCode();
    const location = useLocation();
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    
    const { email, expiresAt } = location.state || {};
    useEffect(() => {
        if (!email) {
            navigate("/activate");
        }
    }, [email, navigate]);
    
    
    const [timeLeft, setTimeLeft] = useState(() => {
        if (!expiresAt) return 0;
        return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    );});
    const [expiryTime, setExpiryTime] = useState(expiresAt);
    
    useEffect(() => {
    if (!expiryTime) return;

    const expiryTimestamp = new Date(expiryTime).getTime();

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


    const submit = async()=>{
        try {
            const result = await verifyCode({ code : otp.join(""), email });
            if (email) {
                localStorage.setItem("activationEmail", email);
            }
            console.log("Code verification success :", result);
            showToast(result.message || "Code verified successfully", "success");
            reset();
            setOtp(["", "", "", "", "", ""]);
            navigate("/setPassword", { state: { email } })
        } catch (err : any) {
            const message = err.response?.data?.error || err.response?.data?.message || error || "Code Verification failed";
            console.error("Code verification error :", message)
            showToast(message, "error");
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
    <RegisterLayout heading='Securing your healthcare journey.' subHeading='We use multi-factor authentication to ensure your  medical records and personal data remain private and protected at every step.' image={Frame}>
    <form onSubmit={handleSubmit(submit)} className='border border-[#D1D5D5] rounded-xl my-4 lg:my-0 w-full p-8 fontOutfit'>
        <div className='flex flex-col lg:flex-row gap-2 items-center justify-between'>
            <p className='flex items-center gap-2 text-[#28574E]'><span className='h-8 w-8 rounded-full flex items-center justify-center bg-[#28574E] text-white'>1</span> Identity</p>
            <span className='bg-[#28574E] w-full lg:w-[45.5px] h-0.5'></span>
            <p className='flex items-center gap-2 text-[#28574E]'><span className='h-8 w-8 rounded-full flex items-center justify-center bg-[#28574E] text-white'>2</span> OTP</p>
            <span className='bg-[#E1E3E3] w-full lg:w-[45.5px] h-0.5'></span>
            <p className='flex items-center gap-2'><span className='h-8 w-8 rounded-full flex items-center justify-center bg-[#E1E3E3] text-[#3E3B3B]'>3</span> Set Up</p>
        </div>
        <h1 className="text-[28px] font-semibold pt-5">Verify your account</h1>
        <p className="pb-5 text-[#757575] text-[18px]">We’ve sent a 6-digit verification code to your email to verify your account.</p>

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
        {errors.code && <p className='text-red-500 text-center'>{errors.code.message}</p>}
        
        {timeLeft > 0 ? <p className='text-center text-[#757575] pb-5'>Code expires in {formatTime(timeLeft)}</p> : 
        <p className="text-red-500 font-semibold text-center">Code expired. Please request a new code.</p>}

        <Button className='my-8' type='submit' content={loading ? "Verifying..." : "Verify Code"} disabled={loading} />
        <p className='text-center'>Didn't receive the code? <button onClick={resendCode} type='button'><span className='text-[#28574E] font-semibold'>Resend code</span></button></p>

    </form>
    </RegisterLayout>
)
}