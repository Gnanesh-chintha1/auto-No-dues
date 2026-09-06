import { BranchCode, CurriculumLab, Tier1DomainId } from '../types';

export interface Tier1SectionDefinition {
  id: Tier1DomainId;
  code: string;
  name: string;
  category: string;
  defaultRemarks: string;
  responsibleOfficerRole: string;
}

export const TIER1_SECTIONS: Tier1SectionDefinition[] = [
  {
    id: 'LIBRARY',
    code: 'T1_LIBRARY',
    name: 'Central Library & Digital Resource Centre',
    category: 'Academic Resources',
    defaultRemarks: 'Books returned, RFID tags reconciled, no overdue catalog fines.',
    responsibleOfficerRole: 'Librarian / Library In-Charge',
  },
  {
    id: 'HOSTEL_BOYS',
    code: 'T1_HOSTEL_BOYS',
    name: "Boys' Hostel & Central Mess Committee",
    category: 'Student Welfare & Residence',
    defaultRemarks: 'Mess dues cleared, room furniture inventory inspected, keys handed over.',
    responsibleOfficerRole: 'Hostel Chief Warden (Boys)',
  },
  {
    id: 'HOSTEL_GIRLS',
    code: 'T1_HOSTEL_GIRLS',
    name: "Girls' Hostel & Central Mess Committee",
    category: 'Student Welfare & Residence',
    defaultRemarks: 'Mess bills verified, room furniture intact, electrical fittings cleared.',
    responsibleOfficerRole: 'Hostel Chief Warden (Girls)',
  },
  {
    id: 'SPORTS',
    code: 'T1_SPORTS',
    name: 'Sports & Physical Education Department',
    category: 'Campus Facilities',
    defaultRemarks: 'Gymnasium gear, sports kits, and inter-university equipment returned.',
    responsibleOfficerRole: 'Physical Director / Sports Officer',
  },
  {
    id: 'ACCOUNTS',
    code: 'T1_ACCOUNTS',
    name: 'University Accounts & Fee Settlement Section',
    category: 'Finance & Tuition',
    defaultRemarks: 'Tuition fees, RTF/MTF scholarship reconciliations, caution deposit clearance.',
    responsibleOfficerRole: 'Finance Officer / Accounts Superintendent',
  },
  {
    id: 'TPO',
    code: 'T1_TPO',
    name: 'Training & Placement Cell (Career Development)',
    category: 'Career & Placement',
    defaultRemarks: 'Company recruitment drives record reconciled, no pending placement bonds.',
    responsibleOfficerRole: 'Placement Officer (T&P)',
  },
  {
    id: 'EXAM_CELL',
    code: 'T1_EXAM_CELL',
    name: 'Examination Section & Controller of Examinations',
    category: 'Academic Examination',
    defaultRemarks: 'Semester exam fees cleared, grade card ledger verified, certificates audited.',
    responsibleOfficerRole: 'Controller of Examinations (CoE)',
  },
  {
    id: 'FACULTY_ADVISOR',
    code: 'T1_FACULTY_ADVISOR',
    name: 'Class Faculty Advisor / Academic Mentor',
    category: 'Mentorship',
    defaultRemarks: 'Attendance criteria met, student mentoring portfolio signed off.',
    responsibleOfficerRole: 'Designated Class Faculty Advisor',
  },
];

export const BRANCH_LABS: Record<BranchCode, CurriculumLab[]> = {
  CSE: [
    { labCode: 'CSE-101', labName: 'Engineering Workshop & IT Hardware Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'CSE-102', labName: 'Applied Physics & Computational Optics Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'CSE-201', labName: 'Data Structures & Algorithms Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'CSE-202', labName: 'Database Management Systems (DBMS) Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'CSE-203', labName: 'Computer Organization & Assembly Language Lab', yearLevel: 'E2', credits: 1.5 },
    { labCode: 'CSE-301', labName: 'Operating Systems & System Programming Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CSE-302', labName: 'Computer Networks & Packet Tracer Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CSE-303', labName: 'Web Technologies & Full-Stack Cloud Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CSE-401', labName: 'Compiler Design & Language Processor Lab', yearLevel: 'E4', credits: 1.5 },
    { labCode: 'CSE-402', labName: 'Major Project Phase-II Viva-Voce', yearLevel: 'Capstone', credits: 4.0 },
    { labCode: 'CSE-403', labName: 'Comprehensive Technical Viva', yearLevel: 'Capstone', credits: 2.0 },
  ],
  'CSE-AI&ML': [
    { labCode: 'AIML-101', labName: 'IT Hardware & Linux Workstation Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'AIML-102', labName: 'Mathematical Foundations & Statistics Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'AIML-201', labName: 'Data Structures & Python for ML Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'AIML-202', labName: 'Database Management & Big Data Storage Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'AIML-301', labName: 'Machine Learning & Predictive Modeling Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'AIML-302', labName: 'Deep Learning, Computer Vision & PyTorch Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'AIML-303', labName: 'Natural Language Processing & LLM Fine-tuning Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'AIML-401', labName: 'AI Capstone Project Viva-Voce', yearLevel: 'Capstone', credits: 4.0 },
    { labCode: 'AIML-402', labName: 'Comprehensive AI & Engineering Viva', yearLevel: 'Capstone', credits: 2.0 },
  ],
  ECE: [
    { labCode: 'ECE-101', labName: 'Basic Electrical Engineering Workshop', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'ECE-102', labName: 'Engineering Chemistry & Materials Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'ECE-201', labName: 'Electronic Devices & Circuits (EDC) Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'ECE-202', labName: 'Analog & Integrated Circuits (IC) Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'ECE-203', labName: 'Digital System Design & HDL Synthesis Lab', yearLevel: 'E2', credits: 1.5 },
    { labCode: 'ECE-301', labName: 'Microprocessors & Embedded Systems (ARM) Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'ECE-302', labName: 'Digital Signal Processing (DSP) Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'ECE-303', labName: 'Microwave & Optical Communications Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'ECE-401', labName: 'VLSI Design & Cadence Simulation Lab', yearLevel: 'E4', credits: 2.0 },
    { labCode: 'ECE-402', labName: 'Final Project Phase-II Defense & Viva', yearLevel: 'Capstone', credits: 4.0 },
    { labCode: 'ECE-403', labName: 'Comprehensive Technical Viva', yearLevel: 'Capstone', credits: 2.0 },
  ],
  EEE: [
    { labCode: 'EEE-101', labName: 'Electrical Engineering & Soldering Practice', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'EEE-102', labName: 'Engineering Physics Instrumentation Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'EEE-201', labName: 'Electrical Machines-I (DC Machines & Transformers) Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'EEE-202', labName: 'Network Analysis & Electric Circuits Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'EEE-301', labName: 'Electrical Machines-II (Synchronous & Induction) Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'EEE-302', labName: 'Power Electronics & Industrial Drives Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'EEE-303', labName: 'Control Systems & MATLAB Simulation Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'EEE-401', labName: 'Power Systems & High Voltage Engineering Lab', yearLevel: 'E4', credits: 2.0 },
    { labCode: 'EEE-402', labName: 'Major Power Project Viva-Voce', yearLevel: 'Capstone', credits: 4.0 },
    { labCode: 'EEE-403', labName: 'Comprehensive Viva-Voce', yearLevel: 'Capstone', credits: 2.0 },
  ],
  MECH: [
    { labCode: 'MEC-101', labName: 'Machine Shop & Fitting Workshop', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'MEC-102', labName: 'Welding, Foundry & Sheet Metal Practice Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'MEC-201', labName: 'Mechanics of Solids & Material Testing Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'MEC-202', labName: 'Fluid Mechanics & Hydraulic Machinery Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'MEC-301', labName: 'Thermal Engineering & Internal Combustion Engines Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'MEC-302', labName: 'Machine Tools & Metrology Precision Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'MEC-303', labName: 'CAD/CAM & CNC Manufacturing Automation Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'MEC-401', labName: 'Heat Transfer & Refrigeration Operations Lab', yearLevel: 'E4', credits: 2.0 },
    { labCode: 'MEC-402', labName: 'Mechanical Capstone Project Viva', yearLevel: 'Capstone', credits: 4.0 },
    { labCode: 'MEC-403', labName: 'Comprehensive Engineering Viva', yearLevel: 'Capstone', credits: 2.0 },
  ],
  CIVIL: [
    { labCode: 'CIV-101', labName: 'Surveying Field Practice - I (Plane Table & Theodolite)', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'CIV-102', labName: 'Engineering Geology & Mineralogy Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'CIV-201', labName: 'Strength of Materials Testing Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'CIV-202', labName: 'Fluid Mechanics & Open Channel Hydraulics Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'CIV-301', labName: 'Surveying - II (Total Station, GPS & Drone Mapping)', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CIV-302', labName: 'Concrete Technology & Structural Testing Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CIV-303', labName: 'Geotechnical Engineering & Soil Mechanics Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CIV-401', labName: 'Environmental Engineering & Water Quality Lab', yearLevel: 'E4', credits: 2.0 },
    { labCode: 'CIV-402', labName: 'Civil Engineering Design Project Viva', yearLevel: 'Capstone', credits: 4.0 },
    { labCode: 'CIV-403', labName: 'Comprehensive Viva-Voce', yearLevel: 'Capstone', credits: 2.0 },
  ],
  CHEM: [
    { labCode: 'CHE-101', labName: 'General & Analytical Chemistry Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'CHE-102', labName: 'Workshop Practice & Glassblowing Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'CHE-201', labName: 'Fluid Mechanics for Chemical Engineers Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'CHE-202', labName: 'Mechanical Unit Operations Lab', yearLevel: 'E2', credits: 2.0 },
    { labCode: 'CHE-301', labName: 'Heat Transfer Operations Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CHE-302', labName: 'Mass Transfer Operations & Distillation Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CHE-303', labName: 'Chemical Reaction Engineering (CRE) Lab', yearLevel: 'E3', credits: 2.0 },
    { labCode: 'CHE-401', labName: 'Process Dynamics & Instrumental Control Lab', yearLevel: 'E4', credits: 2.0 },
    { labCode: 'CHE-402', labName: 'Chemical Plant Design Project Viva', yearLevel: 'Capstone', credits: 4.0 },
    { labCode: 'CHE-403', labName: 'Comprehensive Viva-Voce', yearLevel: 'Capstone', credits: 2.0 },
  ],
  'PUC-WING': [
    { labCode: 'PUC-PHY-01', labName: 'PUC Physics Practicum - I (Mechanics & Heat)', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'PUC-PHY-02', labName: 'PUC Physics Practicum - II (Optics & Electromagnetics)', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'PUC-CHM-01', labName: 'PUC Chemistry Practicum - I (Inorganic Salt Analysis)', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'PUC-CHM-02', labName: 'PUC Chemistry Practicum - II (Volumetric & Organic)', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'PUC-ICT-01', labName: 'PUC Information & Computer Technology (ICT) Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'PUC-ENG-01', labName: 'PUC English Language Communication Skills (ELCS) Lab', yearLevel: 'Foundational', credits: 1.5 },
    { labCode: 'PUC-EVS-01', labName: 'PUC Environmental Sciences & Botanical Field Lab', yearLevel: 'Foundational', credits: 1.0 },
    { labCode: 'PUC-MTH-01', labName: 'PUC Mathematical Modeling & Computational Lab', yearLevel: 'Foundational', credits: 1.5 },
  ],
};

export function getCurriculumForStudent(branch: BranchCode): CurriculumLab[] {
  return BRANCH_LABS[branch] || [];
}

export function getTier1SectionForStudent(gender: 'M' | 'F'): Tier1SectionDefinition[] {
  // Omit the irrelevant hostel (Boys vs Girls)
  return TIER1_SECTIONS.filter((s) => {
    if (s.id === 'HOSTEL_BOYS' && gender === 'F') return false;
    if (s.id === 'HOSTEL_GIRLS' && gender === 'M') return false;
    return true;
  });
}
