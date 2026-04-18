import React, { useState } from "react";
import {
  useSendCode,
  useVerifyCode,
  useVerifyPassword,
} from "../hooks/auth-hooks";
import { AxiosError } from "axios";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          Telegram Login
        </h2>

        {/* Step 1: Phone Number */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            {sendCodeMutation.isError && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {getErrorMessage(sendCodeMutation.error)}
              </div>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+123456789"
              autoFocus
            />
            <button
              type="submit"
              disabled={sendCodeMutation.isPending || !phone}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex justify-center items-center"
            >
              {sendCodeMutation.isPending ? "Sending..." : "Send Code"}
            </button>
          </form>
        )}

        {/* Step 2: Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            {verifyCodeMutation.isError && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {getErrorMessage(verifyCodeMutation.error)}
              </div>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Verification Code
            </label>
            <p className="text-xs text-slate-500 mb-3">Sent to {phone}</p>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-center tracking-[0.5em] font-mono text-lg"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="12345"
              autoFocus
            />
            <button
              type="submit"
              disabled={verifyCodeMutation.isPending || !code}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex justify-center items-center"
            >
              {verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800"
            >
              Back to Phone Number
            </button>
          </form>
        )}

        {/* Step 3: Two-Factor Authentication (Password) */}
        {step === 3 && (
          <form onSubmit={handleVerifyPassword}>
            {verifyPasswordMutation.isError && (
              <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                {getErrorMessage(verifyPasswordMutation.error)}
              </div>
            )}
            <label className="block text-sm font-medium text-slate-700 mb-1">
              2FA Password
            </label>
            <p className="text-xs text-slate-500 mb-3">
              Your account is protected by a password.
            </p>
            <input
              type="password"
              className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
            />
            <button
              type="submit"
              disabled={verifyPasswordMutation.isPending || !password}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex justify-center items-center"
            >
              {verifyPasswordMutation.isPending
                ? "Verifying..."
                : "Unlock Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
