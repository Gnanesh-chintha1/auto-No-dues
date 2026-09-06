export type BranchCode =
  | 'CSE'
  | 'CSE-AI&ML'
  | 'ECE'
  | 'EEE'
  | 'MECH'
  | 'CIVIL'
  | 'CHEM'
  | 'PUC-WING';

export type AcademicYear = 'PUC-1' | 'PUC-2' | 'E1' | 'E2' | 'E3' | 'E4';

export type UserRole =
  | 'STUDENT'
  | 'TIER1_STAFF'
  | 'TIER2_LAB_INCHARGE'
  | 'HOD'
  | 'DSW'
  | 'REGISTRAR';

export type Tier1DomainId =
  | 'LIBRARY'
  | 'HOSTEL_BOYS'
  | 'HOSTEL_GIRLS'
  | 'SPORTS'
  | 'ACCOUNTS'
  | 'TPO'
  | 'EXAM_CELL'
  | 'FACULTY_ADVISOR';

export type DueItemStatus =
  | 'PENDING_REVIEW' // Greyed, locked, staff hasn't recorded yet
  | 'DUE_FLAGGED'    // Staff entered >0 due, awaiting payment or under dispute
  | 'PAYMENT_SUBMITTED' // Student submitted UTR/reference, staff verification pending
  | 'CLEARED';       // Staff signed off (₹0 recorded or payment verified)

export interface SignStamp {
  stampId: string;
  studentId: string;
  branch: BranchCode;
  sectionCode: string;
  sectionName: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  duesAmount: number;
  timestamp: string;
  signatureHash: string; // HASH(StudentId + Branch + SectionCode + OfficerId + DuesAmount + Timestamp)
}

export interface DueRecord {
  id: string;
  sectionCode: string; // e.g., 'T1_LIBRARY' or 'T2_CSE_DSA_LAB'
  sectionName: string;
  tier: 1 | 2;
  status: DueItemStatus;
  amount: number; // 0 if cleared
  remarks?: string;
  updatedByStaffId?: string;
  updatedByStaffName?: string;
  paymentReference?: string; // UTR or Bank Receipt No.
  paymentSubmittedAt?: string;
  signStamp?: SignStamp;
}

export interface ExecutiveSignOff {
  role: 'HOD' | 'DSW' | 'REGISTRAR';
  signed: boolean;
  officerId?: string;
  officerName?: string;
  signedAt?: string;
  signatureHash?: string;
}

export interface StudentProfile {
  rollNo: string; // Primary key, e.g. R200142
  name: string;
  gender: 'M' | 'F';
  branch: BranchCode;
  program: 'B.Tech' | 'PUC';
  year: AcademicYear;
  campus: 'RGUKT RK Valley (Idupulapaya)';
  batch: string;
  email: string;
  phone: string;
  fatherName: string;
  cgpa: string;
  dues: Record<string, DueRecord>;
  studentAcknowledged: boolean;
  studentAcknowledgedAt?: string;
  executiveApprovals: {
    hod: ExecutiveSignOff;
    dsw: ExecutiveSignOff;
    registrar: ExecutiveSignOff;
  };
  certificateIssued: boolean;
  certificateId?: string;
  certificateIssuedAt?: string;
  issuedAt?: string;
  masterHash?: string;
  masterCertificateHash?: string;
}

export interface StaffAccount {
  id: string; // e.g., 'STF-LIB-01'
  name: string;
  email?: string;
  aliases?: string[];
  designation: string;
  role: UserRole;
  allowedDomain: string; // Tier1DomainId | 'LAB_INCHARGE' | 'HOD' | 'DSW' | 'REGISTRAR'
  allowedBranch?: BranchCode; // For lab incharge and HOD
  allowedLabCode?: string; // For lab incharge
  genderSpecialization?: 'BOYS' | 'GIRLS';
}

export interface CurriculumLab {
  labCode: string;
  labName: string;
  yearLevel: 'Foundational' | 'E1' | 'E2' | 'E3' | 'E4' | 'Capstone';
  credits: number;
}

export interface AuthSession {
  token: string;
  role: UserRole;
  userId: string;
  name: string;
  email?: string;
  designation?: string;
  branch?: BranchCode;
  domainId?: string;
  labCode?: string;
  studentData?: StudentProfile;
}

export interface VerificationResult {
  isValid: boolean;
  authentic: boolean;
  tampered: boolean;
  message: string;
  tamperedItem?: string;
  certId: string;
  student: StudentProfile | null;
  studentRollNo: string;
  studentName: string;
  branch: BranchCode;
  issuedAt: string;
  issuedHash: string;
  computedHash: string;
  masterHash: string;
  recomputedHash: string;
  signStampsCount: number;
  executiveSignatures: {
    hod: boolean;
    dsw: boolean;
    registrar: boolean;
  };
}
