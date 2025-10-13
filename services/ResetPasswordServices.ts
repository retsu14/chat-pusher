const handleRequestCode = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage({ type: "", text: "" });
  setErrors({});

  const result = resetPasswordSchema.safeParse(formData);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors({ email: fieldErrors.email?.[0] });
    return;
  }

  try {
    setLoading(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
      { email: formData.email }
    );

    if (response.status === 200) {
      setMessage({
        type: "success",
        text: "A verification code was sent to your email.",
      });
      setStep("verify");
    }
  } catch (error: any) {
    setMessage({
      type: "error",
      text: error?.response?.data?.message || "Something went wrong.",
    });
  } finally {
    setLoading(false);
  }
};

const handleVerifyCode = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!code.trim())
    return setMessage({
      type: "error",
      text: "Please enter the verification code.",
    });

  try {
    setLoading(true);
    setMessage({ type: "", text: "" });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-code`,
      { email: formData.email, code }
    );

    if (response.status === 200) {
      setMessage({ type: "success", text: "Code verified successfully!" });
      setTimeout(() => {
        setStep("reset");
        setMessage({ type: "", text: "" });
      }, 600);
    }
  } catch (error: any) {
    setMessage({
      type: "error",
      text: error?.response?.data?.message || "Invalid verification code.",
    });
  } finally {
    setLoading(false);
  }
};

const handleResetPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage({ type: "", text: "" });
  setErrors({});

  const result = passwordSchema.safeParse(passwordData);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors({
      password: fieldErrors.password?.[0],
      confirmPassword: fieldErrors.confirmPassword?.[0],
    });
    return;
  }

  try {
    setLoading(true);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`,
      {
        email: formData.email,
        newPassword: passwordData.password,
      }
    );

    if (response.status === 200) {
      setMessage({
        type: "success",
        text: "Password has been reset successfully!",
      });
      setStep("email");
      setFormData({ email: "" });
      setPasswordData({ password: "", confirmPassword: "" });
      setCode("");
    }

    setTimeout(() => {
      router.push("/");
    }, 2000);
  } catch (error: any) {
    setMessage({
      type: "error",
      text: error?.response?.data?.message || "Failed to reset password.",
    });
  } finally {
    setLoading(false);
  }
};
