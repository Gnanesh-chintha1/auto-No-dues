import React, { useState, useEffect } from 'react';
import { AuthSession, StaffAccount, StudentProfile } from './types';
import { initializeDataStore, getStudentByRollNo, subscribeToStore } from './services/dataStore';
import { clearSession, getStoredSession, storeSession } from './services/authService';
import { Navbar } from './components/Navbar';

// Screens
import { Landing } from './screens/Landing';
import { StudentLogin } from './screens/StudentLogin';
import { AdminLogin } from './screens/AdminLogin';
import { ExecutiveLogin } from './screens/ExecutiveLogin';
import { StudentDashboard } from './screens/StudentDashboard';
import { GeneralSectionDesk } from './screens/GeneralSectionDesk';
import { LabClearanceDesk } from './screens/LabClearanceDesk';
import { ExecutiveDesk } from './screens/ExecutiveDesk';
import { CertificateView } from './screens/CertificateView';
import { PublicVerification } from './screens/PublicVerification';

type Screen =
  | 'landing'
  | 'student_login'
  | 'admin_login'
  | 'executive_login'
  | 'student_dashboard'
  | 'general_desk'
  | 'lab_desk'
  | 'executive_desk'
  | 'certificate'
  | 'public_verify';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeStaff, setActiveStaff] = useState<StaffAccount | null>(null);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);

  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [targetCertId, setTargetCertId] = useState<string>('RGUKT-RKV-2024-ECE-882104');
  const [initialized, setInitialized] = useState(false);

  // Initialize data store and handle routing on boot
  useEffect(() => {
    initializeDataStore().then(() => {
      // Check URL for public verification link (e.g. /verify/RGUKT-... or ?certId=...)
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const search = new URLSearchParams(window.location.search);

        if (path.startsWith('/verify/')) {
          const cert = path.replace('/verify/', '');
          if (cert) {
            setTargetCertId(cert);
            setCurrentScreen('public_verify');
            setInitialized(true);
            return;
          }
        } else if (search.get('verify')) {
          setTargetCertId(search.get('verify')!);
          setCurrentScreen('public_verify');
          setInitialized(true);
          return;
        }
      }

      // Check stored session
      const stored = getStoredSession();
      if (stored) {
        setSession(stored);
        routeSession(stored);
      }
      setInitialized(true);
    });
  }, []);

  // Listen for real-time Firestore database updates
  useEffect(() => {
    const unsubscribe = subscribeToStore((students) => {
      if (session?.role === 'STUDENT' && session.userId) {
        const current = students.find((s) => s.rollNo.toUpperCase() === session.userId.toUpperCase());
        if (current) {
          setActiveStudent({ ...current });
        }
      }
    });

    return () => unsubscribe();
  }, [session]);

  const routeSession = (sess: AuthSession) => {
    if (sess.role === 'STUDENT') {
      const student = getStudentByRollNo(sess.userId);
      if (student) {
        setActiveStudent(student);
        setCurrentScreen('student_dashboard');
      }
    } else if (sess.role === 'TIER1_STAFF') {
      const staff: StaffAccount = {
        id: sess.userId,
        name: sess.name,
        email: sess.email || `${sess.userId.toLowerCase()}@rguktrkv.ac.in`,
        role: 'TIER1_STAFF',
        allowedDomain: sess.domainId || 'LIBRARY',
        designation: sess.designation || 'Section Officer',
      };
      setActiveStaff(staff);
      setCurrentScreen('general_desk');
    } else if (sess.role === 'TIER2_LAB_INCHARGE') {
      const staff: StaffAccount = {
        id: sess.userId,
        name: sess.name,
        email: sess.email || `${sess.userId.toLowerCase()}@rguktrkv.ac.in`,
        role: 'TIER2_LAB_INCHARGE',
        allowedDomain: 'LAB_INCHARGE',
        allowedBranch: sess.branch,
        allowedLabCode: sess.labCode,
        designation: sess.designation || 'Lab In-Charge',
      };
      setActiveStaff(staff);
      setCurrentScreen('lab_desk');
    } else if (sess.role === 'HOD' || sess.role === 'DSW' || sess.role === 'REGISTRAR') {
      const staff: StaffAccount = {
        id: sess.userId,
        name: sess.name,
        email: sess.email || `${sess.userId.toLowerCase()}@rguktrkv.ac.in`,
        role: sess.role,
        allowedDomain: sess.role,
        allowedBranch: sess.branch,
        designation: sess.designation || 'Executive Officer',
      };
      setActiveStaff(staff);
      setCurrentScreen('executive_desk');
    }
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setActiveStaff(null);
    setActiveStudent(null);
    setCurrentScreen('landing');
  };

  const handleUpdateStudent = (updatedStudent: StudentProfile) => {
    setActiveStudent({ ...updatedStudent });
  };

  const handleRefreshStaffData = () => {
    if (session) {
      routeSession(session);
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5] text-[#2A2824]">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#0F5C55] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#615E56]">Initializing RGUKT Clearance Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col text-[#2A2824]">
      {/* Top Navigation */}
      <Navbar
        session={session}
        onLogout={handleLogout}
        onNavigateHome={() => setCurrentScreen(session ? (session.role === 'STUDENT' ? 'student_dashboard' : session.role === 'TIER2_LAB_INCHARGE' ? 'lab_desk' : session.role === 'TIER1_STAFF' ? 'general_desk' : 'executive_desk') : 'landing')}
        onNavigateVerify={() => setCurrentScreen('public_verify')}
        onNavigateCertificate={() => {
          if (activeStudent && activeStudent.certificateIssued) {
            setCurrentScreen('certificate');
          }
        }}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {currentScreen === 'landing' && (
          <Landing
            onSelectFlow={(flow) => {
              if (flow === 'student') setCurrentScreen('student_login');
              else if (flow === 'admin') setCurrentScreen('admin_login');
              else if (flow === 'executive') setCurrentScreen('executive_login');
              else if (flow === 'verify') setCurrentScreen('public_verify');
            }}
          />
        )}

        {currentScreen === 'student_login' && (
          <StudentLogin
            onBack={() => setCurrentScreen('landing')}
            onSuccess={(newSession) => {
              storeSession(newSession);
              setSession(newSession);
              routeSession(newSession);
            }}
          />
        )}

        {currentScreen === 'admin_login' && (
          <AdminLogin
            onBack={() => setCurrentScreen('landing')}
            onSuccess={(newSession, staffAccount) => {
              storeSession(newSession);
              setSession(newSession);
              setActiveStaff(staffAccount);
              if (staffAccount.role === 'TIER2_LAB_INCHARGE') {
                setCurrentScreen('lab_desk');
              } else {
                setCurrentScreen('general_desk');
              }
            }}
          />
        )}

        {currentScreen === 'executive_login' && (
          <ExecutiveLogin
            onBack={() => setCurrentScreen('landing')}
            onSuccess={(newSession, officerAccount) => {
              storeSession(newSession);
              setSession(newSession);
              setActiveStaff(officerAccount);
              setCurrentScreen('executive_desk');
            }}
          />
        )}

        {currentScreen === 'student_dashboard' && activeStudent && (
          <StudentDashboard
            student={activeStudent}
            onUpdateStudent={handleUpdateStudent}
            onViewCertificate={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              setCurrentScreen('certificate');
            }}
          />
        )}

        {currentScreen === 'general_desk' && activeStaff && (
          <GeneralSectionDesk
            staff={activeStaff}
            onRefreshData={handleRefreshStaffData}
          />
        )}

        {currentScreen === 'lab_desk' && activeStaff && (
          <LabClearanceDesk
            staff={activeStaff}
            onRefreshData={handleRefreshStaffData}
          />
        )}

        {currentScreen === 'executive_desk' && activeStaff && (
          <ExecutiveDesk
            officer={activeStaff}
            onRefreshData={handleRefreshStaffData}
          />
        )}

        {currentScreen === 'certificate' && (
          <CertificateView
            student={
              activeStudent ||
              (session?.role === 'STUDENT' && session?.userId
                ? getStudentByRollNo(session.userId) || null
                : null) ||
              getStudentByRollNo('R200188')!
            }
            onBack={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              setCurrentScreen(session?.role === 'STUDENT' ? 'student_dashboard' : 'landing');
            }}
            onNavigateToVerify={(certId) => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              setTargetCertId(certId);
              setCurrentScreen('public_verify');
            }}
          />
        )}

        {currentScreen === 'public_verify' && (
          <PublicVerification
            initialCertId={targetCertId}
            onNavigateHome={() => setCurrentScreen(session ? 'student_dashboard' : 'landing')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E3DD] bg-white py-4 px-4 sm:px-6 text-center text-xs text-[#78756E] print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 Rajiv Gandhi University of Knowledge Technologies, A.P. (RK Valley Campus)
          </span>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Automated No-Dues Portal</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setCurrentScreen('public_verify')}
              className="text-[#0F5C55] hover:underline"
            >
              Public Certificate Verifier
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
