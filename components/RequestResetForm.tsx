"use client";
import { useState } from "react";
import axios from "axios";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export default function RequestResetForm({
  onSuccess,
}: {
  onSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const result = schema.safeParse({ email });
    if (!result.success) {
      return setError(result.error.issues[0]?.message || "Invalid input.");
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        { email }
      );
      if (res.status === 200) {
        setMessage("A verification code has been sent to your email.");
        setTimeout(() => onSuccess(email), 800);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-2">Reset Password</h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter your email to request a reset code.
      </p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-3">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
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
          {loading ? "Sending..." : "Send Verification Code"}
        </button>
      </form>
    </>
  );
}
