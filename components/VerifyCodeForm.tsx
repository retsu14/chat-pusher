"use client";
import { useState } from "react";
import axios from "axios";

export default function VerifyCodeForm({
  email,
  onSuccess,
  onChangeEmail,
}: {
  email: string;
  onSuccess: () => void;
  onChangeEmail: () => void;
}) {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Please enter the code.");

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-code`,
        { email, code }
      );

      if (res.status === 200) {
        setMessage("Code verified successfully!");
        setTimeout(onSuccess, 800);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-2">Verify Code</h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        A 6-digit code was sent to <strong>{email}</strong>
      </p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full text-center text-lg tracking-widest font-mono p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter 6-digit code"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        <button
          type="button"
          onClick={onChangeEmail}
          className="text-sm text-blue-600 hover:underline mt-3 block text-center"
        >
          Change email
        </button>
      </form>
    </>
  );
}
