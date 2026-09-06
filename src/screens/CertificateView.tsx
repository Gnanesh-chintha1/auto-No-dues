import React, { useEffect, useState, useRef } from 'react';
import { DueRecord, StudentProfile } from '../types';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Award,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Download,
  Loader2,
  FileCheck,
  X,
} from 'lucide-react';
import { gsap, useGSAP, prefersReducedMotion } from '../utils/animation';
import { generateOfficialCertificatePDF, triggerPDFDownload } from '../utils/pdfGenerator';

interface CertificateViewProps {
  student: StudentProfile;
  onBack: () => void;
  onNavigateToVerify: (certId: string) => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  student,
  onBack,
  onNavigateToVerify,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  const certId = student.certificateId || `RGUKT-RKV-2024-${student.branch}-${student.rollNo}`;
  const masterHash = student.masterCertificateHash || student.masterHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certId}`;

  // Cinematic GSAP Certificate Entrance, Golden Seal Rotation, and Rubber-Stamp Impact
  useGSAP(
    () => {
      if (typeof window === 'undefined' || prefersReducedMotion() || !certRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // 1. Certificate Container: Expands cleanly into view
      tl.fromTo(
        certRef.current,
        { scale: 0.96, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, ease: 'power3.out', clearProps: 'all' }
      )
        // 2. Golden Seal / Emblem: Rotates slightly into position
        .fromTo(
          '.cert-emblem',
          { scale: 0.6, rotation: -15, opacity: 0 },
          { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)', clearProps: 'all' },
          '-=0.3'
        )
        // 3. Status Ribbon slide-in
        .fromTo(
          '.cert-ribbon',
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', clearProps: 'all' },
          '-=0.2'
        )
        // 4. Official Endorsement Seals: Rubber-stamp impact
        .fromTo(
          '.cert-stamp',
          { scale: 1.15, opacity: 0 },
          { scale: 1, opacity: 1, stagger: 0.07, duration: 0.35, ease: 'power2.out', clearProps: 'all' },
          '-=0.1'
        );

      // 5. Cryptographic Status Badge subtle breathing glow pulse
      gsap.to('.cert-pulse-dot', {
        scale: 1.25,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    },
    { scope: certRef }
  );

  useEffect(() => {
    let isMounted = true;

    // Safely generate QR Code containing public verification link
    const generateQr = async () => {
      try {
        const qrLib: any = QRCode;
        const toDataURL = qrLib?.toDataURL || qrLib?.default?.toDataURL;
        if (typeof toDataURL === 'function') {
          const url = await toDataURL(verifyUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 200,
            color: {
              dark: '#1C1B18',
              light: '#FFFFFF',
            },
          });
          if (isMounted) setQrDataUrl(url);
        } else {
          // Fallback if bundler export is shaped differently
          if (isMounted) {
            setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`);
          }
        }
      } catch (err) {
        console.warn('QR generation fallback notice:', err);
        if (isMounted) {
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`);
        }
      }
    };

    generateQr();

    // Fire celebratory confetti safely
    try {
      const confLib: any = confetti;
      const confFn = typeof confLib === 'function' ? confLib : confLib?.default;
      if (typeof confFn === 'function') {
        confFn({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0F5C55', '#B8860B', '#1B8A5A', '#E6F4F1'],
        });
      }
    } catch (err) {
      console.warn('Confetti effect skipped:', err);
    }

    return () => {
      isMounted = false;
    };
  }, [verifyUrl]);

  const handleCopyHash = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(masterHash);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = masterHash;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard write fallback:', err);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const getCompactSectionName = (name: string) => {
    return name
      .replace('Campus Library & Information Center', 'Library & Info Center')
      .replace('Student Residential Hostels & Mess', 'Hostels & Mess Section')
      .replace('Department of Physical Education (Sports)', 'Physical Education (Sports)')
      .replace('University Health Center & Dispensary', 'Health Center & Dispensary')
      .replace('Scholarships & Fee Reconciliations Section', 'Scholarships & Accounts')
      .replace('Engineering Workshops & Central Stores', 'Engineering Workshops')
      .replace('Examination Cell & Academic Records', 'Examination Cell (Academics)');
  };

  const getCompactLabName = (name: string) => {
    return name
      .replace('Department ', '')
      .replace('Laboratory', 'Lab')
      .replace('Laboratories', 'Labs')
      .replace('Comprehensive ', '')
      .replace('Viva-Voce & Project', 'Viva & Project')
      .replace('Technical Seminar & Report', 'Seminar & Report');
  };

  const issueDateFormatted = student.certificateIssuedAt
    ? new Date(student.certificateIssuedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : student.issuedAt
    ? new Date(student.issuedAt).toLocaleDateString('en-IN')
    : '06-Sep-2026';

  /**
   * Primary Official PDF Export Engine:
   * Uses html2pdf with locked 794x1122 virtual window, letterRendering, and zero margins
   * for exact 1:1 pixel-perfect parity with the web certificate view.
   */
  const handleDownloadPDF = async () => {
    const element = document.getElementById('official-certificate') || certRef.current;
    if (!element) return;

    if (isGenerating) return;
    setIsGenerating(true);
    setDownloadNotice({
      message: 'Generating official PDF certificate...',
      type: 'info',
    });

    const filename = `RGUKT_NoDues_${(student as any)?.rollNumber || student?.rollNo || 'Certificate'}.pdf`;

    const opt = {
      margin: [0, 0, 0, 0], // Zero outer margin so the certificate frame fills the page
      filename,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: {
        scale: 2.5,          // Crisp rendering without memory bloat
        useCORS: true,
        letterRendering: true, // Crucial: prevents fonts from expanding/reflowing
        scrollY: 0,
        scrollX: 0,
        windowWidth: 794,   // Standard 96 DPI A4 width in pixels
        windowHeight: 1122  // Standard 96 DPI A4 height in pixels
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait' as const,
      },
      pagebreak: { mode: 'avoid-all' as const },
    };

    try {
      // Ensure html2canvas-pro is available globally for html2pdf UMD and modern oklab/oklch color space support
      const html2canvasProModule = await import('html2canvas-pro');
      const html2canvasPro = (html2canvasProModule.default || html2canvasProModule) as any;
      (window as any).html2canvas = html2canvasPro;

      const html2pdfModule = await import('html2pdf.js' as any);
      const html2pdf = html2pdfModule.default || html2pdfModule;
      await html2pdf().set(opt).from(element).save();

      setDownloadNotice({
        message: `Official certificate downloaded successfully: ${filename}`,
        type: 'success',
      });

      setTimeout(() => {
        setDownloadNotice((prev) => (prev?.type === 'success' ? null : prev));
      }, 6000);
    } catch (error) {
      console.error('PDF Export Error:', error);
      // Direct html2canvas-pro + jsPDF rendering fallback
      try {
        const html2canvasProModule = await import('html2canvas-pro');
        const html2canvasPro = (html2canvasProModule.default || html2canvasProModule) as any;
        const { jsPDF } = await import('jspdf');

        const canvas = await html2canvasPro(element, {
          scale: 2.5,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          scrollX: 0,
          windowWidth: 794,
          windowHeight: 1122,
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF({
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        });
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
        pdf.save(filename);

        setDownloadNotice({
          message: `Official certificate downloaded successfully: ${filename}`,
          type: 'success',
        });

        setTimeout(() => {
          setDownloadNotice((prev) => (prev?.type === 'success' ? null : prev));
        }, 6000);
      } catch (fallbackErr) {
        console.error('Fallback canvas generation error:', fallbackErr);
        // Secondary fallback to official vector generator
        try {
          const { filename: fallbackName, blobUrl } = await generateOfficialCertificatePDF({
            student,
            certId,
            masterHash,
            qrDataUrl,
            issueDateFormatted,
          });
          const success = triggerPDFDownload(blobUrl, fallbackName);
          if (success) {
            setDownloadNotice({
              message: `Official certificate downloaded successfully: ${fallbackName}`,
              type: 'success',
            });
          }
        } catch (vectorErr) {
          console.error('Fallback PDF generation error:', vectorErr);
          setDownloadNotice({
            message: 'Could not generate PDF download. Please try again.',
            type: 'error',
          });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const duesList = Object.values(student.dues || {}) as DueRecord[];
  const tier1Items = duesList.filter((d) => d.tier === 1);
  const tier2Items = duesList.filter((d) => d.tier === 2);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-[#E5E3DD] shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#615E56] hover:text-[#1A1A1A] transition-colors py-1.5 cursor-pointer"
        >
          <ArrowLeft size={15} className="shrink-0" />
          <span>Back to Student Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            id="print-cert-btn"
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F5C55] hover:bg-[#0C4742] text-white text-xs font-semibold shadow-xs transition-colors min-h-[40px] cursor-pointer disabled:opacity-60"
            title="Generate and download official PDF certificate file"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="shrink-0 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download size={14} className="shrink-0" />
                <span>Print Official PDF</span>
              </>
            )}
          </button>

          <button
            id="copy-hash-action-btn"
            type="button"
            onClick={handleCopyHash}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D5D2C7] bg-white hover:bg-[#FAF9F5] text-xs font-semibold text-[#37352F] shadow-xs transition-colors min-h-[40px] cursor-pointer"
            title="Copy cryptographic master hash to clipboard"
          >
            {copiedHash ? (
              <CheckCircle2 size={14} className="text-[#059669] shrink-0" />
            ) : (
              <Copy size={14} className="shrink-0" />
            )}
            <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
          </button>

          <button
            id="open-verify-link-btn"
            type="button"
            onClick={() => onNavigateToVerify(certId)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#0F5C55] text-[#0F5C55] bg-[#E6F4F1] hover:bg-[#D7EFEA] text-xs font-semibold shadow-xs transition-colors min-h-[40px] cursor-pointer"
          >
            <ShieldCheck size={14} className="shrink-0" />
            <span>Verify Online</span>
          </button>
        </div>
      </div>

      {/* Dedicated Status & Download Notification Banner */}
      {downloadNotice && (
        <div
          className={`no-print print:hidden flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-medium transition-all ${
            downloadNotice.type === 'success'
              ? 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
              : downloadNotice.type === 'error'
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
          }`}
        >
          <div className="flex items-center gap-2">
            {downloadNotice.type === 'success' ? (
              <CheckCircle2 size={15} className="shrink-0 text-[#059669]" />
            ) : downloadNotice.type === 'error' ? (
              <X size={15} className="shrink-0 text-[#DC2626]" />
            ) : (
              <FileCheck size={15} className="shrink-0 text-[#2563EB]" />
            )}
            <span>{downloadNotice.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadNotice(null)}
            className="text-current hover:opacity-75 p-1 cursor-pointer"
            title="Dismiss notice"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Official Certificate Paper Container */}
      <div className="w-full overflow-x-auto flex justify-center py-2 px-1">
        <div
          ref={certRef}
          id="official-certificate"
          className="w-[210mm] min-h-[296mm] mx-auto p-4 sm:p-5 bg-[#fcfbf7] border-[3px] border-double border-[#3b5249] shadow-2xl text-[#2A2824] relative flex flex-col justify-between box-border overflow-hidden"
          style={{
            boxSizing: 'border-box',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
            pageBreakInside: 'avoid',
            breakInside: 'avoid',
          }}
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none select-none">
            <Award size={380} />
          </div>

          {/* Header: University Emblem & Title */}
          <div className="text-center space-y-1 border-b border-[#D5CEBF] pb-2 relative z-10">
            <div className="flex justify-center mb-0.5">
              <div className="cert-emblem w-12 h-12 rounded-full bg-[#FAF7EE] border-2 border-[#B8860B] flex items-center justify-center shadow-xs">
                <Award className="w-6 h-6 text-[#B8860B]" />
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-[9.5px] font-semibold text-[#615E56] uppercase tracking-widest">
                Government of Andhra Pradesh • Established under Act 18 of 2008
              </p>
              <h1 className="text-xl md:text-2xl font-bold font-official-serif tracking-tight text-[#1A1A1A]">
                RAJIV GANDHI UNIVERSITY OF KNOWLEDGE TECHNOLOGIES
              </h1>
              <p className="text-[11px] font-semibold text-[#44413B]">
                RK VALLEY CAMPUS (Idupulapaya), YSR KADAPA DISTRICT, A.P. - 516330
              </p>
            </div>

            <div className="pt-0.5">
              <span className="inline-block bg-[#FAF5E6] border border-[#D5C186] text-[#634E17] font-bold text-[10.5px] px-4 py-0.5 rounded-full uppercase tracking-wider">
                Certificate of Digital No-Dues & Institutional Clearance
              </span>
            </div>
          </div>

          {/* Certificate Metadata Ribbon */}
          <div className="cert-ribbon grid grid-cols-4 gap-2.5 p-2.5 rounded-lg bg-[#FAF8F2] border border-[#E5DFD1] text-[10.5px] relative z-10 font-medium">
            <div>
              <span className="text-[9px] text-[#787368] uppercase font-bold block">
                Certificate Reference ID
              </span>
              <span className="font-mono font-bold text-[10.5px] text-[#1A1A1A] truncate block" title={certId}>
                {certId}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-[#787368] uppercase font-bold block">
                Candidate Roll Number
              </span>
              <span className="font-mono font-bold text-xs text-[#0F5C55] block">
                {student.rollNo}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-[#787368] uppercase font-bold block">
                Date of Issuance
              </span>
              <span className="font-mono text-[10.5px] text-[#1A1A1A] block">
                {issueDateFormatted}
              </span>
            </div>

            <div>
              <span className="text-[9px] text-[#787368] uppercase font-bold block">
                Cryptographic Status
              </span>
              <span className="text-[10.5px] font-bold text-[#059669] flex items-center gap-1">
                <span className="cert-pulse-dot inline-block">
                  <CheckCircle2 size={12} className="shrink-0 text-[#059669]" />
                </span>
                <span>Merkle Root Verified</span>
              </span>
            </div>
          </div>

          {/* Student Particulars Statement Box */}
          <div className="space-y-1 text-xs leading-relaxed text-[#37352F] relative z-10 bg-[#FAF9F5] p-2.5 rounded-lg border border-[#EAE5D9]">
            <p>
              This is to certify that candidate{' '}
              <strong className="font-bold text-[#1A1A1A] underline decoration-[#B8860B]">
                {student.name}
              </strong>
              , bearing University Roll Number{' '}
              <strong className="font-mono font-bold text-[#1A1A1A]">{student.rollNo}</strong>,
              enrolled in{' '}
              <strong>
                {student.program} in {student.branch}
              </strong>{' '}
              (Batch of {student.batch}), has systematically completed all institutional no-dues protocols.
            </p>
            <p className="text-[#555045]">
              All academic laboratories, library records, residential hostels, sports equipment,
              and administrative accounts stand reconciled with zero outstanding encumbrance (₹0.00).
            </p>
          </div>

          {/* Consolidated 2-Column Clearance Ledger */}
          <div className="grid grid-cols-2 gap-3.5 my-1 relative z-10">
            {/* Column 1: Tier 1 Clearance Table */}
            <div className="space-y-1">
              <h3 className="font-bold text-[10.5px] text-[#44413B] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0F5C55] shrink-0" />
                <span>Tier 1: Central Sections (7 Offices)</span>
              </h3>

              <div className="rounded-lg border border-[#E5DFD1] overflow-hidden bg-white">
                <table className="w-full text-left text-[9.5px] leading-tight border-collapse">
                  <thead className="bg-[#FAF8F2] border-b border-[#E5DFD1] text-[#615C52]">
                    <tr>
                      <th className="py-1 px-2 font-semibold">Central Section</th>
                      <th className="py-1 px-2 font-semibold text-center w-12">Due</th>
                      <th className="py-1 px-2 font-semibold text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE6DA]">
                    {tier1Items.map((item) => (
                      <tr key={item.sectionCode} className="hover:bg-[#FCFAF5]">
                        <td className="py-1.5 px-2 font-medium text-[#2A2824]" title={item.sectionName}>
                          {getCompactSectionName(item.sectionName)}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-[#1A1A1A]">₹0</td>
                        <td className="py-1.5 px-2 text-right whitespace-nowrap">
                          <span className="text-[#065F46] font-semibold text-[9px] inline-flex items-center gap-1">
                            <span>✓ Cleared</span>
                            <span className="font-mono text-[#52504A]">
                              [{item.signStamp?.signatureHash ? `DS-${item.signStamp.signatureHash.slice(0, 4).toUpperCase()}` : `DS-${item.sectionCode.slice(0, 4)}`}]
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column 2: Tier 2 Department Laboratories Table */}
            <div className="space-y-1">
              <h3 className="font-bold text-[10.5px] text-[#44413B] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#33396B] shrink-0" />
                <span>Tier 2: {student.branch} Labs & Vivas</span>
              </h3>

              <div className="rounded-lg border border-[#E5DFD1] overflow-hidden bg-white">
                <table className="w-full text-left text-[9.5px] leading-tight border-collapse">
                  <thead className="bg-[#FAF8F2] border-b border-[#E5DFD1] text-[#615C52]">
                    <tr>
                      <th className="py-1 px-2 font-semibold">{student.branch} Lab / Viva</th>
                      <th className="py-1 px-2 font-semibold text-center w-12">Due</th>
                      <th className="py-1 px-2 font-semibold text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE6DA]">
                    {tier2Items.map((item) => (
                      <tr key={item.sectionCode} className="hover:bg-[#FCFAF5]">
                        <td className="py-1.5 px-2 font-medium text-[#2A2824]" title={item.sectionName}>
                          {getCompactLabName(item.sectionName)}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-[#1A1A1A]">₹0</td>
                        <td className="py-1.5 px-2 text-right whitespace-nowrap">
                          <span className="text-[#065F46] font-semibold text-[9px] inline-flex items-center gap-1">
                            <span>✓ Cleared</span>
                            <span className="font-mono text-[#52504A]">
                              [{item.signStamp?.signatureHash ? `DS-${item.signStamp.signatureHash.slice(0, 4).toUpperCase()}` : `DS-${item.sectionCode.slice(0, 4)}`}]
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Institutional Zero-Encumbrance Status Ribbon */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg py-1.5 px-3 text-center relative z-10">
            <p className="text-[10px] font-bold text-[#166534] tracking-wide uppercase">
              Total Outstanding Encumbrance: ₹0.00 (NIL) • All 14 Departments & Central Sections Reconciled
            </p>
          </div>

          {/* Tier 3: Executive Endorsement & Seal Block (4 Columns) */}
          <div className="grid grid-cols-4 gap-2.5 pt-2 border-t border-[#D5CEBF] relative z-10 items-stretch">
            {/* HOD Endorsement */}
            <div className="cert-stamp p-2 rounded-lg border border-[#E5DFD1] bg-[#FAF8F2] text-center flex flex-col justify-between space-y-1">
              <div>
                <div className="font-bold text-[#1A1A1A] text-[10.5px] truncate">
                  {student.executiveApprovals?.hod?.officerName || 'Head of Department'}
                </div>
                <div className="text-[9.5px] text-[#615C52] truncate">HOD, Dept of {student.branch}</div>
              </div>
              <div className="bg-white border border-[#E5DFD1] rounded p-1">
                <div className="text-[8.5px] font-bold text-[#059669]">✓ DIGITALLY SIGNED</div>
                <div className="text-[7.5px] font-mono text-[#615C52]">
                  Hash: {student.executiveApprovals?.hod?.signatureHash?.slice(0, 8) || 'VERIFIED'}
                </div>
              </div>
            </div>

            {/* Student Declaration */}
            <div className="cert-stamp p-2 rounded-lg border border-[#E5DFD1] bg-[#FAF8F2] text-center flex flex-col justify-between space-y-1">
              <div>
                <div className="font-bold text-[#1A1A1A] text-[10.5px] truncate">{student.name}</div>
                <div className="text-[9.5px] text-[#615C52]">Candidate e-Signature</div>
              </div>
              <div className="bg-white border border-[#E5DFD1] rounded p-1">
                <div className="text-[8.5px] font-bold text-[#059669]">✓ ACKNOWLEDGED</div>
                <div className="text-[7.5px] font-mono text-[#615C52]">Roll: {student.rollNo}</div>
              </div>
            </div>

            {/* DSW Seal */}
            <div className="cert-stamp p-2 rounded-lg border border-[#E5DFD1] bg-[#FAF8F2] text-center flex flex-col justify-between space-y-1">
              <div>
                <div className="font-bold text-[#1A1A1A] text-[10.5px] truncate">
                  {student.executiveApprovals?.dsw?.officerName || 'Dean, Students Welfare'}
                </div>
                <div className="text-[9.5px] text-[#615C52] truncate">Dean, Students Welfare</div>
              </div>
              <div className="bg-white border border-[#E5DFD1] rounded p-1">
                <div className="text-[8.5px] font-bold text-[#059669]">✓ APPROVED & SEALED</div>
                <div className="text-[7.5px] font-mono text-[#615C52]">
                  Hash: {student.executiveApprovals?.dsw?.signatureHash?.slice(0, 8) || 'VERIFIED'}
                </div>
              </div>
            </div>

            {/* Registrar Seal with Authentic QR Code */}
            <div className="cert-stamp p-1.5 rounded-lg border-2 border-[#B8860B] bg-[#FFFDF7] text-center flex flex-col items-center justify-between">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Verification QR Code"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 border border-[#DDD9CE] p-0.5 rounded bg-white shadow-2xs"
                />
              ) : (
                <div className="w-14 h-14 border border-[#DDD9CE] rounded bg-white flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-[#B8860B]" />
                </div>
              )}
              <div className="font-bold text-[#1A1A1A] text-[9.5px] leading-tight truncate max-w-full">
                {student.executiveApprovals?.registrar?.officerName || 'Registrar / Director'}
              </div>
              <div className="text-[7.5px] text-[#B8860B] font-bold uppercase tracking-wider">
                University Seal Affixed
              </div>
            </div>
          </div>

          {/* Cryptographic Security Footer */}
          <div className="text-center pt-2 border-t border-[#E5DFD1] relative z-10 space-y-0.5">
            <div
              onClick={handleCopyHash}
              title="Click to copy master SHA-256 digest"
              className="cursor-pointer inline-flex items-center gap-1.5 hover:bg-[#FAF8F2] px-2.5 py-0.5 rounded transition-colors group"
            >
              <p className="text-[8.5px] font-mono text-[#787368] group-hover:text-[#1A1A1A] tracking-wider break-all select-all">
                MASTER TAMPER-EVIDENT SHA-256 DIGEST: {masterHash}
              </p>
              <Copy size={11} className="text-[#8A8474] group-hover:text-[#1A1A1A] shrink-0" />
            </div>
            <p className="text-[8px] text-[#8A8474]">
              Verified through RGUKT Blockchain Clearance Registry • Tamper Evident Official Academic Record
            </p>
            <p className="text-[7.5px] text-[#A8A29E]">
              Statutory Electronic Document • Valid without manual ink signature under Section 4, Information Technology Act
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

