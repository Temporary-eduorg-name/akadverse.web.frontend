export interface ProfileInfoData {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  role: string;
  gender: string;
  dateOfBirth: string;
}

export interface AccountSecurityData {
  username: string;
  password: string;
  confirmPassword: string;
  securityQuestion: string;
  securityAnswer: string;
}
export interface SkillLevelData {
  [skillName: string]: number;
}

export interface PreferencesData {
  [preferenceName: string]: boolean;
}

export interface ProfileLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export interface AdditionalInfoData {
  researchInterests: string[];
  technicalSkills: SkillLevelData;
  nonTechnicalSkills: SkillLevelData;
  preferences: PreferencesData;
  profiles: ProfileLinks;
  additionalComments?: string;
  showAdditionalInfo: boolean;
}


export interface StudentDetailsData {
  program: string;
  college: string;
  level: string;
  matricNumber: string;
  cgpa: string; // store as string for easier form binding, validate numerically on submit
  yearOfAcceptance: string;
  highSchool: string;
  graduationYear: string;
  qualifications: string[]; // e.g. ["waec","jamb"]
  otherQualifications?: string;
}

export interface CreateAccountData {
  studentDetails: StudentDetailsData;
  // later you can add profile:ProfileInfoData, security:AccountSecurityData etc.
}
