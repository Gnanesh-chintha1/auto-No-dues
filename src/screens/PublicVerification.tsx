import React, { useState, useEffect } from 'react';
import { DueRecord, VerificationResult } from '../types';
import { verifyCertificateById } from '../services/dataStore';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Fingerprint,
  FileCheck2,
} from 'lucide-react';

interface PublicVerificationProps {
  initialCertId?: string;
  onNavigateHome: () => void;
}

export const PublicVerification: React.FC<PublicVerificationProps> = ({
  initialCertId = 'RGUKT-RKV-2024-ECE-882104',
  onNavigateHome,
}) => {
  const [certInput, setCertInput] = useState(initialCertId);
  const [activeCertId, setActiveCertId] = useState(initialCertId);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Run verification whenever activeCertId changes
  useEffect(() => {
    runVerification(activeCertId);
  }, [activeCertId]);

  const runVerification = async (idToVerify: string) => {
    setVerifying(true);
    try {
      const res = await verifyCertificateById(idToVerify);
      setResult(res);
      setVerifying(false);
    } catch (err: any) {
      console.error(err);
      setVerifying(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certInput.trim()) return;
    setActiveCertId(certInput.trim());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-[#E5E3DD] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#0F5C55]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">
                RGUKT Public Certificate Verification Portal
              </h1>
            </div>
            <p className="text-xs text-[#615E56] mt-1">
              Public tamper-evidence verifier for digital clearance certificates issued by RGUKT RK Valley.
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs font-semibold text-[#0F5C55] hover:underline self-start sm:self-auto cursor-pointer"
          >
            ← Back to University Home
          </button>
        </div>

        {/* Certificate ID Search Input */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#878274] shrink-0" />
            <input
              id="verify-cert-id-input"
              type="text"
              required
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              placeholder="Enter Certificate ID (e.g. RGUKT-RKV-2024-ECE-882104)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5D2C7] font-mono text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F5C55] min-h-[44px]"
            />
          </div>

          <button
            id="verify-search-submit-btn"
            type="submit"
            disabled={verifying}
            className="px-6 py-2.5 rounded-xl bg-[#0F5C55] hover:bg-[#0C4742] text-white font-semibold text-sm transition-colors shadow-xs min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            {verifying ? 'Verifying...' : 'Verify Now'}
          </button>
        </form>

        {/* Seeded quick-pick links */}
        <div className="flex items-center gap-2 text-xs flex-wrap pt-1 text-[#615E56]">
          <span className="font-semibold">Quick Verify Issued Certificates:</span>
          <button
            type="button"
            onClick={() => {
              setCertInput('RGUKT-RKV-2024-ECE-882104');
              setActiveCertId('RGUKT-RKV-2024-ECE-882104');
            }}
            className="font-mono underline text-[#0F5C55] hover:text-[#0C4742] break-all text-left cursor-pointer"
          >
            Pooja Reddy (RGUKT-RKV-2024-ECE-882104)
          </button>
        </div>
      </div>

      {/* Main Verification Result Card */}
      {result && (
        <div className="space-y-6">
          {/* BIG UNAMBIGUOUS VERIFICATION BANNER ABOVE THE FOLD (Requirement 8) */}
          <div
            id="verification-status-banner"
            className={`p-4 sm:p-6 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
              result.authentic
                ? 'bg-[#ECFDF5] border-[#059669] text-[#065F46]'
                : 'bg-[#FEF2F2] border-[#DC2626] text-[#991B1B]'
            }`}
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div
                className={`w-11 sm:w-12 h-11 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  result.authentic ? 'bg-[#059669] text-white' : 'bg-[#DC2626] text-white'
                }`}
              >
                {result.authentic ? <ShieldCheck size={26} className="shrink-0" /> : <ShieldAlert size={26} className="shrink-0" />}
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight">
                  {result.authentic
                    ? 'AUTHENTIC RGUKT NO-DUES CERTIFICATE'
                    : 'TAMPER DETECTED / INVALID CERTIFICATE'}
                </h2>
                <p className="text-xs sm:text-sm mt-0.5 opacity-90">
                  {result.message}
                </p>
              </div>
            </div>

            <div className="self-end sm:self-auto text-right shrink-0">
              <span className="font-mono font-bold text-xs uppercase px-3 py-1 rounded-full border bg-white inline-block">
                {result.authentic ? 'MERKLE ROOT VALID' : 'HASH MISMATCH'}
              </span>
            </div>
          </div>

          {/* Student Identity Card */}
          {result.student && (
            <div className="bg-white rounded-2xl border border-[#E5E3DD] p-4 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E3DD]">
                <div>
                  <span className="text-[11px] font-bold text-[#615E56] uppercase tracking-wider">
                    Candidate Particulars
                  </span>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {result.student.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#615E56] mt-0.5">
                    <span className="font-mono font-bold text-[#0F5C55]">
                      Roll No: {result.student.rollNo}
                    </span>
                    <span>•</span>
                    <span>{result.student.program} in {result.student.branch}</span>
                    <span>•</span>
                    <span>Batch {result.student.batch}</span>
                  </div>
                </div>

                <div className="text-xs text-[#615E56] sm:text-right">
                  <div>Issued Date: {result.student.issuedAt ? new Date(result.student.issuedAt).toLocaleDateString('en-IN') : 'N/A'}</div>
                  <div className="font-mono text-[11px] text-[#878274] break-all">{activeCertId}</div>
                </div>
              </div>

              {/* Merkle Hash Comparison */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E3DD] space-y-3">
                <h4 className="font-bold text-xs text-[#37352F] uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint size={16} className="text-[#0F5C55] shrink-0" />
                  <span>Cryptographic Hash Integrity Verification</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-[#E5E3DD] space-y-1">
                    <span className="text-[10px] text-[#787368] uppercase font-bold block">
                      A. Certificate Stored Master Hash (At Issuance):
                    </span>
                    <span className="font-mono text-[11px] break-all block font-semibold text-[#1A1A1A]">
                      {result.issuedHash || 'None'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-lg border space-y-1 ${result.authentic ? 'bg-white border-[#E5E3DD]' : 'bg-[#FFF5F5] border-[#FCA5A5]'}`}>
                    <span className="text-[10px] text-[#787368] uppercase font-bold block">
                      B. Live Recomputed Merkle Hash (From Current State):
                    </span>
                    <span className={`font-mono text-[11px] break-all block font-semibold ${result.authentic ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                      {result.computedHash || 'None'}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#615E56] flex items-start sm:items-center gap-1.5 flex-wrap">
                  <span className="font-semibold">Evaluation:</span>
                  <strong className={result.authentic ? 'text-[#059669]' : 'text-[#DC2626]'}>
                    {result.authentic
                      ? 'Exact Match (Hashes are identical. Zero records modified since official signing).'
                      : 'MISMATCH DETECTED: Ledger records do not match the issued Merkle root seal.'}
                  </strong>
                </div>
              </div>

              {/* Cryptographic Chain Itemization Table */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs text-[#37352F] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 size={16} className="text-[#33396B] shrink-0" />
                  <span>Itemized SignStamp Audit Trail</span>
                </h4>

                <div className="overflow-x-auto rounded-xl border border-[#E5E3DD]">
                  <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                    <thead className="bg-[#FAF9F5] border-b border-[#E5E3DD] text-[#615C52]">
                      <tr>
                        <th className="p-2.5 font-semibold">Tier / Office</th>
                        <th className="p-2.5 font-semibold">Status</th>
                        <th className="p-2.5 font-semibold">Amount</th>
                        <th className="p-2.5 font-semibold">Officer Name & ID</th>
                        <th className="p-2.5 font-semibold">SHA-256 SignStamp Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE6DA]">
                      {(Object.values(result.student.dues) as DueRecord[]).map((due) => (
                        <tr key={due.sectionCode} className="hover:bg-[#FCFAF5]">
                          <td className="p-2.5 font-medium">
                            <span className="text-[10px] font-mono text-[#7A7568] block">
                              Tier {due.tier} • {due.sectionCode}
                            </span>
                            <span>{due.sectionName}</span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                due.status === 'CLEARED'
                                  ? 'bg-[#ECFDF5] text-[#065F46]'
                                  : 'bg-[#FEF2F2] text-[#991B1B]'
                              }`}
                            >
                              {due.status}
                            </span>
                          </td>
                          <td className="p-2.5 font-mono font-bold">
                            ₹{due.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2.5 text-[#55534E]">
                            {due.signStamp ? (
                              <span>
                                {due.signStamp.officerName} ({due.signStamp.officerId})
                              </span>
                            ) : (
                              'Not signed'
                            )}
                          </td>
                          <td className="p-2.5 font-mono text-[10px] text-[#615C52]">
                            {due.signStamp ? (
                              <span title={due.signStamp.signatureHash}>
                                {due.signStamp.signatureHash.slice(0, 16)}...
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
