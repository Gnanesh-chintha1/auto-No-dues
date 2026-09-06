import {
  AuthSession,
  BranchCode,
  DueRecord,
  StaffAccount,
  StudentProfile,
  UserRole,
  VerificationResult,
} from '../types';
import {
  generateMasterCertificateHash,
  generateSignStamp,
  sha256Hex,
  verifyCertificateIntegrity,
} from './cryptoService';
import { getCurriculumForStudent, getTier1SectionForStudent } from './rguktCurriculum';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from './firebase';

export const SEEDED_STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 'STF-LIB-01',
    name: 'Dr. K. Srinivasulu',
    email: 'librarian@rguktrkv.ac.in',
    designation: 'Chief University Librarian',
    role: 'TIER1_STAFF',
    allowedDomain: 'LIBRARY',
  },
  {
    id: 'STF-HST-01',
    name: 'Prof. M. Venkat Rao',
    email: 'warden.boys@rguktrkv.ac.in',
    designation: 'Chief Warden (Boys Hostels & Messes)',
    role: 'TIER1_STAFF',
    allowedDomain: 'HOSTEL_BOYS',
    genderSpecialization: 'BOYS',
  },
  {
    id: 'STF-HST-02',
    name: 'Dr. B. Lakshmi Devi',
    email: 'warden.girls@rguktrkv.ac.in',
    designation: 'Chief Warden (Girls Hostels & Messes)',
    role: 'TIER1_STAFF',
    allowedDomain: 'HOSTEL_GIRLS',
    genderSpecialization: 'GIRLS',
  },
  {
    id: 'STF-SPT-01',
    name: 'Dr. N. Chandrasekhar',
    email: 'sports@rguktrkv.ac.in',
    designation: 'Physical Education Director',
    role: 'TIER1_STAFF',
    allowedDomain: 'SPORTS',
  },
  {
    id: 'STF-ACT-01',
    name: 'Sri V. Ramana Murthy',
    email: 'accounts@rguktrkv.ac.in',
    designation: 'Senior Accounts Superintendent',
    role: 'TIER1_STAFF',
    allowedDomain: 'ACCOUNTS',
  },
  {
    id: 'STF-TPO-01',
    name: 'Sri P. Sumanth',
    email: 'tpo@rguktrkv.ac.in',
    designation: 'Training & Placement Officer',
    role: 'TIER1_STAFF',
    allowedDomain: 'TPO',
  },
  {
    id: 'STF-EXM-01',
    name: 'Dr. T. Hemalatha',
    email: 'coe@rguktrkv.ac.in',
    designation: 'Additional Controller of Examinations',
    role: 'TIER1_STAFF',
    allowedDomain: 'EXAM_CELL',
  },
  {
    id: 'STF-ADV-01',
    name: 'Dr. G. Rajesh Kumar',
    email: 'advisor@rguktrkv.ac.in',
    designation: 'Senior Associate Professor & Faculty Mentor',
    role: 'TIER1_STAFF',
    allowedDomain: 'FACULTY_ADVISOR',
  },
  // Tier 2 Lab In-Charges
  {
    id: 'STF-LAB-CSE-01',
    name: 'Sri K. Praveen Kumar',
    email: 'praveen.cse@rguktrkv.ac.in',
    designation: 'Lab Technical Officer (Algorithms & Networks)',
    role: 'TIER2_LAB_INCHARGE',
    allowedDomain: 'LAB_INCHARGE',
    allowedBranch: 'CSE',
    allowedLabCode: 'CSE-201',
  },
  {
    id: 'STF-LAB-ECE-01',
    name: 'Dr. S. Mohan Rao',
    email: 'mohan.ece@rguktrkv.ac.in',
    designation: 'Senior Lab Officer (VLSI & Circuits)',
    role: 'TIER2_LAB_INCHARGE',
    allowedDomain: 'LAB_INCHARGE',
    allowedBranch: 'ECE',
    allowedLabCode: 'ECE-201',
  },
  {
    id: 'STF-LAB-PUC-01',
    name: 'Dr. A. Sudha Rani',
    email: 'sudha.puc@rguktrkv.ac.in',
    designation: 'PUC Physics Laboratory Head',
    role: 'TIER2_LAB_INCHARGE',
    allowedDomain: 'LAB_INCHARGE',
    allowedBranch: 'PUC-WING',
    allowedLabCode: 'PUC-PHY-01',
  },
  // Tier 3 Executive Authorities
  {
    id: 'EXEC-HOD-CSE',
    name: 'Prof. Dr. Y. V. Narayana',
    email: 'hod.cse@rguktrkv.ac.in',
    designation: 'Head of the Department (Computer Science & Engg.)',
    role: 'HOD',
    allowedDomain: 'HOD',
    allowedBranch: 'CSE',
  },
  {
    id: 'EXEC-HOD-ECE',
    name: 'Prof. Dr. P. Satyanarayana',
    email: 'hod.ece@rguktrkv.ac.in',
    designation: 'Head of the Department (Electronics & Comm. Engg.)',
    role: 'HOD',
    allowedDomain: 'HOD',
    allowedBranch: 'ECE',
  },
  {
    id: 'EXEC-HOD-EEE',
    name: 'Prof. Dr. K. Ramanjaneyulu',
    email: 'hod.eee@rguktrkv.ac.in',
    designation: 'Head of the Department (Electrical & Electronics Engg.)',
    role: 'HOD',
    allowedDomain: 'HOD',
    allowedBranch: 'EEE',
  },
  {
    id: 'EXEC-DSW-01',
    name: 'Prof. Dr. M. Jayachandra Reddy',
    email: 'dsw@rguktrkv.ac.in',
    designation: 'Dean of Students Welfare (DSW)',
    role: 'DSW',
    allowedDomain: 'DSW',
  },
  {
    id: 'EXEC-REG-01',
    name: 'Prof. Dr. S. Amarendra Rao',
    email: 'registrar@rguktrkv.ac.in',
    designation: 'Registrar & Director i/c, RGUKT RK Valley',
    role: 'REGISTRAR',
    allowedDomain: 'REGISTRAR',
  },
];

function buildInitialDuesForStudent(branch: BranchCode, gender: 'M' | 'F'): Record<string, DueRecord> {
  const dues: Record<string, DueRecord> = {};

  // Tier 1 General Offices
  const tier1Sections = getTier1SectionForStudent(gender);
  for (const s of tier1Sections) {
    dues[s.code] = {
      id: s.code,
      sectionCode: s.code,
      sectionName: s.name,
      tier: 1,
      status: 'PENDING_REVIEW', // Locked until staff records
      amount: 0,
    };
  }

  // Tier 2 Branch Labs
  const labs = getCurriculumForStudent(branch);
  for (const lab of labs) {
    const code = `T2_${branch}_${lab.labCode}`;
    dues[code] = {
      id: code,
      sectionCode: code,
      sectionName: `${lab.labCode} — ${lab.labName}`,
      tier: 2,
      status: 'PENDING_REVIEW', // Locked until staff acts
      amount: 0,
    };
  }

  return dues;
}

// Initial Seed Store
let studentStore: Record<string, StudentProfile> = {};

/**
 * Seeds our 4 required demo student personas with authentic mock state.
 */
export async function initializeDataStore() {
  if (Object.keys(studentStore).length > 0) return;

  // 1. Alex Mercer (R200142, B.Tech CSE, In Progress)
  // Has some cleared, 1 flagged due in Library (₹450), labs partly signed
  const alexDues = buildInitialDuesForStudent('CSE', 'M');

  // Library has flagged due
  alexDues['T1_LIBRARY'] = {
    ...alexDues['T1_LIBRARY'],
    status: 'DUE_FLAGGED',
    amount: 450,
    remarks: '2 Books Overdue (Algorithms by CLRS, Operating System Concepts). Clean return required.',
    updatedByStaffId: 'STF-LIB-01',
    updatedByStaffName: 'Dr. K. Srinivasulu',
  };

  // Accounts cleared
  const stampAccounts = await generateSignStamp({
    studentId: 'R200142',
    branch: 'CSE',
    sectionCode: 'T1_ACCOUNTS',
    sectionName: 'University Accounts & Fee Settlement Section',
    officerId: 'STF-ACT-01',
    officerName: 'Sri V. Ramana Murthy',
    officerDesignation: 'Senior Accounts Superintendent',
    duesAmount: 0,
    timestamp: '2026-09-01T10:30:00Z',
  });
  alexDues['T1_ACCOUNTS'] = {
    ...alexDues['T1_ACCOUNTS'],
    status: 'CLEARED',
    amount: 0,
    remarks: 'All 8 semesters tuition and RTF scholarship settled.',
    updatedByStaffId: 'STF-ACT-01',
    updatedByStaffName: 'Sri V. Ramana Murthy',
    signStamp: stampAccounts,
  };

  // Hostel Boys cleared
  const stampHostel = await generateSignStamp({
    studentId: 'R200142',
    branch: 'CSE',
    sectionCode: 'T1_HOSTEL_BOYS',
    sectionName: "Boys' Hostel & Central Mess Committee",
    officerId: 'STF-HST-01',
    officerName: 'Prof. M. Venkat Rao',
    officerDesignation: 'Chief Warden (Boys Hostels & Messes)',
    duesAmount: 0,
    timestamp: '2026-09-02T14:15:00Z',
  });
  alexDues['T1_HOSTEL_BOYS'] = {
    ...alexDues['T1_HOSTEL_BOYS'],
    status: 'CLEARED',
    amount: 0,
    remarks: 'Room BH-3/402 keys surrendered, inventory inspected.',
    signStamp: stampHostel,
  };

  // CSE-201 Data Structures Lab cleared
  const stampDsa = await generateSignStamp({
    studentId: 'R200142',
    branch: 'CSE',
    sectionCode: 'T2_CSE_CSE-201',
    sectionName: 'CSE-201 — Data Structures & Algorithms Lab',
    officerId: 'STF-LAB-CSE-01',
    officerName: 'Sri K. Praveen Kumar',
    officerDesignation: 'Lab Technical Officer',
    duesAmount: 0,
    timestamp: '2026-09-03T11:00:00Z',
  });
  alexDues['T2_CSE_CSE-201'] = {
    ...alexDues['T2_CSE_CSE-201'],
    status: 'CLEARED',
    amount: 0,
    remarks: 'All lab records submitted and terminal practical cleared.',
    signStamp: stampDsa,
  };

  // 2. Pooja Reddy (R200188, B.Tech ECE, All Cleared — Ready for Certificate)
  const poojaDues = buildInitialDuesForStudent('ECE', 'F');

  // Sign off every Tier 1 section for Pooja
  for (const [key, d] of Object.entries(poojaDues)) {
    const stamp = await generateSignStamp({
      studentId: 'R200188',
      branch: 'ECE',
      sectionCode: d.sectionCode,
      sectionName: d.sectionName,
      officerId: d.tier === 1 ? 'STF-GEN-ECE' : 'STF-LAB-ECE-01',
      officerName: d.tier === 1 ? 'Designated Tier-1 Officer' : 'Dr. S. Mohan Rao',
      officerDesignation: d.tier === 1 ? 'Section Clearance Officer' : 'Senior Lab Officer (ECE)',
      duesAmount: 0,
      timestamp: '2026-09-04T09:00:00Z',
    });
    poojaDues[key] = {
      ...d,
      status: 'CLEARED',
      amount: 0,
      remarks: 'No dues pending. Digital sign-off complete.',
      signStamp: stamp,
    };
  }

  const poojaHodStamp = await sha256Hex('EXEC:HOD:R200188:ECE:EXEC-HOD-ECE:2026-09-05T10:00:00Z');
  const poojaDswStamp = await sha256Hex('EXEC:DSW:R200188:EXEC-DSW-01:2026-09-05T14:30:00Z');
  const poojaRegStamp = await sha256Hex('EXEC:REGISTRAR:R200188:EXEC-REG-01:2026-09-05T16:00:00Z');

  const poojaProfile: StudentProfile = {
    rollNo: 'R200188',
    name: 'Pooja Reddy',
    gender: 'F',
    branch: 'ECE',
    program: 'B.Tech',
    year: 'E4',
    campus: 'RGUKT RK Valley (Idupulapaya)',
    batch: '2020-2024',
    email: 'r200188@rguktrkv.ac.in',
    phone: '+91 98480 22331',
    fatherName: 'P. Venkata Ramana Reddy',
    cgpa: '8.92',
    dues: poojaDues,
    studentAcknowledged: true,
    studentAcknowledgedAt: '2026-09-05T09:30:00Z',
    executiveApprovals: {
      hod: {
        role: 'HOD',
        signed: true,
        officerId: 'EXEC-HOD-ECE',
        officerName: 'Prof. Dr. P. Satyanarayana',
        signedAt: '2026-09-05T10:00:00Z',
        signatureHash: poojaHodStamp,
      },
      dsw: {
        role: 'DSW',
        signed: true,
        officerId: 'EXEC-DSW-01',
        officerName: 'Prof. Dr. M. Jayachandra Reddy',
        signedAt: '2026-09-05T14:30:00Z',
        signatureHash: poojaDswStamp,
      },
      registrar: {
        role: 'REGISTRAR',
        signed: true,
        officerId: 'EXEC-REG-01',
        officerName: 'Prof. Dr. S. Amarendra Rao',
        signedAt: '2026-09-05T16:00:00Z',
        signatureHash: poojaRegStamp,
      },
    },
    certificateIssued: true,
    certificateId: 'RGUKT-RKV-2024-ECE-882104',
    certificateIssuedAt: '2026-09-05T16:15:00Z',
  };

  const { masterHash: poojaMasterHash } = await generateMasterCertificateHash(poojaProfile);
  poojaProfile.masterHash = poojaMasterHash;
  poojaProfile.masterCertificateHash = poojaMasterHash;
  poojaProfile.issuedAt = poojaProfile.certificateIssuedAt;

  // 3. Kiran Kumar (R210050, PUC Wing P2) - 8 Foundational Labs only
  const kiranDues = buildInitialDuesForStudent('PUC-WING', 'M');
  // Clearance in progress
  const kiranProfile: StudentProfile = {
    rollNo: 'R210050',
    name: 'Kiran Kumar',
    gender: 'M',
    branch: 'PUC-WING',
    program: 'PUC',
    year: 'PUC-2',
    campus: 'RGUKT RK Valley (Idupulapaya)',
    batch: '2021-2023',
    email: 'r210050@rguktrkv.ac.in',
    phone: '+91 94401 88123',
    fatherName: 'K. Subba Rao',
    cgpa: '8.45',
    dues: kiranDues,
    studentAcknowledged: false,
    executiveApprovals: {
      hod: { role: 'HOD', signed: false },
      dsw: { role: 'DSW', signed: false },
      registrar: { role: 'REGISTRAR', signed: false },
    },
    certificateIssued: false,
  };

  // 4. Fresh Student (R200999, B.Tech EEE, Ready to Initiate)
  // All line items strictly PENDING_REVIEW! Staff must enter first.
  const freshDues = buildInitialDuesForStudent('EEE', 'M');
  const freshProfile: StudentProfile = {
    rollNo: 'R200999',
    name: 'Fresh Student (S. Tarun)',
    gender: 'M',
    branch: 'EEE',
    program: 'B.Tech',
    year: 'E4',
    campus: 'RGUKT RK Valley (Idupulapaya)',
    batch: '2020-2024',
    email: 'r200999@rguktrkv.ac.in',
    phone: '+91 91234 56789',
    fatherName: 'S. Koteswara Rao',
    cgpa: '7.85',
    dues: freshDues,
    studentAcknowledged: false,
    executiveApprovals: {
      hod: { role: 'HOD', signed: false },
      dsw: { role: 'DSW', signed: false },
      registrar: { role: 'REGISTRAR', signed: false },
    },
    certificateIssued: false,
  };

  // Put Alex profile
  studentStore['R200142'] = {
    rollNo: 'R200142',
    name: 'Alex Mercer',
    gender: 'M',
    branch: 'CSE',
    program: 'B.Tech',
    year: 'E4',
    campus: 'RGUKT RK Valley (Idupulapaya)',
    batch: '2020-2024',
    email: 'r200142@rguktrkv.ac.in',
    phone: '+91 97000 11223',
    fatherName: 'David Mercer',
    cgpa: '8.68',
    dues: alexDues,
    studentAcknowledged: false,
    executiveApprovals: {
      hod: { role: 'HOD', signed: false },
      dsw: { role: 'DSW', signed: false },
      registrar: { role: 'REGISTRAR', signed: false },
    },
    certificateIssued: false,
  };

  studentStore['R200188'] = poojaProfile;
  studentStore['R210050'] = kiranProfile;
  studentStore['R200999'] = freshProfile;

  // Validate connection to Firestore as mandated by skill
  await testConnection();

  // Hydrate from Firestore if documents exist, otherwise persist seeded data
  try {
    const snapshot = await getDocs(collection(db, 'students'));
    if (!snapshot.empty) {
      snapshot.forEach((d) => {
        const data = d.data() as StudentProfile;
        if (data && data.rollNo) {
          studentStore[data.rollNo.toUpperCase()] = data;
        }
      });
      notifyListeners();
    } else {
      // Seed Firestore with baseline demo students
      for (const roll of Object.keys(studentStore)) {
        await setDoc(doc(db, 'students', roll), studentStore[roll]);
      }
      if (poojaProfile.certificateIssued && poojaProfile.certificateId) {
        await setDoc(doc(db, 'certificates', poojaProfile.certificateId), {
          certId: poojaProfile.certificateId,
          rollNo: poojaProfile.rollNo,
          name: poojaProfile.name,
          branch: poojaProfile.branch,
          masterHash: poojaProfile.masterHash,
          issuedAt: poojaProfile.certificateIssuedAt,
          signStampsCount: Object.values(poojaProfile.dues).filter((d) => d.signStamp).length,
        });
      }
    }
  } catch (err) {
    console.warn('[Firestore] Sync initialized with local fallback:', err);
  }

  // Attach real-time Firestore onSnapshot listener
  try {
    onSnapshot(
      collection(db, 'students'),
      (snapshot) => {
        let changed = false;
        snapshot.docChanges().forEach((change) => {
          const sData = change.doc.data() as StudentProfile;
          if (sData && sData.rollNo) {
            studentStore[sData.rollNo.toUpperCase()] = sData;
            changed = true;
          }
        });
        if (changed) {
          notifyListeners();
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'students');
      }
    );
  } catch (err) {
    console.warn('[Firestore] onSnapshot error:', err);
  }
}

// Subscription to real-time store changes
type StoreListener = (students: StudentProfile[]) => void;
const storeListeners = new Set<StoreListener>();

export function subscribeToStore(listener: StoreListener): () => void {
  storeListeners.add(listener);
  return () => {
    storeListeners.delete(listener);
  };
}

export function notifyListeners() {
  const all = getAllStudents();
  storeListeners.forEach((fn) => {
    try {
      fn(all);
    } catch (e) {
      console.error('Error in store listener:', e);
    }
  });
}

export async function syncStudentToFirestore(student: StudentProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.rollNo.toUpperCase()), student);
    notifyListeners();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${student.rollNo}`);
  }
}

// Ensure init runs
initializeDataStore();

/**
 * Accessors and state mutators
 */
export function getStudentByRollNo(rollNo: string): StudentProfile | null {
  const student = studentStore[rollNo.toUpperCase()];
  return student ? JSON.parse(JSON.stringify(student)) : null;
}

export function getAllStudents(): StudentProfile[] {
  return Object.values(studentStore).map((s) => JSON.parse(JSON.stringify(s)));
}

export function getStudentByCertId(certId: string): StudentProfile | null {
  const match = Object.values(studentStore).find((s) => s.certificateId === certId);
  return match ? JSON.parse(JSON.stringify(match)) : null;
}

/**
 * Staff-First Step 1: Staff enters due (amount = 0 or specific amount)
 */
export async function recordStaffDue(
  rollNo: string,
  sectionCode: string,
  amount: number,
  remarks: string,
  staff: StaffAccount
): Promise<{ success: boolean; message: string; student: StudentProfile }> {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  const due = student.dues[sectionCode];
  if (!due) throw new Error(`Section ${sectionCode} not found for student ${rollNo}.`);

  if (amount < 0) throw new Error('Dues amount cannot be negative.');

  const timestamp = new Date().toISOString();

  if (amount === 0) {
    // Record as ₹0 / No Dues, and generate digital SignStamp immediately!
    const stamp = await generateSignStamp({
      studentId: student.rollNo,
      branch: student.branch,
      sectionCode: due.sectionCode,
      sectionName: due.sectionName,
      officerId: staff.id,
      officerName: staff.name,
      officerDesignation: staff.designation,
      duesAmount: 0,
      timestamp,
    });

    student.dues[sectionCode] = {
      ...due,
      status: 'CLEARED',
      amount: 0,
      remarks: remarks || 'Confirmed ₹0 / No Dues by authority.',
      updatedByStaffId: staff.id,
      updatedByStaffName: staff.name,
      signStamp: stamp,
    };

    await syncStudentToFirestore(student);

    return {
      success: true,
      message: `Confirmed ₹0 / No Dues for ${due.sectionName}. Digitally signed and cleared.`,
      student: JSON.parse(JSON.stringify(student)),
    };
  } else {
    // Flag due: student is locked from editing amount, must pay this exact fixed figure
    student.dues[sectionCode] = {
      ...due,
      status: 'DUE_FLAGGED',
      amount,
      remarks: remarks || `Outstanding due of ₹${amount} recorded. Payment verification mandatory.`,
      updatedByStaffId: staff.id,
      updatedByStaffName: staff.name,
      signStamp: undefined,
    };

    await syncStudentToFirestore(student);

    return {
      success: true,
      message: `Due of ₹${amount} recorded for ${due.sectionName}. Awaiting student payment reference.`,
      student: JSON.parse(JSON.stringify(student)),
    };
  }
}

/**
 * Staff-First Step 3: Student submits payment reference / UTR
 */
export function submitStudentPayment(
  rollNo: string,
  sectionCode: string,
  utrReference: string
): { success: boolean; message: string; student: StudentProfile } {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  const due = student.dues[sectionCode];
  if (!due) throw new Error(`Section ${sectionCode} not found.`);

  if (due.status !== 'DUE_FLAGGED') {
    throw new Error('Payment reference can only be submitted against a flagged due.');
  }

  if (!utrReference || utrReference.trim().length < 6) {
    throw new Error('Please provide a valid Bank Transaction / UTR / Reference ID (minimum 6 alphanumeric chars).');
  }

  due.status = 'PAYMENT_SUBMITTED';
  due.paymentReference = utrReference.trim();
  due.paymentSubmittedAt = new Date().toISOString();

  syncStudentToFirestore(student);

  return {
    success: true,
    message: `Payment UTR (${utrReference}) submitted successfully. Awaiting staff verification.`,
    student: JSON.parse(JSON.stringify(student)),
  };
}

/**
 * Staff-First Step 4: Staff verifies payment and digitally signs off
 */
export async function verifyAndSignPayment(
  rollNo: string,
  sectionCode: string,
  verified: boolean,
  staff: StaffAccount,
  staffRemarks?: string
): Promise<{ success: boolean; message: string; student: StudentProfile }> {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  const due = student.dues[sectionCode];
  if (!due) throw new Error(`Section ${sectionCode} not found.`);

  if (due.status !== 'PAYMENT_SUBMITTED') {
    throw new Error('Cannot verify payment: no payment submission found for this due.');
  }

  if (!verified) {
    // Rejected UTR
    due.status = 'DUE_FLAGGED';
    due.paymentReference = undefined;
    due.remarks = staffRemarks || 'Payment reference could not be verified. Please re-submit valid UTR or visit section.';
    await syncStudentToFirestore(student);
    return {
      success: false,
      message: 'Payment rejected. Due re-flagged.',
      student: JSON.parse(JSON.stringify(student)),
    };
  }

  // Verified: settle to ₹0 and digitally sign
  const originalAmount = due.amount;
  const stamp = await generateSignStamp({
    studentId: student.rollNo,
    branch: student.branch,
    sectionCode: due.sectionCode,
    sectionName: due.sectionName,
    officerId: staff.id,
    officerName: staff.name,
    officerDesignation: staff.designation,
    duesAmount: 0,
    timestamp: new Date().toISOString(),
  });

  student.dues[sectionCode] = {
    ...due,
    status: 'CLEARED',
    amount: 0,
    remarks: staffRemarks || `Payment of ₹${originalAmount} verified via UTR [${due.paymentReference}]. Cleared.`,
    updatedByStaffId: staff.id,
    updatedByStaffName: staff.name,
    signStamp: stamp,
  };

  await syncStudentToFirestore(student);

  return {
    success: true,
    message: `Payment verified. Digital clearance stamp generated for ${due.sectionName}.`,
    student: JSON.parse(JSON.stringify(student)),
  };
}

/**
 * Student Digital Acknowledgement / e-Signature
 */
export function studentAcknowledge(rollNo: string): { success: boolean; student: StudentProfile } {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  student.studentAcknowledged = true;
  student.studentAcknowledgedAt = new Date().toISOString();

  syncStudentToFirestore(student);

  return { success: true, student: JSON.parse(JSON.stringify(student)) };
}

/**
 * Executive Sign-Off (Strict Ordering Gate):
 * - HOD: cannot sign until 100% of that branch's Tier 2 labs are cleared.
 * - DSW & Registrar: cannot sign until Tier 1 + HOD are both complete.
 */
export async function executiveSign(
  rollNo: string,
  role: 'HOD' | 'DSW' | 'REGISTRAR',
  officer: StaffAccount
): Promise<{ success: boolean; message: string; student: StudentProfile }> {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  const allDues = Object.values(student.dues);
  const tier1Dues = allDues.filter((d) => d.tier === 1);
  const tier2Dues = allDues.filter((d) => d.tier === 2);

  const unclearedTier2 = tier2Dues.filter((d) => d.status !== 'CLEARED');
  const unclearedTier1 = tier1Dues.filter((d) => d.status !== 'CLEARED');

  if (role === 'HOD') {
    if (unclearedTier2.length > 0) {
      throw new Error(
        `Strict Gate Violation: HOD cannot sign until 100% of ${student.branch} branch labs are cleared. Pending labs (${unclearedTier2.length}): ${unclearedTier2.map((l) => l.sectionName).join(', ')}`
      );
    }
  } else if (role === 'DSW' || role === 'REGISTRAR') {
    if (unclearedTier1.length > 0) {
      throw new Error(
        `Strict Gate Violation: ${role} cannot sign until 100% of Tier 1 General Offices are cleared. Pending sections (${unclearedTier1.length}): ${unclearedTier1.map((s) => s.sectionName).join(', ')}`
      );
    }
    if (!student.executiveApprovals.hod.signed) {
      throw new Error(`Strict Gate Violation: ${role} cannot sign until Head of Department (HOD) approval is completed.`);
    }
    if (role === 'REGISTRAR' && !student.executiveApprovals.dsw.signed) {
      throw new Error('Strict Gate Violation: Registrar cannot sign until Dean of Students Welfare (DSW) has signed.');
    }
  }

  const timestamp = new Date().toISOString();
  const signatureHash = await sha256Hex(
    `EXEC:${role}:${student.rollNo}:${officer.id}:${timestamp}`
  );

  if (role === 'HOD') {
    student.executiveApprovals.hod = {
      role: 'HOD',
      signed: true,
      officerId: officer.id,
      officerName: officer.name,
      signedAt: timestamp,
      signatureHash,
    };
  } else if (role === 'DSW') {
    student.executiveApprovals.dsw = {
      role: 'DSW',
      signed: true,
      officerId: officer.id,
      officerName: officer.name,
      signedAt: timestamp,
      signatureHash,
    };
  } else if (role === 'REGISTRAR') {
    student.executiveApprovals.registrar = {
      role: 'REGISTRAR',
      signed: true,
      officerId: officer.id,
      officerName: officer.name,
      signedAt: timestamp,
      signatureHash,
    };
  }

  await syncStudentToFirestore(student);

  return {
    success: true,
    message: `Executive digital sign-off completed by ${officer.designation} [${officer.name}].`,
    student: JSON.parse(JSON.stringify(student)),
  };
}

/**
 * Gate Completeness Check:
 * Returns list of missing requirements blocking certificate generation.
 */
export function checkCertificateReadiness(student: StudentProfile): {
  isReady: boolean;
  missingItems: string[];
} {
  const missingItems: string[] = [];
  const allDues = Object.values(student.dues);

  const unclearedTier1 = allDues.filter((d) => d.tier === 1 && d.status !== 'CLEARED');
  if (unclearedTier1.length > 0) {
    missingItems.push(`${unclearedTier1.length} Tier-1 Office(s) uncleared (${unclearedTier1.map((d) => d.sectionName.split(' ')[0]).join(', ')})`);
  }

  const unclearedTier2 = allDues.filter((d) => d.tier === 2 && d.status !== 'CLEARED');
  if (unclearedTier2.length > 0) {
    missingItems.push(`${unclearedTier2.length} Tier-2 Lab(s) uncleared`);
  }

  if (!student.executiveApprovals.hod.signed) {
    missingItems.push('HOD digital endorsement');
  }

  if (!student.studentAcknowledged) {
    missingItems.push('Student digital e-acknowledgement');
  }

  if (!student.executiveApprovals.dsw.signed) {
    missingItems.push('Dean of Students Welfare (DSW) signature');
  }

  if (!student.executiveApprovals.registrar.signed) {
    missingItems.push('Registrar / Director final sign-off');
  }

  return {
    isReady: missingItems.length === 0,
    missingItems,
  };
}

/**
 * Defensive Certificate Generation Backend
 */
export async function generateCertificate(
  rollNo: string
): Promise<{ success: boolean; certId: string; masterHash: string; student: StudentProfile }> {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  const check = checkCertificateReadiness(student);
  if (!check.isReady) {
    throw new Error(
      `Defensive Gate Rejection: Certificate cannot be generated. Missing prerequisites: ${check.missingItems.join('; ')}`
    );
  }

  const { certId, masterHash } = await generateMasterCertificateHash(student);

  student.certificateIssued = true;
  student.certificateId = certId;
  student.certificateIssuedAt = new Date().toISOString();
  student.issuedAt = student.certificateIssuedAt;
  student.masterHash = masterHash;
  student.masterCertificateHash = masterHash;

  await syncStudentToFirestore(student);

  try {
    await setDoc(doc(db, 'certificates', certId), {
      certId,
      rollNo: student.rollNo,
      name: student.name,
      branch: student.branch,
      masterHash,
      issuedAt: student.certificateIssuedAt,
      signStampsCount: Object.values(student.dues).filter((d) => d.signStamp).length,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `certificates/${certId}`);
  }

  return {
    success: true,
    certId,
    masterHash,
    student: JSON.parse(JSON.stringify(student)),
  };
}

/**
 * Tamper-attempt demo helper (Presenter feature to mutate a record live)
 */
export function tamperStudentRecord(
  rollNo: string,
  sectionCode: string,
  tamperAmount: number
): { success: boolean; message: string; student: StudentProfile } {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  const due = student.dues[sectionCode];
  if (!due) throw new Error(`Section ${sectionCode} not found.`);

  // Directly tamper the amount without updating cryptographic signStamp
  due.amount = tamperAmount;
  due.remarks = `[TAMPER INJECTED]: Record manually modified to ₹${tamperAmount} in database!`;

  syncStudentToFirestore(student);

  return {
    success: true,
    message: `Database entry for ${due.sectionName} tampered to ₹${tamperAmount}. Cryptographic hash chain now out-of-sync!`,
    student: JSON.parse(JSON.stringify(student)),
  };
}

/**
 * Reset student to authentic state
 */
export async function resetStudentToOriginal(rollNo: string) {
  delete studentStore[rollNo.toUpperCase()];
  await initializeDataStore();
  const resetStudent = studentStore[rollNo.toUpperCase()];
  if (resetStudent) {
    await syncStudentToFirestore(resetStudent);
  }
  return resetStudent;
}

/**
 * Public Verification by Certificate ID or Roll Number
 */
export async function verifyCertificateById(certIdOrRoll: string): Promise<VerificationResult> {
  const query = certIdOrRoll.trim().toUpperCase();
  // Find student by certificateId or rollNo
  let student = Object.values(studentStore).find(
    (s) =>
      (s.certificateId && s.certificateId.toUpperCase() === query) ||
      s.rollNo.toUpperCase() === query
  );

  if (!student) {
    try {
      const certDoc = await getDoc(doc(db, 'certificates', query));
      if (certDoc.exists()) {
        const cData = certDoc.data();
        if (cData && cData.rollNo) {
          const sDoc = await getDoc(doc(db, 'students', cData.rollNo.toUpperCase()));
          if (sDoc.exists()) {
            student = sDoc.data() as StudentProfile;
            studentStore[student.rollNo.toUpperCase()] = student;
          }
        }
      } else {
        const sDoc = await getDoc(doc(db, 'students', query));
        if (sDoc.exists()) {
          student = sDoc.data() as StudentProfile;
          studentStore[student.rollNo.toUpperCase()] = student;
        }
      }
    } catch (err) {
      console.warn('Certificate lookup fallback in Firestore:', err);
    }
  }

  if (!student || !student.certificateIssued || !student.certificateId) {
    return {
      isValid: false,
      authentic: false,
      tampered: false,
      message: `No issued certificate found for query "${certIdOrRoll}". Ensure student has completed the full 3-tier clearance hierarchy and certificate has been officially issued.`,
      certId: certIdOrRoll,
      student: null,
      studentRollNo: '',
      studentName: '',
      branch: 'CSE',
      issuedAt: '',
      issuedHash: '',
      computedHash: '',
      masterHash: '',
      recomputedHash: '',
      signStampsCount: 0,
      executiveSignatures: {
        hod: false,
        dsw: false,
        registrar: false,
      },
    };
  }

  // Verify cryptographic integrity
  const integrity = await verifyCertificateIntegrity(student);
  const signStampsCount = Object.values(student.dues).filter((d) => d.signStamp).length;

  return {
    isValid: integrity.isValid,
    authentic: integrity.isValid,
    tampered: !integrity.isValid,
    message: integrity.isValid
      ? 'Certificate signature chain is 100% authentic and unaltered. Recomputed Merkle hash matches the official university seal.'
      : `TAMPER DETECTED: ${integrity.tamperedItem || 'Cryptographic chain mismatch. Record data altered after official issuance.'}`,
    tamperedItem: integrity.tamperedItem,
    certId: student.certificateId,
    student: JSON.parse(JSON.stringify(student)),
    studentRollNo: student.rollNo,
    studentName: student.name,
    branch: student.branch,
    issuedAt: student.certificateIssuedAt || student.issuedAt || new Date().toISOString(),
    issuedHash: student.masterHash || student.masterCertificateHash || '',
    computedHash: integrity.recomputedHash,
    masterHash: student.masterHash || student.masterCertificateHash || '',
    recomputedHash: integrity.recomputedHash,
    signStampsCount,
    executiveSignatures: {
      hod: student.executiveApprovals.hod.signed,
      dsw: student.executiveApprovals.dsw.signed,
      registrar: student.executiveApprovals.registrar.signed,
    },
  };
}

/**
 * Mutates student record for presenter tamper demonstration
 */
export function tamperStudentDataForDemo(rollNo: string): StudentProfile {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  // Find a cleared item to mutate (e.g. Central Library)
  const libKey = Object.keys(student.dues).find((k) => k.includes('LIB')) || Object.keys(student.dues)[0];
  if (libKey && student.dues[libKey]) {
    student.dues[libKey].amount = 500;
    student.dues[libKey].remarks =
      '[DEMO TAMPER]: Injected ₹500 library overdue fee into ledger after certificate issuance!';
  }

  return JSON.parse(JSON.stringify(student));
}

/**
 * Restores student record to authentic cleared state
 */
export function restoreStudentDataForDemo(rollNo: string): StudentProfile {
  const student = studentStore[rollNo.toUpperCase()];
  if (!student) throw new Error(`Student ${rollNo} not found.`);

  const libKey = Object.keys(student.dues).find((k) => k.includes('LIB')) || Object.keys(student.dues)[0];
  if (libKey && student.dues[libKey]) {
    student.dues[libKey].amount = 0;
    student.dues[libKey].remarks = 'Reconciled: All books surrendered. ₹0 due.';
  }

  return JSON.parse(JSON.stringify(student));
}

