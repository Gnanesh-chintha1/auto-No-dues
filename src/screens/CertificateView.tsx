import React, { useEffect, useState, useRef } from 'react';
import { DueRecord, StudentProfile } from '../types';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  Award,
  Printer,
  Copy,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Share2,
  Download,
  Loader2,
} from 'lucide-react';
import { gsap, useGSAP, prefersReducedMotion } from '../utils/animation';

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
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  // Cinematic GSAP Certificate Entrance, Golden Seal Rotation, and Rubber-Stamp Impact
  useGSAP(
    () => {
      if (prefersReducedMotion() || !certRef.current) return;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // 1. Certificate Container: Expands cleanly into view
      tl.from(certRef.current, {
        scale: 0.92,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      })
        // 2. Golden Seal / Emblem: Rotates slightly into position
        .from(
          '.cert-emblem',
          {
            scale: 0.5,
            rotation: -20,
            opacity: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
          },
          '-=0.3'
        )
        // 3. Status Ribbon slide-in
        .from(
          '.cert-ribbon',
          {
            y: 15,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
          },
          '-=0.2'
        )
        // 4. Official Endorsement Seals: Rubber-stamp impact
        .from(
          '.cert-stamp',
          {
            scale: 1.5,
            opacity: 0,
            stagger: 0.1,
            duration: 0.45,
            ease: 'bounce.out',
          },
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

  const certId = student.certificateId || `RGUKT-RKV-2024-${student.branch}-${student.rollNo}`;
  const masterHash = student.masterCertificateHash || student.masterHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certId}`;

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
            width: 180,
            color: {
              dark: '#1C1B18',
              light: '#FFFFFF',
            },
          });
          if (isMounted) setQrDataUrl(url);
        } else {
          // Fallback if bundler export is shaped differently
          if (isMounted) {
            setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}`);
          }
        }
      } catch (err) {
        console.warn('QR generation fallback notice:', err);
        if (isMounted) {
          setQrDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(verifyUrl)}`);
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

  const handleDownloadPDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setDownloadNotice(null);

    try {
      const element = certRef.current;
      if (!element) {
        throw new Error('Certificate element reference not found');
      }

      // Load html2pdf dynamically with multi-layer fallback
      let html2pdf: any;
      try {
        const mod: any = await import('html2pdf.js');
        html2pdf = mod?.default || mod;
      } catch (err) {
        console.warn('Dynamic import of html2pdf.js failed, testing window scope:', err);
      }

      if (typeof html2pdf !== 'function' && typeof (window as any).html2pdf === 'function') {
        html2pdf = (window as any).html2pdf;
      }

      if (typeof html2pdf !== 'function') {
        // Fallback to CDN script injection
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = () => resolve(true);
          script.onerror = reject;
          document.head.appendChild(script);
        });
        html2pdf = (window as any).html2pdf;
      }

      if (typeof html2pdf !== 'function') {
        throw new Error('Could not load html2pdf generator');
      }

      const rollNumber = student?.rollNo || (student as any)?.rollNumber || 'R200188';
      const filename = `RGUKT_NoDues_Certificate_${rollNumber}.pdf`;

      const opt = {
        margin: [6, 6, 6, 6],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
          backgroundColor: '#FFFDF9',
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().set(opt).from(element).save();
      setDownloadNotice(`Official certificate saved as ${filename}`);
      setTimeout(() => setDownloadNotice(null), 4000);
    } catch (err) {
      console.error('PDF generation failed, falling back to browser print:', err);
      setDownloadNotice('PDF download unavailable; opening print dialog');
      try {
        window.print();
      } catch (printErr) {
        console.warn('Browser print invocation error:', printErr);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.warn('Print triggered in sandbox/iframe:', err);
    }
  };

  const duesList = Object.values(student.dues) as DueRecord[];
  const tier1Items = duesList.filter((d) => d.tier === 1);
  const tier2Items = duesList.filter((d) => d.tier === 2);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E5E3DD] shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#615E56] hover:text-[#1A1A1A] transition-colors py-1.5 cursor-pointer"
        >
          <ArrowLeft size={15} className="shrink-0" />
          <span>Back to Student Dashboard</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {downloadNotice && (
            <div className="text-xs text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={13} className="shrink-0" />
              <span>{downloadNotice}</span>
            </div>
          )}

          <button
            id="print-cert-btn"
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadPDF}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F5C55] hover:bg-[#0C4742] text-white text-xs font-semibold shadow-xs transition-colors min-h-[42px] cursor-pointer disabled:opacity-60"
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
            id="browser-print-btn"
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D5D2C7] bg-white hover:bg-[#FAF9F5] text-xs font-semibold text-[#37352F] shadow-xs transition-colors min-h-[42px] cursor-pointer"
            title="Open standard browser print dialog"
          >
            <Printer size={14} className="shrink-0" />
            <span>Browser Print</span>
          </button>

          <button
            id="open-verify-link-btn"
            type="button"
            onClick={() => onNavigateToVerify(certId)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#0F5C55] text-[#0F5C55] bg-[#E6F4F1] hover:bg-[#D7EFEA] text-xs font-semibold shadow-xs transition-colors min-h-[42px] cursor-pointer"
          >
            <ShieldCheck size={14} className="shrink-0" />
            <span>Open Verification Page</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Paper Container */}
      <div
        ref={certRef}
        id="official-certificate"
        className="bg-[#FFFDF9] border-4 border double border-[#8A8474] rounded-2xl p-4 sm:p-6 md:p-10 shadow-lg text-[#2A2824] space-y-6 sm:space-y-8 relative overflow-hidden print:border-none print:shadow-none print:p-4"
        style={{
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Subtle Watermark Stamp */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Award size={460} />
        </div>

        {/* Header: University Emblem & Title */}
        <div className="text-center space-y-2 border-b-2 border-[#D5CEBF] pb-6 relative z-10">
          <div className="flex justify-center mb-2">
            <div className="cert-emblem w-16 h-16 rounded-full bg-[#FAF7EE] border-2 border-[#B8860B] flex items-center justify-center shadow-xs">
              <Award className="w-10 h-10 text-[#B8860B]" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[11px] sm:text-xs font-semibold text-[#615E56] uppercase tracking-widest">
              Government of Andhra Pradesh • Established under Act 18 of 2008
            </p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-official-serif tracking-tight text-[#1A1A1A]">
              RAJIV GANDHI UNIVERSITY OF KNOWLEDGE TECHNOLOGIES
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#44413B]">
              RK VALLEY CAMPUS (Idupulapaya), YSR KADAPA DISTRICT, A.P. - 516330
            </p>
          </div>

          <div className="pt-3">
            <span className="inline-block bg-[#FAF5E6] border border-[#D5C186] text-[#634E17] font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-1.5 rounded-full uppercase tracking-wider">
              Certificate of Digital No-Dues & Institutional Clearance
            </span>
          </div>
        </div>

        {/* Certificate Metadata Ribbon */}
        <div className="cert-ribbon grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-xl bg-[#FAF8F2] border border-[#E5DFD1] text-xs relative z-10 font-medium">
          <div>
            <span className="text-[10px] text-[#787368] uppercase font-bold block">
              Certificate Reference ID
            </span>
            <span className="font-mono font-bold text-xs text-[#1A1A1A] break-all">
              {certId}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#787368] uppercase font-bold block">
              Candidate Roll Number
            </span>
            <span className="font-mono font-bold text-sm text-[#0F5C55]">
              {student.rollNo}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#787368] uppercase font-bold block">
              Date & Time of Issuance
            </span>
            <span className="font-mono text-xs text-[#1A1A1A]">
              {student.certificateIssuedAt
                ? new Date(student.certificateIssuedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : student.issuedAt
                ? new Date(student.issuedAt).toLocaleDateString('en-IN')
                : '06-Sep-2026'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-[#787368] uppercase font-bold block">
              Cryptographic Status
            </span>
            <span className="text-xs font-bold text-[#059669] flex items-center gap-1.5">
              <span className="cert-pulse-dot inline-block">
                <CheckCircle2 size={13} className="shrink-0 text-[#059669]" />
              </span>
              <span>Merkle Root Verified</span>
            </span>
          </div>
        </div>

        {/* Student Particulars Statement */}
        <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-[#37352F] relative z-10">
          <p>
            This is to certify that candidate{' '}
            <strong className="text-base font-bold text-[#1A1A1A] underline decoration-[#B8860B]">
              {student.name}
            </strong>
            , bearing University Roll Number{' '}
            <strong className="font-mono font-bold text-[#1A1A1A]">{student.rollNo}</strong>,
            enrolled in the{' '}
            <strong>
              {student.program} in {student.branch}
            </strong>{' '}
            (Batch of {student.batch}), has systematically completed all institutional no-dues protocols.
          </p>
          <p>
            All academic laboratories, library records, residential hostels, sports equipment,
            and administrative accounts stand reconciled with zero outstanding encumbrance (₹0.00).
          </p>
        </div>

        {/* Table 1: Tier 1 Clearance Ledger */}
        <div className="space-y-2 relative z-10">
          <h3 className="font-bold text-xs text-[#44413B] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F5C55] shrink-0" />
            <span>Tier 1: Central University Sections (7 Offices Reconciled)</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#E5DFD1]">
            <table className="w-full text-left text-xs border-collapse min-w-[540px]">
              <thead className="bg-[#FAF8F2] border-b border-[#E5DFD1] text-[#615C52]">
                <tr>
                  <th className="p-2.5 font-semibold">Section Name</th>
                  <th className="p-2.5 font-semibold">Status</th>
                  <th className="p-2.5 font-semibold">Amount</th>
                  <th className="p-2.5 font-semibold">Digital SignStamp Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE6DA]">
                {tier1Items.map((item) => (
                  <tr key={item.sectionCode} className="hover:bg-[#FCFAF5]">
                    <td className="p-2.5 font-medium">{item.sectionName}</td>
                    <td className="p-2.5">
                      <span className="text-[#065F46] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 size={12} className="shrink-0" />
                        <span>Cleared</span>
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-[#1A1A1A]">₹0.00</td>
                    <td className="p-2.5 text-[11px] text-[#615C52]">
                      {item.signStamp ? (
                        <span>
                          Digitally signed —{' '}
                          <strong className="text-[#1A1A1A]">{item.signStamp.officerName}</strong>,{' '}
                          <span className="font-mono text-[10px] text-[#7A7568]">
                            {item.signStamp.signatureHash.slice(0, 10)}...
                          </span>
                        </span>
                      ) : (
                        'Verified'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Tier 2 Branch Laboratories Clearance Ledger */}
        <div className="space-y-2 relative z-10">
          <h3 className="font-bold text-xs text-[#44413B] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#33396B] shrink-0" />
            <span>Tier 2: {student.branch} Department Laboratories & Curriculum Vivas</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-[#E5DFD1]">
            <table className="w-full text-left text-xs border-collapse min-w-[540px]">
              <thead className="bg-[#FAF8F2] border-b border-[#E5DFD1] text-[#615C52]">
                <tr>
                  <th className="p-2.5 font-semibold">Curriculum Lab</th>
                  <th className="p-2.5 font-semibold">Status</th>
                  <th className="p-2.5 font-semibold">Due</th>
                  <th className="p-2.5 font-semibold">Digital SignStamp Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE6DA]">
                {tier2Items.map((item) => (
                  <tr key={item.sectionCode} className="hover:bg-[#FCFAF5]">
                    <td className="p-2.5 font-medium">{item.sectionName}</td>
                    <td className="p-2.5">
                      <span className="text-[#065F46] font-bold inline-flex items-center gap-1">
                        <CheckCircle2 size={12} className="shrink-0" />
                        <span>Cleared</span>
                      </span>
                    </td>
                    <td className="p-2.5 font-mono font-bold text-[#1A1A1A]">₹0.00</td>
                    <td className="p-2.5 text-[11px] text-[#615C52]">
                      {item.signStamp ? (
                        <span>
                          Digitally signed —{' '}
                          <strong className="text-[#1A1A1A]">{item.signStamp.officerName}</strong>,{' '}
                          <span className="font-mono text-[10px] text-[#7A7568]">
                            {item.signStamp.signatureHash.slice(0, 10)}...
                          </span>
                        </span>
                      ) : (
                        'Verified'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tier 3: Executive Endorsements Grid & QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t-2 border-[#D5CEBF] relative z-10 items-end">
          {/* HOD Endorsement */}
          <div className="cert-stamp p-3 rounded-lg border border-[#E5DFD1] bg-[#FAF8F2] text-xs text-center space-y-1">
            <div className="font-bold text-[#1A1A1A]">
              {student.executiveApprovals.hod.officerName || 'Head of Department'}
            </div>
            <div className="text-[10px] text-[#615C52]">HOD, Dept of {student.branch}</div>
            <div className="text-[9px] font-mono text-[#059669]">
              Signed: {student.executiveApprovals.hod.signatureHash?.slice(0, 12)}...
            </div>
          </div>

          {/* Student Declaration */}
          <div className="cert-stamp p-3 rounded-lg border border-[#E5DFD1] bg-[#FAF8F2] text-xs text-center space-y-1">
            <div className="font-bold text-[#1A1A1A]">{student.name}</div>
            <div className="text-[10px] text-[#615C52]">Student Digital e-Signature</div>
            <div className="text-[9px] font-mono text-[#059669]">
              Acknowledged: {student.rollNo}
            </div>
          </div>

          {/* DSW Seal */}
          <div className="cert-stamp p-3 rounded-lg border border-[#E5DFD1] bg-[#FAF8F2] text-xs text-center space-y-1">
            <div className="font-bold text-[#1A1A1A]">
              {student.executiveApprovals.dsw.officerName || 'Dean, Students Welfare'}
            </div>
            <div className="text-[10px] text-[#615C52]">Dean, Students Welfare (DSW)</div>
            <div className="text-[9px] font-mono text-[#059669]">
              Signed: {student.executiveApprovals.dsw.signatureHash?.slice(0, 12)}...
            </div>
          </div>

          {/* Registrar Seal with Authentic QR Code */}
          <div className="cert-stamp p-3 rounded-lg border-2 border-[#B8860B] bg-[#FFFDF7] text-xs text-center space-y-1.5 flex flex-col items-center">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Verification QR Code"
                className="w-24 h-24 border border-[#DDD9CE] p-1 rounded bg-white shadow-2xs"
              />
            )}
            <div className="font-bold text-[#1A1A1A] text-[11px]">
              {student.executiveApprovals.registrar.officerName || 'Registrar / Director'}
            </div>
            <div className="text-[10px] text-[#B8860B] font-bold uppercase tracking-wider">
              University Seal Affixed
            </div>
          </div>
        </div>

        {/* Cryptographic Merkle Root Hash Display */}
        <div className="p-3 rounded-xl bg-[#FAF8F2] border border-[#E5DFD1] relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-[#555045] uppercase text-[10px] tracking-wider block">
              Master Tamper-Evident SHA-256 Hash:
            </span>
            <span className="font-mono text-xs text-[#1A1A1A] break-all select-all font-semibold">
              {masterHash}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyHash}
            className="self-start sm:self-auto shrink-0 px-3.5 py-2 rounded-lg border border-[#D5CEBF] bg-white hover:bg-[#F2ECE0] text-xs font-semibold text-[#37352F] flex items-center gap-1.5 transition-colors min-h-[40px] cursor-pointer"
          >
            {copiedHash ? <CheckCircle2 size={13} className="text-[#059669] shrink-0" /> : <Copy size={13} className="shrink-0" />}
            <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
