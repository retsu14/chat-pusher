"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RequestResetForm from "@/components/RequestResetForm";
import VerifyCodeForm from "@/components/VerifyCodeForm";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "verify" | "reset">("email");
  const [email, setEmail] = useState("");

  return (
    <div className="flex items-center justify-center h-screen  px-4 transition-all duration-300">
      <div className="w-full max-w-[480px] rounded-2xl shadow-xl border p-8 transition-all">
        {step === "email" && (
          <RequestResetForm
            onSuccess={(email) => {
              setEmail(email);
              setStep("verify");
            }}
          />
        )}

        {step === "verify" && (
          <VerifyCodeForm
            email={email}
            onSuccess={() => setStep("reset")}
            onChangeEmail={() => setStep("email")}
          />
        )}

        {step === "reset" && (
          <ResetPasswordForm email={email} onSuccess={() => router.push("/")} />
        )}
      </div>
    </div>
  );
}
