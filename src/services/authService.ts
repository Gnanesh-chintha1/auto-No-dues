/**
 * Mock Authentication & Domain Authorization Service
 *
 * Simulates server-side domain verification, credentials validation,
 * OTP verification, and rate limiting.
 *
 * NOTE ON SECURITY POSTURE:
 * In production:
 * 1. Domain verification occurs strictly inside server-side middleware via cryptographically
 *    signed JWTs or httpOnly secure session cookies.
 * 2. Client domain selection is never trusted blindly.
 * 3. Rate-limiting is enforced via Redis token bucket at the ingress gateway.
 * 4. Browser storage never holds raw role authorizations.
 */

import { AuthSession, BranchCode, StaffAccount, StudentProfile } from '../types';
import { SEEDED_STAFF_ACCOUNTS, getStudentByRollNo } from './dataStore';

// In-memory rate limiting map: ipOrIdentifier -> { attempts: number, lockedUntil: number }
const loginAttemptMap = new Map<string, { attempts: number; lockedUntil: number }>();

export function checkRateLimit(identifier: string): { isLocked: boolean; remainingSeconds: number } {
  const record = loginAttemptMap.get(identifier);
  if (!record) return { isLocked: false, remainingSeconds: 0 };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isLocked: true, remainingSeconds };
  }

  if (record.attempts >= 3 && record.lockedUntil <= now) {
    // Reset after expiry
    loginAttemptMap.delete(identifier);
    return { isLocked: false, remainingSeconds: 0 };
  }

  return { isLocked: false, remainingSeconds: 0 };
}

export function recordFailedAttempt(identifier: string): { isLocked: boolean; remainingSeconds: number } {
  const record = loginAttemptMap.get(identifier) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;

  if (record.attempts >= 3) {
    record.lockedUntil = Date.now() + 15000; // 15 seconds lockout
    loginAttemptMap.set(identifier, record);
    return { isLocked: true, remainingSeconds: 15 };
  }

  loginAttemptMap.set(identifier, record);
  return { isLocked: false, remainingSeconds: 0 };
}

export function resetLoginAttempts(identifier: string) {
  loginAttemptMap.delete(identifier);
}

/**
 * Student Login Step 1: Validate Roll No and Password
 */
export function authenticateStudentStep1(
  rollNo: string,
  password: string
): { success: boolean; student?: StudentProfile; error?: string } {
  const normRoll = rollNo.trim().toUpperCase();
  const rate = checkRateLimit(normRoll);
  if (rate.isLocked) {
    return {
      success: false,
      error: `Security Lockout: Too many failed attempts. Please wait ${rate.remainingSeconds} seconds.`,
    };
  }

  const student = getStudentByRollNo(normRoll);
  if (!student) {
    recordFailedAttempt(normRoll);
    return { success: false, error: `Invalid student credentials. Roll Number '${normRoll}' not recognized.` };
  }

  // Password convention for demo: any 4+ char password or 'student123'
  if (!password || password.length < 4) {
    recordFailedAttempt(normRoll);
    return { success: false, error: 'Invalid password. Must be at least 4 characters.' };
  }

  resetLoginAttempts(normRoll);
  return { success: true, student };
}

/**
 * Student Login Step 2: Simulated OTP verification (mock accepts any 6-digit code)
 */
export function verifyStudentOtp(
  student: StudentProfile,
  otp: string
): { success: boolean; session?: AuthSession; error?: string } {
  const cleanedOtp = otp.trim();
  if (cleanedOtp.length !== 6 || !/^\d+$/.test(cleanedOtp)) {
    return { success: false, error: 'Please enter a valid 6-digit verification code.' };
  }

  // Generate simulated session token
  const session: AuthSession = {
    token: `STU-SESS-${student.rollNo}-${Date.now()}`,
    role: 'STUDENT',
    userId: student.rollNo,
    name: student.name,
    branch: student.branch,
    studentData: student,
  };

  return { success: true, session };
}

/**
 * Admin Login — Step 3 Domain Verification (CRITICAL BUSINESS RULE)
 *
 * In production this check happens in backend middleware, never trusting
 * the client's domain selection.
 */
export function authenticateAdmin(params: {
  staffId: string;
  password: string;
  selectedDomain: string;
  selectedBranch?: BranchCode;
  selectedLabCode?: string;
}): { success: boolean; session?: AuthSession; staffAccount?: StaffAccount; error?: string } {
  const normStaffId = params.staffId.trim().toUpperCase();
  const rate = checkRateLimit(normStaffId);
  if (rate.isLocked) {
    return {
      success: false,
      error: `Security Lockout: Section authorization locked. Please wait ${rate.remainingSeconds} seconds.`,
    };
  }

  // Look up staff account strictly from the server-side seed data
  const staff = SEEDED_STAFF_ACCOUNTS.find(
    (s) => s.id.toUpperCase() === normStaffId || s.email.toLowerCase() === params.staffId.trim().toLowerCase()
  );

  if (!staff) {
    recordFailedAttempt(normStaffId);
    return { success: false, error: `Staff ID '${params.staffId}' is not registered in the clearance registry.` };
  }

  // Check password (accepts any 4+ char password or 'admin123')
  if (!params.password || params.password.length < 4) {
    recordFailedAttempt(normStaffId);
    return { success: false, error: 'Authentication failed: Invalid staff password credentials.' };
  }

  // --- SERVER-SIDE DOMAIN VERIFICATION ---
  // Compare submitted staff's stored domain against the domain chosen in Step 1
  if (staff.allowedDomain !== params.selectedDomain) {
    recordFailedAttempt(normStaffId);
    return {
      success: false,
      error: `Domain Authorization Error: Account [${staff.id} - ${staff.name}] is designated for '${staff.allowedDomain}', not for '${params.selectedDomain}'. Access denied.`,
    };
  }

  // If lab incharge, verify branch match
  if (staff.role === 'TIER2_LAB_INCHARGE' && params.selectedBranch && staff.allowedBranch !== params.selectedBranch) {
    recordFailedAttempt(normStaffId);
    return {
      success: false,
      error: `Branch Authorization Error: Account is assigned to '${staff.allowedBranch}', not '${params.selectedBranch}'.`,
    };
  }

  resetLoginAttempts(normStaffId);

  const session: AuthSession = {
    token: `STAFF-SESS-${staff.id}-${Date.now()}`,
    role: staff.role,
    userId: staff.id,
    name: staff.name,
    designation: staff.designation,
    branch: staff.allowedBranch,
    domainId: staff.allowedDomain,
    labCode: staff.allowedLabCode,
  };

  return { success: true, session, staffAccount: staff };
}

/**
 * Executive Login — Domain & Authority Verification
 */
export function authenticateExecutive(params: {
  officerId: string;
  password: string;
  selectedRole: 'HOD' | 'DSW' | 'REGISTRAR';
  selectedBranch?: BranchCode;
}): { success: boolean; session?: AuthSession; staffAccount?: StaffAccount; error?: string } {
  const normId = params.officerId.trim().toUpperCase();
  const rate = checkRateLimit(normId);
  if (rate.isLocked) {
    return {
      success: false,
      error: `Executive Terminal Locked: Please wait ${rate.remainingSeconds} seconds before re-attempting.`,
    };
  }

  const officer = SEEDED_STAFF_ACCOUNTS.find(
    (s) => s.id.toUpperCase() === normId || s.email.toLowerCase() === params.officerId.trim().toLowerCase()
  );

  if (!officer) {
    recordFailedAttempt(normId);
    return { success: false, error: `Executive record for '${params.officerId}' not found.` };
  }

  if (!params.password || params.password.length < 4) {
    recordFailedAttempt(normId);
    return { success: false, error: 'Invalid executive passcode credentials.' };
  }

  // Verify Role match
  if (officer.role !== params.selectedRole) {
    recordFailedAttempt(normId);
    return {
      success: false,
      error: `Authority Role Mismatch: Account is not authorized for executive role '${params.selectedRole}'.`,
    };
  }

  // If HOD, verify branch match
  if (params.selectedRole === 'HOD' && params.selectedBranch && officer.allowedBranch !== params.selectedBranch) {
    recordFailedAttempt(normId);
    return {
      success: false,
      error: `Departmental Jurisdiction Error: Account is HOD for '${officer.allowedBranch}', not '${params.selectedBranch}'.`,
    };
  }

  resetLoginAttempts(normId);

  const session: AuthSession = {
    token: `EXEC-SESS-${officer.id}-${Date.now()}`,
    role: officer.role,
    userId: officer.id,
    name: officer.name,
    designation: officer.designation,
    branch: officer.allowedBranch,
    domainId: officer.allowedDomain,
  };

  return { success: true, session, staffAccount: officer };
}

const SESSION_STORAGE_KEY = 'rgukt_rkv_session';

/**
 * Session storage helpers (strictly sessionStorage, NEVER localStorage per security policy)
 */
export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function storeSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save session to sessionStorage', err);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear sessionStorage', err);
  }
}

