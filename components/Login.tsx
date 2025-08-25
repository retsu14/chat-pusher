"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API}/api/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      // revalidate the url
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full">
      <input
        type="email"
        placeholder="Email"
        name="email"
        value={formData.email}
        onChange={onChange}
        className="text-[14px] w-full lg:max-w-[320px] placeholder:text-[14px] placeholder:text-[text-gray-400] focus:outline-none border border-transparent focus:border-blue-500 h-[36px] bg-gray-600 px-[16px] mb-[12px] rounded-lg "
      />
      <input
        type="password"
        placeholder="Password"
        name="password"
        value={formData.password}
        onChange={onChange}
        className="text-[14px] w-full lg:max-w-[320px] placeholder:text-[14px] placeholder:text-[text-gray-400] focus:outline-none border border-transparent focus:border-blue-500 h-[36px] bg-gray-600 px-[16px] mb-[12px] rounded-lg "
      />

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <div className="flex my-[20px] items-center gap-[20px]">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-blue-500 text-white px-[20px] py-[2px] font-bold h-[40px] text-[18px]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            "Log In"
          )}
        </button>
        <div className="text-[15px] text-blue-500 font-bold">
          Forgotten your password?
        </div>
      </div>
    </form>
  );
};

export default Login;
