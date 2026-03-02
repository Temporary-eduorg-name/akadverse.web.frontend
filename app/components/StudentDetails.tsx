"use client";
import { useEffect, useState } from "react";
import { StudentDetailsData } from "../types/form";
import { programs, colleges, level } from "../constants";

interface Props {
  data?: StudentDetailsData;
  onBack?: (values: StudentDetailsData) => void;
  onNext: (values: StudentDetailsData) => void;
}

export default function StudentDetails({ data, onBack, onNext }: Props) {
  const initial: StudentDetailsData = {
    program: "",
    college: "",
    level: "",
    matricNumber: "",
    cgpa: "",
    yearOfAcceptance: "",
    highSchool: "",
    graduationYear: "",
    qualifications: [],
    otherQualifications: "",
  };

  const [form, setForm] = useState<StudentDetailsData>(data ?? initial);
  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentDetailsData, string>>
  >({});
  const [showOtherField, setShowOtherField] = useState(false);
  
  // load saved from localStorage if component mounts and no data passed
  useEffect(() => {
    if (!data) {
      try {
        const saved = localStorage.getItem("academicDetails");
        if (saved) {
          const parsed = JSON.parse(saved) as StudentDetailsData;
          setForm((prev: object) => ({ ...prev, ...parsed }));
          if (
            parsed.qualifications &&
            parsed.qualifications.includes("other")
          ) {
            setShowOtherField(true);
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    } else {
      setForm(data);
      if (data.qualifications && data.qualifications.includes("other")) {
        setShowOtherField(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (
    key: keyof StudentDetailsData,
    value: string | string[]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value } as StudentDetailsData));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const id = e.target.id as keyof StudentDetailsData;
    const val = e.target.value;
    updateField(id, val);
    // clear field-specific error on change
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setForm((prev) => {
      const set = new Set(prev.qualifications);
      if (checked) set.add(value);
      else set.delete(value);
      const arr = Array.from(set);
      // toggle other field visibility if 'other' toggled
      setShowOtherField(set.has("other"));
      return { ...prev, qualifications: arr };
    });
    setErrors((prev) => ({ ...prev, qualifications: undefined }));
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof StudentDetailsData, string>> = {};
    if (!form.program) nextErrors.program = "Program is required.";
    if (!form.college) nextErrors.college = "College is required.";
    if (!form.level) nextErrors.level = "Level is required.";
    if (!form.matricNumber)
      nextErrors.matricNumber = "Matric number is required.";
    // CGPA validation (string -> numeric)
    const cgpaNum = parseFloat(form.cgpa);
    if (form.cgpa === "") nextErrors.cgpa = "CGPA is required.";
    else if (isNaN(cgpaNum))
      nextErrors.cgpa = "CGPA must be a number (e.g. 3.50).";
    else if (cgpaNum < 0) nextErrors.cgpa = "CGPA cannot be negative.";
    else if (cgpaNum >= 5.1) nextErrors.cgpa = "CGPA must be less than 5.0.";
    // Year of acceptance basic check (optional)
    if (!form.yearOfAcceptance)
      nextErrors.yearOfAcceptance = "Year of acceptance required.";
    if (!form.highSchool) nextErrors.highSchool = "High school is required.";
    if (!form.graduationYear)
      nextErrors.graduationYear = "Graduation year is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // save to localStorage
    try {
      localStorage.setItem("academicDetails", JSON.stringify(form));
    } catch (err) {
      // ignore
    }

    onNext(form);
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
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"></path>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Student Details
          </h2>
          <p className="text-gray-500">
            Tell us about your educational background
          </p>
        </div>
      </div>

      {/* Program */}
      <div className="mb-4">
        <label
          htmlFor="program"
          className="block text-sm font-medium text-gray-700"
        >
          Program <span className="text-red-500">*</span>
        </label>
        <select
          id="program"
          value={form.program}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select program</option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {errors.program && (
          <p className="text-sm text-red-500 mt-1">{errors.program}</p>
        )}
      </div>

      {/* College */}
      <div className="mb-4">
        <label htmlFor="college" className="block text-sm text-gray-700">
          College <span className="text-red-500">*</span>
        </label>
        <select
          id="college"
          value={form.college}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">Select college</option>
          {colleges.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {errors.college && (
          <p className="text-sm text-red-500 mt-1">{errors.college}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Level */}
        <div className="mb-4">
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700"
          >
            Level <span className="text-red-500">*</span>
          </label>
          <select
            id="level"
            value={form.level}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm px-3 py-2 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select level</option>
            {level.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.level && (
            <p className="text-sm text-red-500 mt-1">{errors.level}</p>
          )}
        </div>

        {/* Matric Number */}
        <div className="mb-4">
          <label
            htmlFor="matricNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Matric Number <span className="text-red-500">*</span>
          </label>
          <input
            id="matricNumber"
            value={form.matricNumber}
            onChange={handleChange}
            placeholder="Enter matric number"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.matricNumber && (
            <p className="text-sm text-red-500 mt-1">{errors.matricNumber}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CGPA */}
        <div className="mb-4">
          <label
            htmlFor="cgpa"
            className="block text-sm font-medium text-gray-700"
          >
            Current CGPA <span className="text-red-500">*</span>
          </label>
          <input
            id="cgpa"
            type="text"
            value={form.cgpa}
            onChange={handleChange}
            placeholder="e.g. 3.45"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.cgpa && (
            <p className="text-sm text-red-500 mt-1">{errors.cgpa}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Valid range: 0.00 ≤ CGPA &lt; 5.00
          </p>
        </div>

        {/* Year of Acceptance */}
        <div className="mb-4">
          <label
            htmlFor="yearOfAcceptance"
            className="block text-sm font-medium text-gray-700"
          >
            Year of Acceptance <span className="text-red-500">*</span>
          </label>
          <input
            id="yearOfAcceptance"
            type="number"
            value={form.yearOfAcceptance}
            onChange={handleChange}
            placeholder="e.g. 2021"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.yearOfAcceptance && (
            <p className="text-sm text-red-500 mt-1">
              {errors.yearOfAcceptance}
            </p>
          )}
        </div>
      </div>

      {/* Previous Education */}
      <div className="mt-2 mb-4">
        <label className="block text-sm font-medium text-gray-700">
          High School
        </label>
        <input
          id="highSchool"
          value={form.highSchool}
          onChange={handleChange}
          placeholder="High school name"
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        {errors.highSchool && (
          <p className="text-sm text-red-500 mt-1">{errors.highSchool}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label
            htmlFor="graduationYear"
            className="block text-sm font-medium text-gray-700"
          >
            Year of Graduation
          </label>
          <input
            id="graduationYear"
            type="number"
            value={form.graduationYear}
            onChange={handleChange}
            placeholder="e.g. 2019"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.graduationYear && (
            <p className="text-sm text-red-500 mt-1">{errors.graduationYear}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Qualifications
          </label>
          <div className="mt-2 space-y-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                value="waec"
                checked={form.qualifications.includes("waec")}
                onChange={handleCheckbox}
                className="form-checkbox h-4 w-4"
              />
              <span className="mr-2">WAEC</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                value="neco"
                checked={form.qualifications.includes("neco")}
                onChange={handleCheckbox}
                className="form-checkbox h-4 w-4"
              />
              <span className="mr-2">NECO</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                value="jamb"
                checked={form.qualifications.includes("jamb")}
                onChange={handleCheckbox}
                className="form-checkbox h-4 w-4"
              />
              <span className="mr-2">JAMB</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                value="other"
                checked={form.qualifications.includes("other")}
                onChange={handleCheckbox}
                className="form-checkbox h-4 w-4"
              />
              <span>Other</span>
            </label>
          </div>
        </div>
      </div>

      {showOtherField && (
        <div className="mb-4">
          <label
            htmlFor="otherQualifications"
            className="block text-sm font-medium text-gray-700"
          >
            Please specify other qualifications
          </label>
          <input
            id="otherQualifications"
            value={form.otherQualifications}
            onChange={handleChange}
            placeholder="Specify other qualifications"
            className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={() => onBack(form)}
              className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Back
            </button>
          )}
        </div>

        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Continue
          </button>
        </div>
      </div>
    </form>
  );
}
