"use client";

import { useState, useEffect } from "react";
import { ProfileInfoData } from "../types/form";

interface ProfileInfoProps {
  data: ProfileInfoData;
  onNext: (values: ProfileInfoData) => void;
}


export default function ProfileInfo({ data, onNext }: ProfileInfoProps) {
  const [form, setForm] = useState<ProfileInfoData>(data);

  useEffect(() => setForm(data), [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-16 mx-auto w-full p-6 shadow-2xl rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
          <svg
            className="w-6 h-6 fill-white"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
              1.79-4 4 1.79 4 4 4zm0 2c-2.67 
              0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Profile Information
          </h2>
          <p className="text-gray-500">Tell us about yourself</p>
        </div>
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="middleName">
            Middle Name
          </label>
          <input
            id="middleName"
            value={form.middleName}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-sm text-gray-500">Optional</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-sm text-gray-500">
            We&apos;ll send a verification code to this email
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="text-sm text-gray-500">
            We&apos;ll use this for important notifications
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="role">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            id="role"
            value={form.role}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select your role</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="staff">Staff</option>
            <option value="management">Management</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            id="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700" htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>


      {/* Navigation */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Continue
        </button>
      </div>
    </form>
  );
}
