import React, { useState } from "react";
import {
  useSendCode,
  useVerifyCode,
  useVerifyPassword,
} from "../hooks/auth-hooks";
import { AxiosError } from "axios";
import TelegramLogo from "../assets/telegram-logo.svg";

interface LoginProps {
  onAuthed: () => void;
}

const Login = ({ onAuthed }: LoginProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  // Initialize mutations
  const sendCodeMutation = useSendCode();
  const verifyCodeMutation = useVerifyCode();
  const verifyPasswordMutation = useVerifyPassword();

  // Handlers
  const handleSendCode = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!phone) return;

    sendCodeMutation.mutate(
      { phoneNumber: phone },
      {
        onSuccess: () => setStep(2),
      },
    );
  };

  const handleVerifyCode = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code) return;

    verifyCodeMutation.mutate(
      { phoneNumber: phone, code },
      {
        onSuccess: (data) => {
          if (data.mfa) {
            setStep(3);
          } else {
            onAuthed();
          }
        },
      },
    );
  };

  const handleVerifyPassword = async (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    if (!password) return;

    verifyPasswordMutation.mutate(
      { phoneNumber: phone, password },
      {
        onSuccess: () => onAuthed(),
      },
    );
  };

  const getErrorMessage = (
    error: AxiosError<{ error: string }> | Error | null,
  ) => {
    if (error instanceof AxiosError) {
      return error.response?.data?.error || error.message;
    }
    return error?.message || "An unexpected error occurred.";
  };
  const inputClasses =
    "w-full bg-[#182533] text-[#f5f5f5] placeholder-[#8fa8ba] border border-[#2b3e4d] rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#5288c1] focus:border-[#5288c1] transition-all";

  const primaryButtonClasses =
    "mt-6 w-full bg-[#5288c1] hover:bg-[#5f8aac] disabled:bg-[#2b3e4d] disabled:text-[#8fa8ba] text-white font-bold px-4 py-3 rounded-lg transition-all flex justify-center items-center shadow-md";
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0e1621] text-[#f5f5f5] p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#5288c1] rounded-full flex items-center justify-center mb-4 shadow-lg">
          <img src={TelegramLogo} alt="Telegram" className="w-20 h-20" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight">Telegram</h2>
        <p className="text-[#8fa8ba] mt-2">
          Log in to manage your saved messages
        </p>
      </div>

      <div className="w-full max-w-md bg-[#17212b] p-8 rounded-2xl shadow-2xl border border-[#2b3e4d]">
        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            {sendCodeMutation.isError && (
              <div className="p-3 mb-5 text-sm text-[#ff6b6b] bg-[#2b1515] border border-[#ff6b6b]/30 rounded-lg">
                {getErrorMessage(sendCodeMutation.error)}
              </div>
            )}
            <label className="block text-xs font-bold text-[#8fa8ba] uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className={inputClasses}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 234 567 8900"
              autoFocus
            />
            <button
              type="submit"
              disabled={sendCodeMutation.isPending || !phone}
              className={primaryButtonClasses}
            >
              {sendCodeMutation.isPending ? "Connecting..." : "Next"}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            {verifyCodeMutation.isError && (
              <div className="p-3 mb-5 text-sm text-[#ff6b6b] bg-[#2b1515] border border-[#ff6b6b]/30 rounded-lg">
                {getErrorMessage(verifyCodeMutation.error)}
              </div>
            )}
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold mb-1">{phone}</h3>
              <p className="text-sm text-[#8fa8ba]">
                We've sent a code to your Telegram app.
              </p>
            </div>

            <label className="block text-xs font-bold text-[#8fa8ba] uppercase tracking-wider mb-2">
              Verification Code
            </label>
            <input
              type="text"
              className={`${inputClasses} text-center tracking-[0.75em] font-mono text-2xl`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="•••••"
              maxLength={5}
              autoFocus
            />
            <button
              type="submit"
              disabled={verifyCodeMutation.isPending || !code}
              className={primaryButtonClasses}
            >
              {verifyCodeMutation.isPending ? "Verifying..." : "Verify"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-6 w-full text-sm font-medium text-[#5288c1] hover:text-[#5f8aac] transition-colors"
            >
              Wrong number?
            </button>
          </form>
        )}

        {/* Step 3: Two-Factor Authentication (Password) */}
        {step === 3 && (
          <form onSubmit={handleVerifyPassword}>
            {verifyPasswordMutation.isError && (
              <div className="p-3 mb-5 text-sm text-[#ff6b6b] bg-[#2b1515] border border-[#ff6b6b]/30 rounded-lg">
                {getErrorMessage(verifyPasswordMutation.error)}
              </div>
            )}
            <div className="text-center mb-6">
              <span className="text-4xl mb-4 block">🔐</span>
              <h3 className="text-xl font-bold mb-1">Two-Step Verification</h3>
              <p className="text-sm text-[#8fa8ba]">
                Enter your cloud password.
              </p>
            </div>
            <input
              type="password"
              className={inputClasses}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoFocus
            />
            <button
              type="submit"
              disabled={verifyPasswordMutation.isPending || !password}
              className={primaryButtonClasses}
            >
              {verifyPasswordMutation.isPending ? "Unlocking..." : "Submit"}
            </button>
          </form>
        )}
      </div>
      <p className="mt-8 text-xs text-[#546b82]">
        This interface connects securely via your API credentials.
      </p>
    </div>
  );
};

export default Login;
