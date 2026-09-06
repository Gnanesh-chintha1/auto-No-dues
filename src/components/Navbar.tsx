import React, { useState, useRef } from 'react';
import { AuthSession } from '../types';
import { ShieldCheck, LogOut, Search, Award, Menu, X, Home, ExternalLink } from 'lucide-react';
import { gsap, useGSAP, prefersReducedMotion } from '../utils/animation';

interface NavbarProps {
  session: AuthSession | null;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateVerify: () => void;
  onNavigateCertificate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  onLogout,
  onNavigateHome,
  onNavigateVerify,
  onNavigateCertificate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (prefersReducedMotion() || !navRef.current) return;
    gsap.from(navRef.current, {
      y: -20,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  }, { scope: navRef });

  // Theme accent bar based on authenticated role
  const getRoleHeaderBg = () => {
    if (!session) return 'bg-[#0F5C55] border-[#0D4D47]';
    if (session.role === 'STUDENT') return 'bg-[#0F5C55] border-[#0D4D47]';
    if (session.role === 'TIER1_STAFF' || session.role === 'TIER2_LAB_INCHARGE') {
      return 'bg-[#33396B] border-[#252A50]';
    }
    // Executive (HOD / DSW / REGISTRAR)
    return 'bg-[#5C2A1E] border-[#4A2117]';
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const headerBg = getRoleHeaderBg();

  const handleMobileNav = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header ref={navRef} className={`h-16 ${headerBg} text-white flex items-center justify-between px-3 sm:px-6 border-b shadow-xs sticky top-0 z-40 w-full`}>
        {/* Left: Emblem & Institutional Title */}
        <div
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group min-w-0"
        >
          {/* RGUKT Emblem Stamp */}
          <div className="w-10 h-10 min-w-[40px] min-h-[40px] sm:w-11 sm:h-11 sm:min-w-[44px] sm:min-h-[44px] bg-white rounded-md p-1 flex flex-col items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <div className="w-full h-full border border-[#0F5C55] rounded-xs flex flex-col items-center justify-center text-[#0F5C55] text-center p-0.5 select-none">
              <span className="text-[9px] sm:text-[10px] font-bold leading-tight tracking-wider text-center block">
                RGUKT
              </span>
              <span className="text-[8px] sm:text-[9px] font-extrabold leading-tight tracking-widest text-center block text-[#0A433E]">
                RKV
              </span>
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base lg:text-lg font-semibold tracking-tight leading-tight text-white truncate max-w-[190px] xs:max-w-[240px] sm:max-w-none">
                No-Dues & Digital Clearance
              </h1>
              {session && (
                <span className="hidden xl:inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/15 text-white border border-white/20 shrink-0">
                  {session.role === 'STUDENT'
                    ? 'Student Portal'
                    : session.role === 'TIER2_LAB_INCHARGE'
                    ? 'Lab In-Charge'
                    : session.role === 'TIER1_STAFF'
                    ? 'General Desk'
                    : session.role}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest text-emerald-100/80 leading-tight truncate max-w-[200px] xs:max-w-[260px] sm:max-w-none">
              Rajiv Gandhi University of Knowledge Technologies
            </span>
          </div>
        </div>

        {/* Right Controls (Desktop & Mobile trigger) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Public Verification Link */}
          <button
            id="nav-verify-btn"
            type="button"
            onClick={onNavigateVerify}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-black/20 hover:bg-black/30 text-white border border-white/20 transition-colors shadow-xs min-h-[38px] cursor-pointer"
          >
            <Search size={14} className="text-white/80 shrink-0" />
            <span>Verify Certificate</span>
          </button>

          {/* Authenticated User pill (Desktop) */}
          {session && (
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/20">
              <div className="text-right">
                <div className="text-xs sm:text-sm font-medium leading-tight text-white truncate max-w-[150px]">
                  {session.name}
                </div>
                <div className="text-[11px] font-mono text-white/80 leading-tight">
                  {session.userId} {session.branch ? `| ${session.branch}` : ''}
                </div>
              </div>

              {/* Initials Avatar */}
              <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xs font-bold shadow-inner text-white shrink-0">
                {getInitials(session.name)}
              </div>

              <button
                id="nav-logout-btn"
                type="button"
                onClick={onLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Menu Toggle Button (Min 44x44px target) */}
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            aria-label="Open mobile navigation menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg text-white hover:bg-white/15 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile Slide-Up Drawer */}
          <div className="relative z-10 bg-white text-slate-900 rounded-t-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-md bg-[#0F5C55] text-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                  <div className="w-full h-full border border-white/80 rounded-xs flex flex-col items-center justify-center text-white text-center select-none">
                    <span className="text-[9px] font-bold leading-tight tracking-wider text-center block">
                      RGUKT
                    </span>
                    <span className="text-[8px] font-extrabold leading-tight tracking-widest text-center block text-emerald-200">
                      RKV
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Clearance Portal</h3>
                  <p className="text-[11px] text-slate-500">RGUKT RK Valley</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Session Info Card (if logged in) */}
            {session ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0F5C55]/10 text-[#0F5C55] border border-[#0F5C55]/20 flex items-center justify-center text-xs font-bold shrink-0">
                    {getInitials(session.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-900 truncate">
                      {session.name}
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      ID: {session.userId} {session.branch ? `• ${session.branch}` : ''}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Role:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-[#0F5C55]">
                    {session.role === 'STUDENT'
                      ? 'Student'
                      : session.role === 'TIER2_LAB_INCHARGE'
                      ? 'Lab In-Charge'
                      : session.role === 'TIER1_STAFF'
                      ? 'Section Staff'
                      : session.role}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-[#065F46]">
                Portal active. Select your user role to authenticate.
              </div>
            )}

            {/* Navigation Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => handleMobileNav(onNavigateHome)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors min-h-[48px]"
              >
                <Home size={18} className="text-[#0F5C55] shrink-0" />
                <span>{session ? 'Go to Dashboard' : 'University Home'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleMobileNav(onNavigateVerify)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-semibold transition-colors min-h-[48px]"
              >
                <Search size={18} className="text-[#0F5C55] shrink-0" />
                <span>Verify No-Dues Certificate</span>
              </button>

              {onNavigateCertificate && (
                <button
                  type="button"
                  onClick={() => handleMobileNav(onNavigateCertificate)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70 text-[#065F46] text-sm font-semibold transition-colors min-h-[48px]"
                >
                  <Award size={18} className="text-[#059669] shrink-0" />
                  <span>View Issued Certificate</span>
                </button>
              )}
            </div>

            {/* Logout Action (if logged in) */}
            {session && (
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleMobileNav(onLogout)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#991B1B] font-semibold text-sm transition-colors border border-rose-200 min-h-[48px]"
                >
                  <LogOut size={16} />
                  <span>Sign Out of Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

