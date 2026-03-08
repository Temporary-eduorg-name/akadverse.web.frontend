"use client";
import { useState, useEffect } from "react";
import { AccountSecurityData } from "../types/form";

interface AccountSecurityProps {
  data: AccountSecurityData;
  email: string;
  onBack: (values: AccountSecurityData) => void;
  onNext: (values: AccountSecurityData) => void;
}

export default function AccountSecurity({
  data,
  email,
  onBack,
  onNext,
}: AccountSecurityProps) {
  const [form, setForm] = useState<AccountSecurityData>(data);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("Very Poor");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    setForm(data);
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newForm = { ...form, [e.target.id]: e.target.value };
    setForm(newForm);
  };

  const checkStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    const met = Object.values(requirements).filter(Boolean).length;
    const percent = (met / 5) * 100;
    setStrength(percent);

    if (percent <= 20) setStrengthText("Very Poor");
    else if (percent <= 40) setStrengthText("Poor");
    else if (percent <= 60) setStrengthText("Fair");
    else if (percent <= 80) setStrengthText("Good");
    else setStrengthText("Excellent");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (strength < 60) {
      alert("Please choose a stronger password");
      return;
    }
    if (!termsAccepted) {
      alert("Please accept the Terms of Service and Privacy Policy");
      return;
    }
    onNext({ ...form });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 mx-auto w-full p-6 shadow-2xl rounded-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 fill-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"></path>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Account Security
          </h2>
          <p className="text-gray-500">
            Create secure credentials for your account
          </p>
        </div>
      </div>

      {/* Username */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="username">
          Username <span className="text-red-500">*</span>
        </label>
        <input
          id="username"
          value={form.username}
          onChange={handleChange}
          required
          placeholder="Enter username"
          className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="text-sm text-gray-500">
          Username must be 5–20 characters, letters/numbers/underscores only.
        </p>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="password">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => {
              handleChange(e);
              checkStrength(e.target.value);
            }}
            required
            placeholder="Enter password"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "🙈" : "👀"}
          </button>
        </div>

        {/* Strength meter */}
        <div className="mt-2">
          <div className="h-1.5 bg-gray-200 rounded">
            <div
              className="h-1.5 rounded transition-all"
              style={{
                width: `${strength}%`,
                backgroundColor:
                  strength < 40
                    ? "#EF4444"
                    : strength < 60
                    ? "#F97316"
                    : strength < 80
                    ? "#EAB308"
                    : "#22C55E",
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Password Strength: {strengthText}
          </p>
        </div>

        {/* Requirements */}
        <ul className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
          <li
            className={
              form.password.length >= 8 ? "text-green-600" : "text-gray-500"
            }
          >
            • At least 8 characters
          </li>
          <li
            className={
              /[A-Z]/.test(form.password) ? "text-green-600" : "text-gray-500"
            }
          >
            • One uppercase letter
          </li>
          <li
            className={
              /[a-z]/.test(form.password) ? "text-green-600" : "text-gray-500"
            }
          >
            • One lowercase letter
          </li>
          <li
            className={
              /[0-9]/.test(form.password) ? "text-green-600" : "text-gray-500"
            }
          >
            • One number
          </li>
          <li
            className={
              /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
                ? "text-green-600"
                : "text-gray-500"
            }
          >
            • One special character
          </li>
        </ul>
      </div>

      {/* Confirm password */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-gray-700"
          htmlFor="confirmPassword"
        >
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm password"
            className="border border-gray-300 rounded-lg px-4 py-2 w-full pr-10 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? "🙈" : "👀"}
          </button>
        </div>
      </div>

      {/* Email verification */}
      <div>
        <label className="text-sm font-medium text-gray-700">
          Email Verification
        </label>
        <div className="flex gap-3 items-center mt-2">
          <span className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
            {email}
          </span>
          <button
            type="button"
            onClick={() => setEmailVerified(true)}
            disabled={emailVerified}
            
            className={`px-4 py-2 rounded-lg text-white ${
              emailVerified
                ? "bg-green-500 cursor-default"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {emailVerified ? "Link Sent!" : "Send Verification Link"}
          </button>
        </div>
      </div>

      {/* Two factor toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTwoFactor(!twoFactor)}
          className={`w-10 h-6 rounded-full relative transition ${
            twoFactor ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${
              twoFactor ? "translate-x-4" : ""
            }`}
          />
        </button>
        <span className="text-gray-700">Enable Two-Factor Authentication</span>
      </div>

      {/* Security Question */}
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-gray-700"
          htmlFor="securityQuestion"
        >
          Security Question <span className="text-red-500">*</span>
        </label>
        <select
          id="securityQuestion"
          value={form.securityQuestion}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Choose a question</option>
          <option value="pet">What is your favorite meal?</option>
          <option value="school">
            What was the name of your first school?
          </option>
          <option value="city">In which city were you born?</option>
        </select>
        <input
          id="securityAnswer"
          value={form.securityAnswer}
          onChange={handleChange}
          required
          placeholder="Your answer"
          className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Terms */}
      <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="w-4 h-4 text-primary border-gray-300 rounded"
        />
        <p className="text-sm text-gray-700">
          I agree to the{" "}
          <a href="#" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t pt-4">
        <button
          type="button"
          onClick={() => onBack(form)}
          className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!termsAccepted}
          className={`px-6 py-2 rounded-lg text-white ${
            termsAccepted
              ? "bg-primary hover:bg-primary-dark"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </form>
  );
}
