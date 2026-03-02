"use client";
import { useState } from "react";
import ProfileInfo from "./components/ProfileInfo";
import AccountSecurity from "./components/AccountSecutiry";
import {
  ProfileInfoData,
  AccountSecurityData,
  StudentDetailsData,
  AdditionalInfoData,
} from "./types/form";
import StudentDetails from "./components/StudentDetails";
import AdditionalInfo from "./components/AdditionalInfo";

export default function CreateAccountPage() {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileInfoData>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    role: "",
    gender: "",
    dateOfBirth: "",
  });

  const [securityData, setSecurityData] = useState<AccountSecurityData>({
    username: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  });

  const [studentDetail, setStudentDetail] = useState<StudentDetailsData>({
    program: "",
    college: "",
    level: "",
    matricNumber: "",
    cgpa: "", // store as string for easier form binding, validate numerically on submit
    yearOfAcceptance: "",
    highSchool: "",
    graduationYear: "",
    qualifications: [], // e.g. ["waec","jamb"]
  });

  const [additionalInfoData, setAdditionalInfoData] =
    useState<AdditionalInfoData>({
      researchInterests: [], 
      technicalSkills: {},
      nonTechnicalSkills: {},
      preferences: {},
      profiles: {},
      additionalComments: "",
      showAdditionalInfo: true,
    });

  const handleNextProfile = (values: ProfileInfoData) => {
    setProfileData(values);
    setStep(2);
  };

  const handleNextSecurity = (values: AccountSecurityData) => {
    setSecurityData(values);
    setStep(3);
  };

  const handleNextStuDetail = (values: StudentDetailsData) => {
    setStudentDetail(values);
    setStep(4);
  };
  const handleNextAdditionalInfo = (values: AdditionalInfoData) => {
    setAdditionalInfoData(values);
    // Here you would typically submit the combined data to your backend
    const finalData = {
      profile: profileData,
      security: securityData,
      studentDetails: studentDetail,
      additionalInfo: values,
    };
    console.log("Final Data to submit:", finalData);
    // You can use fetch or axios to send this data to your backend API
    // Reset form or navigate to a success page as needed
  }
  return (
    <div className="max-w-[800px] mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Account</h1>
        <p className="text-gray-600">Step {step} of 4</p>
      </div>

      {step === 1 && (
        <ProfileInfo data={profileData} onNext={handleNextProfile} />
      )}
      {step === 2 && (
        <AccountSecurity
          data={securityData}
          email={profileData.email}
          onBack={(values) => {
            setSecurityData(values);
            setStep(1);
          }}
          onNext={handleNextSecurity}
        />
      )}
      {step === 3 && (
        <StudentDetails
          data={studentDetail}
          onBack={(values) => {
            setStudentDetail(values);
            setStep(2);
          }}
          onNext={handleNextStuDetail}
        />
      )}
      {step === 4 && 
      <AdditionalInfo 
        data={additionalInfoData}
        onBack={(values) => {
          setAdditionalInfoData(values)
          setStep(3);
        }}
        onNext={handleNextAdditionalInfo}
        />}
        
    </div>
  );
}
