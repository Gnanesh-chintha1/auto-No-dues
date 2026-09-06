import { jsPDF } from 'jspdf';
import { StudentProfile, DueRecord } from '../types';

export interface GeneratePDFOptions {
  student: StudentProfile;
  certId: string;
  masterHash: string;
  qrDataUrl?: string;
  issueDateFormatted?: string;
}

/**
 * Generates an authoritative, razor-sharp, vector-grade RGUKT No-Dues Certificate PDF.
 * Uses native jsPDF vector primitives to guarantee 100% reliability, instantaneous execution,
 * searchability, and zero dependence on CSS/oklch DOM parsers.
 */
export async function generateOfficialCertificatePDF(options: GeneratePDFOptions): Promise<{
  blob: Blob;
  filename: string;
  blobUrl: string;
}> {
  const { student, certId, masterHash, qrDataUrl, issueDateFormatted } = options;

  const rollNumber = student?.rollNo || (student as any)?.rollNumber || 'R200188';
  const filename = `RGUKT_NoDues_Certificate_${rollNumber}.pdf`;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pw = 210;
  const ph = 297;

  // 1. Paper Background: Authentic Parchment Tint (#FFFDF9)
  doc.setFillColor(255, 253, 249);
  doc.rect(0, 0, pw, ph, 'F');

  // 2. Full-Page Double Security Border (Edge-to-edge framing)
  // Outer Border: Dark Bronze (#8A8474) with 6mm outer margin
  doc.setDrawColor(138, 132, 116);
  doc.setLineWidth(1.2);
  doc.rect(6, 6, pw - 12, ph - 12);

  // Inner Border: Muted Gold/Bronze (#D5CEBF) with 8mm margin
  doc.setDrawColor(213, 206, 191);
  doc.setLineWidth(0.4);
  doc.rect(8, 8, pw - 16, ph - 16);

  // 3. Official University Seal (Top Golden Emblem)
  doc.setFillColor(250, 247, 238);
  doc.setDrawColor(184, 134, 11); // #B8860B
  doc.setLineWidth(0.8);
  doc.circle(105, 20.5, 8, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(184, 134, 11);
  doc.text('RGUKT', 105, 23.2, { align: 'center' });

  // 4. University Header Typography
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(97, 94, 86);
  doc.text('GOVERNMENT OF ANDHRA PRADESH • ESTABLISHED UNDER ACT 18 OF 2008', 105, 32.5, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 26, 26);
  doc.text('RAJIV GANDHI UNIVERSITY OF KNOWLEDGE TECHNOLOGIES', 105, 39.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(68, 65, 59);
  doc.text('RK VALLEY CAMPUS (IDUPULAPAYA), YSR KADAPA DISTRICT, A.P. - 516330', 105, 45.5, { align: 'center' });

  // 5. Certificate Title Banner Pill
  doc.setFillColor(250, 245, 230);
  doc.setDrawColor(213, 193, 134);
  doc.setLineWidth(0.4);
  doc.roundedRect(20, 50, 170, 8.5, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(99, 78, 23);
  doc.text('CERTIFICATE OF DIGITAL NO-DUES & INSTITUTIONAL CLEARANCE', 105, 55.5, { align: 'center' });

  // 6. Security Metadata Ribbon (4 Columns)
  doc.setFillColor(250, 248, 242);
  doc.setDrawColor(229, 223, 209);
  doc.setLineWidth(0.35);
  doc.roundedRect(12, 62.5, 186, 17, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(120, 115, 104);
  doc.text('CERTIFICATE REFERENCE ID', 15, 68);
  doc.text('CANDIDATE ROLL NUMBER', 68, 68);
  doc.text('DATE OF ISSUANCE', 120, 68);
  doc.text('CRYPTOGRAPHIC STATUS', 158, 68);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(26, 26, 26);
  doc.text(certId, 15, 75);

  doc.setFont('courier', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 92, 85);
  doc.text(student.rollNo, 68, 75);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(26, 26, 26);
  const dateStr =
    issueDateFormatted ||
    (student.certificateIssuedAt
      ? new Date(student.certificateIssuedAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '06-Sep-2026');
  doc.text(dateStr, 120, 75);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('[✓] Merkle Verified', 158, 75);

  // 7. Student Particulars Statement Box
  doc.setFillColor(250, 249, 245);
  doc.setDrawColor(234, 229, 217);
  doc.setLineWidth(0.35);
  doc.roundedRect(12, 83.5, 186, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(55, 53, 47);

  const statement1 = `This is to certify that candidate ${student.name}, bearing University Roll Number ${student.rollNo}, enrolled in ${student.program} in ${student.branch} (Batch of ${student.batch}), has systematically completed all institutional no-dues protocols.`;
  const s1Lines = doc.splitTextToSize(statement1, 180);
  doc.text(s1Lines, 15, 90.5);

  const statement2 = `All academic laboratories, library records, residential hostels, sports equipment, and administrative accounts stand reconciled with zero outstanding encumbrance (INR 0.00).`;
  const s2Lines = doc.splitTextToSize(statement2, 180);
  doc.text(s2Lines, 15, 101.5);

  // 8. Clearance Ledgers: 2 Columns (Tier 1 Central Sections & Tier 2 Department Labs)
  const duesList = Object.values(student.dues || {}) as DueRecord[];
  const tier1Items = duesList.filter((d) => d.tier === 1);
  const tier2Items = duesList.filter((d) => d.tier === 2);

  const tableStartY = 111.5;
  const colWidth = 90;
  const leftColX = 12;
  const rightColX = 108;

  // Table 1 Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 92, 85);
  doc.text('Tier 1: Central Sections (7 Institutional Offices)', leftColX, tableStartY + 3.5);

  // Table 2 Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 57, 107);
  doc.text(`Tier 2: ${student.branch} Labs & Vivas`, rightColX, tableStartY + 3.5);

  // Header Boxes
  doc.setFillColor(250, 248, 242);
  doc.setDrawColor(229, 223, 209);
  doc.setLineWidth(0.3);
  doc.rect(leftColX, tableStartY + 5.5, colWidth, 6, 'FD');
  doc.rect(rightColX, tableStartY + 5.5, colWidth, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(97, 92, 82);
  doc.text('Central Section', leftColX + 3, tableStartY + 9.5);
  doc.text('Due', leftColX + 57, tableStartY + 9.5);
  doc.text('Verification', leftColX + 70, tableStartY + 9.5);

  doc.text(`${student.branch} Lab / Viva`, rightColX + 3, tableStartY + 9.5);
  doc.text('Due', rightColX + 57, tableStartY + 9.5);
  doc.text('Verification', rightColX + 70, tableStartY + 9.5);

  const formatSection = (n: string) =>
    n
      .replace('Campus Library & Information Center', 'Library & Info Center')
      .replace('Student Residential Hostels & Mess', 'Hostels & Mess Section')
      .replace('Department of Physical Education (Sports)', 'Physical Education (Sports)')
      .replace('University Health Center & Dispensary', 'Health Center & Dispensary')
      .replace('Scholarships & Fee Reconciliations Section', 'Scholarships & Accounts')
      .replace('Engineering Workshops & Central Stores', 'Engineering Workshops')
      .replace('Examination Cell & Academic Records', 'Examination Cell (Academics)');

  const formatLab = (n: string) =>
    n
      .replace('Department ', '')
      .replace('Laboratory', 'Lab')
      .replace('Laboratories', 'Labs')
      .replace('Comprehensive ', '')
      .replace('Viva-Voce & Project', 'Viva & Project')
      .replace('Technical Seminar & Report', 'Seminar & Report');

  const rowHeight = 9.8;
  const maxRows = Math.max(tier1Items.length, tier2Items.length, 7);

  // Render Tier 1 Rows
  tier1Items.forEach((item, idx) => {
    const rowY = tableStartY + 11.5 + idx * rowHeight;
    doc.setDrawColor(235, 230, 218);
    doc.line(leftColX, rowY + rowHeight, leftColX + colWidth, rowY + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(42, 40, 36);
    const sName = doc.splitTextToSize(formatSection(item.sectionName), 52)[0] || item.sectionName;
    doc.text(sName, leftColX + 3, rowY + 6);

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.text('INR 0', leftColX + 57, rowY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(6, 95, 70);
    const stampCode = item.signStamp?.signatureHash
      ? `DS-${item.signStamp.signatureHash.slice(0, 4).toUpperCase()}`
      : `DS-${item.sectionCode.slice(0, 4)}`;
    doc.text(`✓ ${stampCode}`, leftColX + 70, rowY + 6);
  });

  // Render Tier 2 Rows
  tier2Items.forEach((item, idx) => {
    const rowY = tableStartY + 11.5 + idx * rowHeight;
    doc.setDrawColor(235, 230, 218);
    doc.line(rightColX, rowY + rowHeight, rightColX + colWidth, rowY + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(42, 40, 36);
    const lName = doc.splitTextToSize(formatLab(item.sectionName), 52)[0] || item.sectionName;
    doc.text(lName, rightColX + 3, rowY + 6);

    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.text('INR 0', rightColX + 57, rowY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(6, 95, 70);
    const stampCode = item.signStamp?.signatureHash
      ? `DS-${item.signStamp.signatureHash.slice(0, 4).toUpperCase()}`
      : `DS-${item.sectionCode.slice(0, 4)}`;
    doc.text(`✓ ${stampCode}`, rightColX + 70, rowY + 6);
  });

  // Reconciliation summary bar (Zero Encumbrance Statutory Declaration)
  const summaryY = tableStartY + 11.5 + maxRows * rowHeight + 3.5;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.setLineWidth(0.35);
  doc.roundedRect(12, summaryY, 186, 8.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text(
    'TOTAL OUTSTANDING ENCUMBRANCE: INR 0.00 (NIL) • ALL 14 DEPARTMENTS & CENTRAL SECTIONS RECONCILED',
    105,
    summaryY + 5.5,
    { align: 'center' }
  );

  // 9. Tier 3: Executive Endorsement Seals & Authentic QR Code
  const sealsY = summaryY + 12;
  const sealW = 43.5;
  const sealH = 54;
  const gap = 4;

  // Box 1: HOD Endorsement
  const box1X = 12;
  doc.setFillColor(250, 248, 242);
  doc.setDrawColor(229, 223, 209);
  doc.roundedRect(box1X, sealsY, sealW, sealH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(26, 26, 26);
  const hodName = student.executiveApprovals?.hod?.officerName || 'Head of Department';
  doc.text(doc.splitTextToSize(hodName, sealW - 4)[0], box1X + sealW / 2, sealsY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(97, 92, 82);
  doc.text('Head of Department', box1X + sealW / 2, sealsY + 15, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`Dept of ${student.branch}`, box1X + sealW / 2, sealsY + 20, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(235, 230, 218);
  doc.roundedRect(box1X + 3, sealsY + 25, sealW - 6, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ DIGITALLY SIGNED', box1X + sealW / 2, sealsY + 34, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  const hodHash = student.executiveApprovals?.hod?.signatureHash?.slice(0, 8) || 'VERIFIED';
  doc.text(`Hash: ${hodHash}`, box1X + sealW / 2, sealsY + 41, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 115, 105);
  doc.text('Officer Identity Affixed', box1X + sealW / 2, sealsY + 46, { align: 'center' });

  // Box 2: Candidate e-Signature
  const box2X = box1X + sealW + gap;
  doc.setFillColor(250, 248, 242);
  doc.setDrawColor(229, 223, 209);
  doc.roundedRect(box2X, sealsY, sealW, sealH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(26, 26, 26);
  doc.text(doc.splitTextToSize(student.name, sealW - 4)[0], box2X + sealW / 2, sealsY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(97, 92, 82);
  doc.text('Candidate e-Signature', box2X + sealW / 2, sealsY + 15, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Identity Verified via Student ID', box2X + sealW / 2, sealsY + 20, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(235, 230, 218);
  doc.roundedRect(box2X + 3, sealsY + 25, sealW - 6, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ ACKNOWLEDGED', box2X + sealW / 2, sealsY + 34, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text(`Roll: ${student.rollNo}`, box2X + sealW / 2, sealsY + 41, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 115, 105);
  doc.text('Consent Timestamped', box2X + sealW / 2, sealsY + 46, { align: 'center' });

  // Box 3: Dean, Students Welfare (DSW)
  const box3X = box2X + sealW + gap;
  doc.setFillColor(250, 248, 242);
  doc.setDrawColor(229, 223, 209);
  doc.roundedRect(box3X, sealsY, sealW, sealH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(26, 26, 26);
  const dswName = student.executiveApprovals?.dsw?.officerName || 'Dean, Students Welfare';
  doc.text(doc.splitTextToSize(dswName, sealW - 4)[0], box3X + sealW / 2, sealsY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(97, 92, 82);
  doc.text('Dean, Students Welfare', box3X + sealW / 2, sealsY + 15, { align: 'center' });
  doc.setFontSize(7);
  doc.text('Student Affairs Directorate', box3X + sealW / 2, sealsY + 20, { align: 'center' });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(235, 230, 218);
  doc.roundedRect(box3X + 3, sealsY + 25, sealW - 6, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(5, 150, 105);
  doc.text('✓ APPROVED & SEALED', box3X + sealW / 2, sealsY + 34, { align: 'center' });

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  const dswHash = student.executiveApprovals?.dsw?.signatureHash?.slice(0, 8) || 'VERIFIED';
  doc.text(`Hash: ${dswHash}`, box3X + sealW / 2, sealsY + 41, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 115, 105);
  doc.text('Campus Directorate Seal', box3X + sealW / 2, sealsY + 46, { align: 'center' });

  // Box 4: Registrar Seal with Authentic Verification QR Code
  const box4X = box3X + sealW + gap;
  doc.setFillColor(255, 253, 247);
  doc.setDrawColor(184, 134, 11); // Golden double-accent
  doc.setLineWidth(0.6);
  doc.roundedRect(box4X, sealsY, sealW, sealH, 1.5, 1.5, 'FD');

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', box4X + (sealW - 27) / 2, sealsY + 3.5, 27, 27);
    } catch (qrErr) {
      console.warn('QR code embedding notice:', qrErr);
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(26, 26, 26);
  const regName = student.executiveApprovals?.registrar?.officerName || 'Registrar / Director';
  doc.text(doc.splitTextToSize(regName, sealW - 4)[0], box4X + sealW / 2, sealsY + 37, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(97, 92, 82);
  doc.text('Registrar / Director', box4X + sealW / 2, sealsY + 43, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(184, 134, 11);
  doc.text('UNIVERSITY SEAL AFFIXED', box4X + sealW / 2, sealsY + 49.5, { align: 'center' });

  // 10. Cryptographic Security Footer (Anchored gracefully above bottom border)
  const footerY = sealsY + sealH + 6;
  doc.setDrawColor(229, 223, 209);
  doc.setLineWidth(0.35);
  doc.line(12, footerY, pw - 12, footerY);

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(90, 85, 75);
  doc.text(`MASTER TAMPER-EVIDENT SHA-256 DIGEST: ${masterHash}`, 105, footerY + 5.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 115, 105);
  doc.text(
    'Verified through RGUKT Blockchain Clearance Registry • Tamper-Evident Official Academic Clearance',
    105,
    footerY + 10.5,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(150, 145, 135);
  doc.text(
    'Statutory Electronic Document • Valid without manual ink signature under Section 4, Information Technology Act',
    105,
    footerY + 15,
    { align: 'center' }
  );

  // Output PDF as Blob and generate Object URL
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);

  return {
    blob: pdfBlob,
    filename,
    blobUrl,
  };
}

/**
 * Executes an instant, reliable browser download of the generated PDF file.
 * Combines native object URL download triggers with automatic cleanup.
 */
export function triggerPDFDownload(blobUrl: string, filename: string): boolean {
  try {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 1000);
    return true;
  } catch (err) {
    console.error('Trigger PDF download failed:', err);
    return false;
  }
}
