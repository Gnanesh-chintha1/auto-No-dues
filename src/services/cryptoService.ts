/**
 * In production this MUST run server-side with a secret key never exposed to the client
 * — this browser-side version is a structural simulation only for demo purposes.
 *
 * Cryptographic engine implementing deterministic SHA-256 signing stamps,
 * aggregated master certificate Merkle-style root hashes, and verification.
 */

import { BranchCode, SignStamp, StudentProfile } from '../types';

/**
 * Computes deterministic SHA-256 hex digest using Web Crypto API.
 */
export async function sha256Hex(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Synchronous fallback hash (FNV-1a / Murmur derived) for instant preview rendering,
 * though async sha256Hex is primary.
 */
export function fastHash(str: string): string {
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const val = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return val.toString(16).padStart(16, '0');
}

/**
 * SignStamp = HASH(StudentId + Branch + SectionCode + OfficerId + DuesAmount + Timestamp)
 */
export async function generateSignStamp(params: {
  studentId: string;
  branch: BranchCode;
  sectionCode: string;
  sectionName: string;
  officerId: string;
  officerName: string;
  officerDesignation: string;
  duesAmount: number;
  timestamp?: string;
}): Promise<SignStamp> {
  const timestamp = params.timestamp || new Date().toISOString();
  const rawPayload = `${params.studentId}:${params.branch}:${params.sectionCode}:${params.officerId}:${params.duesAmount}:${timestamp}`;
  const signatureHash = await sha256Hex(rawPayload);

  return {
    stampId: `STAMP-${signatureHash.slice(0, 10).toUpperCase()}`,
    studentId: params.studentId,
    branch: params.branch,
    sectionCode: params.sectionCode,
    sectionName: params.sectionName,
    officerId: params.officerId,
    officerName: params.officerName,
    officerDesignation: params.officerDesignation,
    duesAmount: params.duesAmount,
    timestamp,
    signatureHash,
  };
}

/**
 * Generates aggregated Master Certificate Hash combining all Section SignStamps
 * plus executive approvals in deterministic order.
 */
export async function generateMasterCertificateHash(
  student: StudentProfile
): Promise<{ certId: string; masterHash: string }> {
  const certId =
    student.certificateId ||
    `RGUKT-RKV-${student.batch || '2024'}-${student.branch}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Sort all due stamps deterministically by sectionCode
  const sortedStamps = Object.values(student.dues)
    .filter((d) => d.signStamp)
    .map((d) => d.signStamp!)
    .sort((a, b) => a.sectionCode.localeCompare(b.sectionCode));

  const stampHashesConcatenated = sortedStamps.map((s) => s.signatureHash).join('|');

  const executivePayload = [
    student.executiveApprovals.hod.signatureHash || 'NO_HOD',
    student.executiveApprovals.dsw.signatureHash || 'NO_DSW',
    student.executiveApprovals.registrar.signatureHash || 'NO_REGISTRAR',
  ].join(':');

  const masterRawPayload = `CERT:${certId}:STUDENT:${student.rollNo}:${student.branch}:STAMPS:${stampHashesConcatenated}:EXEC:${executivePayload}:ACK:${student.studentAcknowledgedAt || ''}`;
  const masterHash = await sha256Hex(masterRawPayload);

  return { certId, masterHash };
}

/**
 * Recomputes and verifies the cryptographic chain of a student certificate.
 */
export async function verifyCertificateIntegrity(
  student: StudentProfile
): Promise<{
  isValid: boolean;
  tamperedItem?: string;
  recomputedHash: string;
  expectedHash: string;
}> {
  if (!student.masterHash || !student.certificateId) {
    return {
      isValid: false,
      tamperedItem: 'Certificate not yet finalized or issued.',
      recomputedHash: '',
      expectedHash: '',
    };
  }

  // 1. Verify each individual signStamp hasn't been altered
  for (const due of Object.values(student.dues)) {
    if (!due.signStamp) {
      return {
        isValid: false,
        tamperedItem: `Missing cryptographic sign-off for section: ${due.sectionName}`,
        recomputedHash: '',
        expectedHash: student.masterHash,
      };
    }

    const expectedStamp = `${due.signStamp.studentId}:${due.signStamp.branch}:${due.signStamp.sectionCode}:${due.signStamp.officerId}:${due.signStamp.duesAmount}:${due.signStamp.timestamp}`;
    const recomputedStampHash = await sha256Hex(expectedStamp);

    if (recomputedStampHash !== due.signStamp.signatureHash) {
      return {
        isValid: false,
        tamperedItem: `Signature Stamp checksum mismatch in ${due.sectionName} (Expected: ${due.signStamp.signatureHash.slice(0, 8)}..., Got: ${recomputedStampHash.slice(0, 8)}...)`,
        recomputedHash: '',
        expectedHash: student.masterHash,
      };
    }

    // Verify duesAmount matches record
    if (due.amount !== due.signStamp.duesAmount) {
      return {
        isValid: false,
        tamperedItem: `Dues amount discrepancy in ${due.sectionName} (Recorded amount: ₹${due.amount} != Signed amount: ₹${due.signStamp.duesAmount})`,
        recomputedHash: '',
        expectedHash: student.masterHash,
      };
    }
  }

  // 2. Recompute the master certificate hash
  const { masterHash: recomputedHash } = await generateMasterCertificateHash(student);

  const isValid = recomputedHash === student.masterHash;

  return {
    isValid,
    tamperedItem: isValid ? undefined : 'Master hash chain broken: aggregated sign stamps do not match issued hash.',
    recomputedHash,
    expectedHash: student.masterHash,
  };
}

/**
 * Creates QR payload encoding verification URL.
 */
export function getQrVerificationPayload(certId: string, masterHash: string, origin?: string): string {
  const base = origin || (typeof window !== 'undefined' ? window.location.origin : 'https://portal.rguktrkv.ac.in');
  const shortHash = masterHash ? masterHash.slice(0, 16) : '0000000000000000';
  return `${base}/?verify=${certId}&hash=${shortHash}`;
}
