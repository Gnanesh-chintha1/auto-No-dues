import React, { useRef } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  Fingerprint,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { gsap, useGSAP, prefersReducedMotion } from '../utils/animation';

interface LandingProps {
  onSelectFlow: (flow: 'student' | 'admin' | 'executive' | 'verify') => void;
  onQuickDemo?: (rollNo: string) => void;
}

interface EntryPathItem {
  id: string;
  flow: 'student' | 'admin' | 'executive';
  badgeNum: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconClass: string;
  accentColor: string;
  hoverBorder: string;
  buttonBg: string;
  buttonHover: string;
  buttonText: string;
  buttonId: string;
  features: string[];
}

const ENTRY_PATHS: EntryPathItem[] = [
  {
    id: 'entry-card-student',
    flow: 'student',
    badgeNum: 'Entry Path 01',
    title: 'Student Portal',
    description:
      'Direct login via University Roll Number. View live 3-tier clearance status, settle staff-recorded dues via UTR reference, and download your verified certificate.',
    icon: <GraduationCap size={24} />,
    iconClass: 'bg-[#E6F4F1] border-[#A3D9D2] text-[#0F5C55]',
    accentColor: 'text-[#0F5C55]',
    hoverBorder: 'hover:border-[#0F5C55]',
    buttonBg: 'bg-[#0F5C55]',
    buttonHover: 'hover:bg-[#0C4742]',
    buttonText: 'Proceed to Student Login',
    buttonId: 'student-login-cta',
    features: [
      'Real-time tier progress tracking',
      'Fixed due settlement & UTR submission',
      'Digital e-signature acknowledgement',
    ],
  },
  {
    id: 'entry-card-admin',
    flow: 'admin',
    badgeNum: 'Entry Path 02',
    title: 'Admin & Lab Desks',
    description:
      'Domain-first selection for Tier 1 offices (Library, Hostel, Accounts, Sports) and Tier 2 lab in-charges. Enforces server-side domain verification.',
    icon: <Building2 size={24} />,
    iconClass: 'bg-[#EEF2FF] border-[#C7D2FE] text-[#33396B]',
    accentColor: 'text-[#33396B]',
    hoverBorder: 'hover:border-[#33396B]',
    buttonBg: 'bg-[#33396B]',
    buttonHover: 'hover:bg-[#282D54]',
    buttonText: 'Select Admin Domain',
    buttonId: 'admin-login-cta',
    features: [
      'Staff-first due entry (₹0 or fee amount)',
      'Student payment UTR verification',
      'Cryptographic SignStamp generation',
    ],
  },
  {
    id: 'entry-card-executive',
    flow: 'executive',
    badgeNum: 'Entry Path 03',
    title: 'Executive Approvals',
    description:
      'Tier 3 authorities: Head of Department (HOD) → Dean of Students Welfare (DSW) → Registrar / Director. Enforces strict sequencing gates.',
    icon: <Award size={24} />,
    iconClass: 'bg-[#FDF2F0] border-[#F8C8C0] text-[#5C2A1E]',
    accentColor: 'text-[#5C2A1E]',
    hoverBorder: 'hover:border-[#5C2A1E]',
    buttonBg: 'bg-[#5C2A1E]',
    buttonHover: 'hover:bg-[#461F16]',
    buttonText: 'Executive Authority Login',
    buttonId: 'executive-login-cta',
    features: [
      'HOD sign-off (requires 100% labs clear)',
      'DSW seal (requires Tier 1 + HOD sign)',
      'Registrar final university clearance seal',
    ],
  },
];

export const Landing: React.FC<LandingProps> = ({ onSelectFlow, onQuickDemo }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Staggered entrance animation with safe fallbacks and explicit visibility
  useGSAP(
    () => {
      if (typeof window === 'undefined' || prefersReducedMotion() || !containerRef.current) return;

      // Verify that targets exist before animating
      const cards = containerRef.current.querySelectorAll('.portal-card');
      const badge = containerRef.current.querySelector('.hero-badge');
      const titles = containerRef.current.querySelectorAll('.hero-title-part');
      const subtitle = containerRef.current.querySelector('.hero-subtitle');
      const banner = containerRef.current.querySelector('.trust-banner');

      if (!cards.length && !badge) return;

      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      // 1. Campus Pill Badge
      if (badge) {
        tl.fromTo(
          badge,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(1.5)', clearProps: 'all' }
        );
      }

      // 2. Main H1 Headline
      if (titles.length) {
        tl.fromTo(
          titles,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.55, stagger: 0.1, ease: 'power3.out', clearProps: 'all' },
          badge ? '-=0.2' : 0
        );
      }

      // 3. Subtitle
      if (subtitle) {
        tl.fromTo(
          subtitle,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', clearProps: 'all' },
          '-=0.2'
        );
      }

      // 4. Interactive Portal Cards entrance (explicit fromTo + clearProps: 'all')
      if (cards.length) {
        tl.fromTo(
          cards,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out', clearProps: 'all' },
          '-=0.2'
        );
      }

      // 5. Institutional trust banner
      if (banner) {
        tl.fromTo(
          banner,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'all' },
          '-=0.2'
        );
      }
    },
    { scope: containerRef }
  );

  // Card magnetic hover & click physics handlers
  const handleCardMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const card = e.currentTarget;
    const icon = card.querySelector('.card-icon');
    gsap.to(card, { y: -6, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    if (icon) {
      gsap.to(icon, { scale: 1.12, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    const card = e.currentTarget;
    const icon = card.querySelector('.card-icon');
    gsap.to(card, { y: 0, scale: 1, duration: 0.25, ease: 'power2.inOut', overwrite: 'auto' });
    if (icon) {
      gsap.to(icon, { scale: 1, duration: 0.25, ease: 'power2.inOut', overwrite: 'auto' });
    }
  };

  const handleCardMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    gsap.to(e.currentTarget, { scale: 0.98, duration: 0.1, ease: 'power1.out', overwrite: 'auto' });
  };

  const handleCardMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion()) return;
    gsap.to(e.currentTarget, { scale: 1, duration: 0.2, ease: 'back.out(2)', overwrite: 'auto' });
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#fbfbfa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10">
        {/* Institutional Hero Banner */}
        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#DDD9CE] text-[11px] sm:text-xs font-semibold text-[#44413B] shadow-xs opacity-100 visible">
            <ShieldCheck size={14} className="text-[#0F5C55] shrink-0" />
            <span>Rajiv Gandhi University of Knowledge Technologies • RK Valley Campus</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1A1A] leading-tight font-official-serif">
            <span className="hero-title-part inline-block opacity-100 visible">Automated</span>{' '}
            <span className="hero-title-part inline-block bg-gradient-to-r from-emerald-600 via-teal-500 to-green-600 bg-clip-text text-transparent font-extrabold opacity-100 visible">
              No-Dues
            </span>{' '}
            <span className="hero-title-part inline-block opacity-100 visible">& Digital Clearance Portal</span>
          </h1>

          <p className="hero-subtitle text-sm sm:text-base md:text-lg text-[#52504A] max-w-2xl mx-auto leading-relaxed opacity-100 visible">
            Three-tier institutional clearance hierarchy, staff-first due verification,
            and cryptographically signed, tamper-evident digital certificates.
          </p>
        </div>

        {/* 3 Top-Level Entry Paths (Explicit mobile-first visibility, no hidden classes) */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-8 max-w-7xl mx-auto">
          {(ENTRY_PATHS || []).map((card) => (
            <div
              key={card.id}
              id={card.id}
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              onMouseDown={handleCardMouseDown}
              onMouseUp={handleCardMouseUp}
              onClick={() => onSelectFlow(card.flow)}
              className={`portal-card opacity-100 visible bg-white rounded-2xl border border-[#E5E3DD] p-5 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${card.hoverBorder} cursor-pointer`}
            >
              <div className="space-y-4">
                <div className={`card-icon w-12 h-12 rounded-xl border flex items-center justify-center transition-transform shrink-0 ${card.iconClass}`}>
                  {card.icon}
                </div>

                <div>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${card.accentColor}`}>
                    {card.badgeNum}
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">{card.title}</h2>
                  <p className="text-xs text-[#615E56] mt-1.5 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#F0EFEB] text-xs text-[#52504A]">
                  {(card.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 size={13} className={`${card.accentColor} shrink-0`} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                id={card.buttonId}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectFlow(card.flow);
                }}
                className={`mt-6 w-full py-2.5 px-4 rounded-xl ${card.buttonBg} ${card.buttonHover} text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-xs min-h-[44px] cursor-pointer`}
              >
                <span>{card.buttonText}</span>
                <ArrowRight size={15} className="shrink-0" />
              </button>
            </div>
          ))}
        </div>

      {/* System Architecture Highlights (Institutional Trust) */}
      <div className="trust-banner bg-[#FAF9F5] border border-[#E5E3DD] rounded-2xl p-5 sm:p-8">
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#1A1A1A]">
            Institutional Integrity & Compliance Standards
          </h2>
          <p className="text-xs sm:text-sm text-[#615E56] mt-1">
            Built strictly around RGUKT RK Valley's administrative protocols and branch curricula.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="p-4 rounded-xl bg-white border border-[#E5E3DD] space-y-2">
            <div className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Fingerprint size={16} className="text-[#0F5C55] shrink-0" />
              <span>Roll Number Identity Key</span>
            </div>
            <p className="text-xs text-[#615E56] leading-relaxed">
              Roll Number is the sole identity key everywhere. Dues, signatures, and certificates
              are cryptographically anchored to official student IDs without ambiguous name collisions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E3DD] space-y-2">
            <div className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <Lock size={16} className="text-[#33396B] shrink-0" />
              <span>Staff-First Due Entry</span>
            </div>
            <p className="text-xs text-[#615E56] leading-relaxed">
              Students cannot declare dues. Every section remains greyed as "Pending review" until
              authorized staff records ₹0 or a fixed due. Students can only submit payment UTRs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E5E3DD] space-y-2 sm:col-span-2 lg:col-span-1">
            <div className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-2">
              <FileCheck2 size={16} className="text-[#5C2A1E] shrink-0" />
              <span>Cryptographic Hash Chains</span>
            </div>
            <p className="text-xs text-[#615E56] leading-relaxed">
              Every officer sign-off produces a deterministic SHA-256 SignStamp. The master certificate
              aggregates all stamps into an immutable Merkle root, verifiable publicly via QR code.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

