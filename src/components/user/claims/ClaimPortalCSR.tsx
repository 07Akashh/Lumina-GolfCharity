"use client";

import React from "react";
import {
  ShieldCheck,
  Fingerprint,
  Lock,
  AlertCircle,
  FileText,
  ArrowRight,
  Eye,
  EyeOff,
  Star,
  Check,
  Edit2,
  Activity,
  Heart,
  Upload,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { submitKYC } from "@/app/actions/kyc";
import { submitClaim, saveClaimChunk } from "@/app/actions/claim";
import { formatCurrency } from "@/lib/utils";
import { LoadingButton } from "@/components/common/LoadingButton";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Charity, KYCRecord, Claim, Profile } from "@/types";

interface ClaimPortalProps {
  winnerId: string;
  winnerAmount: number;
  kycRecord: KYCRecord | null;
  charities: Charity[];
  prevAccountDetails: {
    bank_name: string;
    account_number: string;
    routing_number: string;
  } | null;
  draftClaim: Claim | null;
  profile: Profile;
}

interface KYCData {
  fullName: string;
  phone: string;
  dob: string;
  idNumber: string;
  id_front_url: string;
  w9_form_url: string;
}

interface BankingData {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  charityId: string;
  contribution: number;
  authorized: boolean;
}

export default function ClaimPortalCSR({
  winnerId,
  winnerAmount,
  kycRecord,
  charities,
  prevAccountDetails,
  draftClaim,
  profile,
}: ClaimPortalProps) {
  const isVerified = kycRecord?.status === "verified";
  const isPending = kycRecord?.status === "pending";
  const isRejected = kycRecord?.status === "rejected";

  const router = useRouter();
  const pathname = usePathname();

  const stepMapping = React.useMemo(
    () => ["/identity", "/documents", "/banking", "/impact", "/review"],
    [],
  );

  const [step, setStep] = React.useState(() => {
    const currentStepIndex = stepMapping.findIndex((m) => pathname.includes(m));
    if (currentStepIndex !== -1) return currentStepIndex + 1;

    if (isVerified) return 3;
    if (isPending || isRejected) return 2;
    return 1;
  });

  // Sync state to URL without full unmount
  React.useEffect(() => {
    const currentStepIndex = stepMapping.findIndex((m) => pathname.includes(m));
    if (currentStepIndex === -1) {
      router.replace(`/claims/${winnerId}${stepMapping[step - 1]}`, {
        scroll: false,
      });
    } else if (currentStepIndex + 1 !== step) {
      setStep(currentStepIndex + 1);
    }
  }, [pathname, step, winnerId, router, stepMapping]);

  const nextStep = () => {
    const next = Math.min(step + 1, 5);
    setStep(next);
    router.push(`/claims/${winnerId}${stepMapping[next - 1]}`, {
      scroll: false,
    });
  };

  const prevStep = () => {
    const prev = Math.max(step - 1, 1);
    setStep(prev);
    router.push(`/claims/${winnerId}${stepMapping[prev - 1]}`, {
      scroll: false,
    });
  };

  const [loading, setLoading] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const [isSsnVisible, setIsSsnVisible] = React.useState(false);

  const [kycData, setKycData] = React.useState<KYCData>({
    fullName: kycRecord?.full_name || profile?.full_name || "",
    phone: kycRecord?.phone || profile?.phone || "",
    dob: kycRecord?.dob || "",
    idNumber: kycRecord?.id_number || "",
    id_front_url: kycRecord?.id_front_url || "",
    w9_form_url: kycRecord?.w9_form_url || "",
  });

  const [bankingData, setBankingData] = React.useState<BankingData>({
    bankName:
      draftClaim?.account_details?.bank_name ||
      prevAccountDetails?.bank_name ||
      "",
    accountNumber:
      draftClaim?.account_details?.account_number ||
      prevAccountDetails?.account_number ||
      "",
    routingNumber:
      draftClaim?.account_details?.routing_number ||
      prevAccountDetails?.routing_number ||
      "",
    charityId: draftClaim?.charity_id || charities[0]?.id || "",
    contribution:
      draftClaim?.contribution_percentage ||
      profile?.contribution_percentage ||
      0,
    authorized: false,
  });

  // Sync state with props when they change (after revalidation)
  React.useEffect(() => {
    setKycData({
      fullName: kycRecord?.full_name || profile?.full_name || "",
      phone: kycRecord?.phone || profile?.phone || "",
      dob: kycRecord?.dob || "",
      idNumber: kycRecord?.id_number || "",
      id_front_url: kycRecord?.id_front_url || "",
      w9_form_url: kycRecord?.w9_form_url || "",
    });
    setBankingData((prev) => ({
      ...prev,
      bankName:
        draftClaim?.account_details?.bank_name ||
        prevAccountDetails?.bank_name ||
        "",
      accountNumber:
        draftClaim?.account_details?.account_number ||
        prevAccountDetails?.account_number ||
        "",
      routingNumber:
        draftClaim?.account_details?.routing_number ||
        prevAccountDetails?.routing_number ||
        "",
      charityId: draftClaim?.charity_id || charities[0]?.id || "",
      contribution:
        draftClaim?.contribution_percentage ||
        profile?.contribution_percentage ||
        0,
    }));
  }, [kycRecord, profile, draftClaim, prevAccountDetails, charities]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "id_front" | "w9_form",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication required");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${field}_${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage
        .from("kyc-documents")
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from("kyc-documents").getPublicUrl(fileName);

      setKycData((prev) => ({
        ...prev,
        [field === "id_front" ? "id_front_url" : "w9_form_url"]: publicUrl,
      }));
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleIdentityChunk = async () => {
    if (isVerified) return nextStep();

    if (
      !kycData.fullName ||
      !kycData.dob ||
      !kycData.idNumber ||
      !kycData.phone
    ) {
      return alert(
        "Please complete all personal record fields before continuing.",
      );
    }

    setLoading(true);
    try {
      await submitKYC({
        fullName: kycData.fullName,
        phone: kycData.phone,
        dob: kycData.dob,
        id_number: kycData.idNumber,
        address: "Secured Profile Data",
        id_front_url: kycData.id_front_url,
        w9_form_url: kycData.w9_form_url,
      });
      nextStep();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBankingChunk = async () => {
    if (!bankingData.routingNumber || !bankingData.accountNumber)
      return alert("Please complete your banking details.");
    if (!bankingData.authorized) return alert("Please authorize ACH transfer.");

    setLoading(true);
    try {
      await saveClaimChunk(winnerId, {
        banking: {
          bankName: bankingData.bankName,
          accountNumber: bankingData.accountNumber,
          routingNumber: bankingData.routingNumber,
          amount: winnerAmount,
        },
      });
      nextStep();
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImpactChunk = async () => {
    setLoading(true);
    try {
      await saveClaimChunk(winnerId, {
        impact: {
          charityId: bankingData.charityId,
          contribution: bankingData.contribution,
        },
      });
      nextStep();
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKYCSubmit = async () => {
    setLoading(true);
    try {
      await submitKYC({
        fullName: kycData.fullName,
        phone: kycData.phone,
        dob: kycData.dob,
        id_number: kycData.idNumber,
        address: "Secured Profile Data",
        id_front_url: kycData.id_front_url,
        w9_form_url: kycData.w9_form_url,
      });
      nextStep();
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSubmit = async () => {
    setLoading(true);
    try {
      await submitClaim(winnerId, {
        amount: winnerAmount,
        bankName: bankingData.bankName,
        accountNumber: bankingData.accountNumber,
        routingNumber: bankingData.routingNumber,
        charityId: bankingData.charityId,
        contribution: bankingData.contribution,
      });
      router.push("/user/portfolio");
      router.refresh();
    } catch (err) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {step === 1 && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-[#c81e51] font-black tracking-widest uppercase mb-2 block">
                    Step 1 of 5
                  </span>
                  <h1 className="text-[44px] text-[#0f172a] font-serif font-bold tracking-tight">
                    Identity Verification
                  </h1>
                </div>
                <div className="bg-[#a7f3d0] text-[#065f46] px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold tracking-wider">
                  <ShieldCheck size={16} /> BANK-GRADE SECURITY ACTIVE
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#f8fafc] rounded-2xl p-10 border border-[#f1f5f9] relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c81e51] to-transparent" />
                    <h3 className="text-xl font-medium text-[#0f172a] mb-8 flex items-center gap-3">
                      <Fingerprint className="text-[#c81e51]" size={24} />{" "}
                      Personal Records
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                      <InputF
                        label="FULL LEGAL NAME"
                        value={kycData.fullName}
                        onChange={(v: string) =>
                          setKycData({ ...kycData, fullName: v })
                        }
                        disabled={isVerified}
                      />
                      <InputF
                        label="DATE OF BIRTH"
                        type="date"
                        value={kycData.dob}
                        onChange={(v: string) =>
                          setKycData({ ...kycData, dob: v })
                        }
                        disabled={isVerified}
                      />
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">
                          GOV ID NUMBER
                        </label>
                        <div className="relative">
                          <input
                            type={isSsnVisible ? "text" : "password"}
                            value={kycData.idNumber}
                            onChange={(e) =>
                              setKycData({
                                ...kycData,
                                idNumber: e.target.value,
                              })
                            }
                            disabled={isVerified}
                            className="w-full bg-transparent border-b border-[#cbd5e1] py-2 text-lg text-[#0f172a] outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setIsSsnVisible(!isSsnVisible)}
                            className="absolute right-0 top-3 text-[#94a3b8] hover:text-[#0f172a] transition-colors"
                          >
                            {isSsnVisible ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <InputF
                        label="PHONE"
                        value={kycData.phone}
                        onChange={(v: string) =>
                          setKycData({ ...kycData, phone: v })
                        }
                        disabled={isVerified}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InfoB
                      icon={AlertCircle}
                      title="HOW IT WORKS"
                      text="Your identity is matched against our secure registry. This is the first step to ensuring funds reach the correct recipient."
                    />
                    <InfoB
                      icon={ShieldCheck}
                      title="ADMIN ROLE"
                      text="After submission, an Admin will cross-reference these details with your subscription record and global compliance databases."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] shadow-xl shadow-[#0a1628]/10 rounded-2xl h-[260px] relative overflow-hidden flex items-end p-8">
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#c81e51]/20 blur-[50px] rounded-full" />
                    <p className="text-white font-serif italic text-2xl relative z-10 leading-snug tracking-tight">
                      &quot;Preserving the integrity of every contribution.&quot;
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-[#e2e8f0] shadow-sm space-y-4">
                    <p className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">
                      Action Required
                    </p>
                    <LoadingButton
                      loading={loading}
                      onClick={handleIdentityChunk}
                      className="w-full bg-[#c81e51] text-white py-4 rounded-xl font-bold text-[13px] flex items-center justify-between px-6 hover:bg-[#be184d] transition-all"
                    >
                      Proceed to Documents <ArrowRight size={18} />
                    </LoadingButton>
                  </div>
                  <div className="space-y-3 px-2">
                    <SecTag text="AES-256 Bit Encryption" />
                    <SecTag text="SOC2 / GDPR Compliant Infrastructure" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-1 bg-[#c81e51]" />
                    <div className="w-12 h-1 bg-[#e2e8f0]" />
                    <span className="text-[10px] text-[#c81e51] font-black tracking-widest uppercase">
                      STEP 2 OF 5
                    </span>
                  </div>
                  <h1 className="text-[44px] text-[#0f172a] font-serif font-bold tracking-tight">
                    Document Submission
                  </h1>
                  <p className="text-[#64748b] mt-2">
                    Verification is the cornerstone of our impact ecosystem.
                    Please provide the required documentation to facilitate
                    secure and compliant distributions.
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <UploadSlot
                      label="Identity Document (Front)"
                      description="Passport, Driver's License or National ID"
                      url={kycData.id_front_url}
                      onUpload={(e) => handleFileUpload(e, "id_front")}
                      isUploading={isUploading}
                      isVerified={isVerified}
                    />
                    <UploadSlot
                      label="W-9 Tax Form"
                      description="Signed IRS Form W-9 for compliance"
                      url={kycData.w9_form_url}
                      onUpload={(e) => handleFileUpload(e, "w9_form")}
                      isUploading={isUploading}
                      isVerified={isVerified}
                    />
                  </div>
                  <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#064e3b] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0f172a] mb-1">
                        Encrypted Data Vault
                      </h4>
                      <p className="text-[#64748b] text-[12px] leading-relaxed">
                        Your documents are processed through our secure
                        biometric pipeline and stored in an AES-256 encrypted
                        vault. Only authorized compliance officers can access
                        these records.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#f8fafc] rounded-2xl p-6 border border-[#f1f5f9]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#ede9fe] text-[#8b5cf6] flex items-center justify-center text-[10px] font-bold">
                        i
                      </div>
                      <h4 className="font-bold text-[#0f172a]">How it Works</h4>
                    </div>
                    <p className="text-[13px] text-[#64748b] leading-relaxed">
                      Upload high-resolution scans. We require a W-9 for
                      tax-efficient prize distribution as per federal
                      guidelines. This ensures your contributions remain
                      compliant with current financial regulations.
                    </p>
                  </div>
                  <div className="bg-[#064e3b] rounded-2xl p-8 text-white relative overflow-hidden">
                    <Check
                      size={120}
                      className="absolute -right-4 -bottom-4 text-[#047857] opacity-60"
                    />
                    <div className="flex items-center gap-3 mb-4 relative z-10">
                      <ShieldCheck size={20} />
                      <h4 className="font-bold text-lg">Admin Role</h4>
                    </div>
                    <p className="text-[13px] text-[#d1fae5] leading-relaxed relative z-10">
                      Admins manually verify the validity of your ID and the
                      accuracy of your tax form to ensure legal compliance for
                      the disbursement. This human-in-the-loop process
                      guarantees the highest level of fiduciary oversight.
                    </p>
                  </div>

                  {isVerified || isPending ? (
                    <button
                      onClick={nextStep}
                      className="w-full bg-[#c81e51] text-white py-4 rounded-full font-bold text-[13px] flex items-center justify-center gap-3 hover:bg-[#be184d] transition-all"
                    >
                      Continue to Banking <ArrowRight size={18} />
                    </button>
                  ) : (
                    <LoadingButton
                      loading={loading}
                      disabled={!kycData.id_front_url || !kycData.w9_form_url}
                      onClick={handleKYCSubmit}
                      className="w-full py-4 rounded-full font-bold text-[13px] flex items-center gap-3 text-white shadow-lg bg-[#c81e51]"
                    >
                      Submit for Review <Check size={18} />
                    </LoadingButton>
                  )}
                  <p className="text-center text-[9px] font-bold text-[#94a3b8] tracking-widest uppercase">
                    ENCRYPTED END-TO-END
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-[44px] text-[#0f172a] font-serif font-bold tracking-tight">
                    Distribution Details
                  </h1>
                  <p className="text-[#64748b] mt-2">
                    Enter your preferred financial institution details to
                    facilitate the secure transfer of your philanthropic claim.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#0f172a] font-black tracking-widest uppercase mb-1 block">
                    STEP 3 OF 5
                  </span>
                  <div className="w-24 h-1 bg-[#e2e8f0] flex">
                    <div className="w-16 h-full bg-[#c81e51]" />
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#f8fafc] rounded-2xl p-10 border border-[#f1f5f9]">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <h3 className="text-2xl font-serif text-[#0f172a]">
                        Transfer Credentials
                      </h3>
                    </div>
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <InputF
                          label="ACCOUNT HOLDER NAME"
                          value={kycData.fullName || profile?.full_name || ""}
                          onChange={() => {}}
                          placeholder="Legal name as verified in Step 1"
                          disabled
                        />
                        <InputF
                          label="BANK NAME"
                          value={bankingData.bankName}
                          onChange={(v: string) =>
                            setBankingData({ ...bankingData, bankName: v })
                          }
                          placeholder="Financial Institution Name"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-8">
                        <InputF
                          label="ROUTING NUMBER"
                          value={bankingData.routingNumber}
                          onChange={(v: string) =>
                            setBankingData({ ...bankingData, routingNumber: v })
                          }
                          placeholder="9-digit ABA code"
                        />
                        <InputF
                          label="ACCOUNT NUMBER"
                          value={bankingData.accountNumber}
                          onChange={(v: string) =>
                            setBankingData({ ...bankingData, accountNumber: v })
                          }
                          placeholder="Checking or Savings account"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-4">
                        <input
                          type="checkbox"
                          checked={bankingData.authorized}
                          onChange={(e) =>
                            setBankingData({
                              ...bankingData,
                              authorized: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-[#cbd5e1] text-[#c81e51] focus:ring-[#c81e51]"
                        />
                        <span className="text-[#334155] text-[13px]">
                          Authorize ACH transfer for the total sum specified.
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[#064e3b] rounded-2xl p-8 text-white">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield size={18} />
                        <h4 className="font-bold">Security Vault</h4>
                      </div>
                      <p className="text-[12px] text-[#047857] text-[#d1fae5] leading-relaxed">
                        Your financial data is encrypted using AES-256
                        military-grade protocols and stored in a detached
                        hardware security module (HSM).
                      </p>
                    </div>
                    <div className="bg-[#e2e8f0] rounded-2xl p-8 text-[#0f172a]">
                      <div className="flex items-center gap-3 mb-3 text-[#1e293b]">
                        <ShieldCheck size={18} />
                        <h4 className="font-bold">Fraud Protection</h4>
                      </div>
                      <p className="text-[12px] text-[#475569] leading-relaxed">
                        Transactions are monitored by our 24/7 AI-driven fraud
                        detection engine to ensure every dollar reaches its
                        intended destination.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#0a0f44] rounded-2xl p-8 text-white space-y-6">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-[#94a3b8]">
                      TOTAL PAYOUT SUMMARY
                    </p>
                    <h2 className="text-[40px] font-serif tracking-tight leading-none">
                      {formatCurrency(
                        winnerAmount * (1 - bankingData.contribution / 100),
                      )}
                    </h2>
                    <div className="flex items-center gap-2 text-[#94a3b8] text-[11px]">
                      <Check className="text-[#10b981]" size={14} /> Verified
                      Distribution Asset
                    </div>
                    <div className="space-y-3 pt-6 border-t border-white/10">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#94a3b8]">Gross Prize</span>
                        <span>{formatCurrency(winnerAmount)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#94a3b8]">
                          Withholding ({bankingData.contribution}%)
                        </span>
                        <span>
                          -
                          {formatCurrency(
                            winnerAmount * (bankingData.contribution / 100),
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-[13px] font-bold pt-2 border-t border-white/10">
                        <span>Net Distribution</span>
                        <span>
                          {formatCurrency(
                            winnerAmount * (1 - bankingData.contribution / 100),
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-tr from-[#0a1628] to-black rounded-2xl h-[160px] relative overflow-hidden flex flex-col justify-end p-6 shadow-lg shadow-[#0a1628]/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#c81e51]/20 blur-[40px] rounded-full" />
                    <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                      <p className="text-[9px] font-bold text-[#f8fafc] tracking-widest uppercase mb-1 flex items-center gap-2">
                        <Lock size={10} /> GLOBAL NETWORK
                      </p>
                      <p className="text-[11px] text-[#cbd5e1] leading-tight">
                        Funds are typically available within 2-3 business days
                        after final identity verification.
                      </p>
                    </div>
                  </div>

                  <LoadingButton
                    loading={loading}
                    onClick={handleBankingChunk}
                    className="w-full bg-[#c81e51] text-white py-4 rounded-full font-bold text-[13px] mt-4 hover:bg-[#be184d] transition-all"
                  >
                    CONFIRM & PROCEED <ArrowRight size={18} />
                  </LoadingButton>
                  <div className="bg-white border border-[#e2e8f0] py-3 rounded-full flex items-center justify-center gap-2 text-[9px] font-bold tracking-widest uppercase text-[#0f172a] shadow-sm">
                    <Lock className="text-[#10b981]" size={12} /> SSL 256-BIT
                    ENCRYPTED SESSION
                  </div>
                  <button
                    onClick={prevStep}
                    className="w-full text-center text-[10px] font-bold tracking-widest uppercase text-[#64748b] hover:text-[#0f172a] pt-2"
                  >
                    RETURN TO VERIFICATION
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="bg-[#e0e7ff] text-[#4338ca] text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                      STEP 4 OF 5
                    </span>
                    <span className="text-[10px] text-[#94a3b8] font-bold tracking-widest uppercase">
                      PHILANTHROPIC ALLOCATION
                    </span>
                  </div>
                  <h1 className="text-[44px] text-[#0f172a] font-serif font-bold tracking-tight text-[#1e1b4b]">
                    Choose Your Legacy.
                  </h1>
                  <p className="text-[#475569] mt-2 max-w-2xl">
                    Select a verified global cause for your contribution. Your
                    impact will be formalized and certified in your personal
                    name upon the completion of the transfer.
                  </p>
                </div>
                <div className="bg-[#064e3b] text-white rounded-xl p-6 w-[240px]">
                  <p className="text-[9px] font-bold text-[#34d399] tracking-widest uppercase mb-1">
                    IMPACT SPOTLIGHT
                  </p>
                  <p className="text-xl font-serif">Lumina Scholars</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    {charities.map((ch: Charity) => {
                      const isSelected = bankingData.charityId === ch.id;
                      return (
                        <div
                          key={ch.id}
                          onClick={() =>
                            setBankingData({ ...bankingData, charityId: ch.id })
                          }
                          className={`p-8 rounded-3xl border-2 cursor-pointer transition-all relative ${isSelected ? "border-[#c81e51] shadow-lg shadow-[#c81e51]/10 bg-white" : "border-[#f1f5f9] bg-[#f8fafc] hover:border-[#e2e8f0]"}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-[#e2e8f0] text-[#64748b] shadow-sm mb-6">
                            <Heart size={18} />
                          </div>
                          <h4 className="text-lg font-serif font-bold text-[#0f172a] mb-3">
                            {ch.name}
                          </h4>
                          <p className="text-[#475569] text-[13px] leading-relaxed mb-6">
                            {ch.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <Check className="text-[#10b981]" size={14} />
                            <span className="text-[9px] font-bold text-[#10b981] tracking-widest uppercase">
                              VERIFIED IMPACT
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute right-6 top-6 w-6 h-6 bg-[#c81e51] rounded-full flex items-center justify-center text-white">
                              <Check size={12} />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute -bottom-3 right-8 bg-[#c81e51] text-white px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase">
                              CURRENT SELECTION
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-5 h-5 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-[10px] font-bold">
                          i
                        </div>
                        <h4 className="font-bold text-[#0f172a] text-sm uppercase tracking-widest text-[11px]">
                          HOW IT WORKS
                        </h4>
                      </div>
                      <p className="text-[13px] text-[#475569]">
                        Choose where {bankingData.contribution}% of your win
                        will be directed. This legacy contribution is formalized
                        in your name.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-5 h-5 rounded-full bg-[#1e1b4b] text-white flex items-center justify-center text-[10px] font-bold">
                          <ShieldCheck size={10} />
                        </div>
                        <h4 className="font-bold text-[#0f172a] text-sm uppercase tracking-widest text-[11px]">
                          ADMIN ROLE
                        </h4>
                      </div>
                      <p className="text-[13px] text-[#475569]">
                        The Admin team handles the direct grant transfer to your
                        chosen charity and generates your Tax Impact
                        Certificate.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 bg-[#f8fafc] p-8 rounded-3xl border border-[#f1f5f9]">
                  <div className="flex items-center gap-2 text-[#4338ca] text-[11px] font-bold tracking-widest uppercase mb-4">
                    <Activity size={14} /> PROJECTED LEGACY
                  </div>
                  <div className="mb-8">
                    <p className="text-[11px] text-[#64748b] tracking-widest uppercase mb-1">
                      SOCIAL REACH
                    </p>
                    <p className="text-[44px] font-serif text-[#1e1b4b] leading-none inline-block">
                      1,240{" "}
                      <span className="text-xl font-normal italic text-[#64748b]">
                        Students / Year
                      </span>
                    </p>
                  </div>
                  <div className="w-full h-1 bg-[#c81e51] rounded-full mb-8" />

                  <div className="space-y-4 text-[13px]">
                    <div className="flex justify-between border-b border-[#e2e8f0] pb-4">
                      <span className="text-[#64748b]">Total Win Position</span>
                      <span className="font-bold text-[#0f172a]">
                        {formatCurrency(winnerAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#e2e8f0] pb-4">
                      <span className="text-[#64748b]">
                        Philanthropic Allocation ({bankingData.contribution}%)
                      </span>
                      <span className="font-bold text-[#c81e51]">
                        {formatCurrency(
                          winnerAmount * (bankingData.contribution / 100),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#e2e8f0] pb-4 bg-[#f1f5f9] -mx-8 px-8 py-4">
                      <span className="text-[#0f172a] font-bold">
                        Projected Net Payout
                      </span>
                      <span className="font-bold text-[#10b981] text-lg">
                        {formatCurrency(
                          winnerAmount * (1 - bankingData.contribution / 100),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-[#64748b]">Tax Offset Status</span>
                      <span className="bg-[#a7f3d0] text-[#065f46] text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                        ELIGIBLE
                      </span>
                    </div>
                    <div className="flex justify-between pb-4">
                      <span className="text-[#64748b]">Formalization</span>
                      <span className="font-serif italic text-[#0f172a]">
                        Lifetime Perpetual
                      </span>
                    </div>
                  </div>
                  <LoadingButton
                    loading={loading}
                    onClick={handleImpactChunk}
                    className="w-full bg-[#c81e51] text-white py-4 rounded-full font-bold text-[13px] mt-4 hover:bg-[#be184d] transition-all"
                  >
                    CONTINUE TO FINAL REVIEW
                  </LoadingButton>
                  <p className="text-center text-[9px] text-[#94a3b8] tracking-widest uppercase leading-loose mt-4">
                    FINAL STEP INVOLVES DIGITAL
                    <br />
                    NOTARIZATION & SIGNATURE VERIFICATION
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-[#c81e51] font-black tracking-widest uppercase mb-2 block">
                    STEP 5 OF 5
                  </span>
                  <h1 className="text-[44px] text-[#0f172a] font-serif font-bold tracking-tight">
                    Final Review & Confirmation
                  </h1>
                  <p className="text-[#64748b] mt-2">
                    Please ensure all details are accurate before submitting
                    your legacy transfer request. This action is the final step
                    in the digital verification process.
                  </p>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-[#c81e51] flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#0f172a]">100%</span>
                  <span className="text-[8px] font-bold tracking-widest uppercase text-[#94a3b8] mt-1">
                    CLAIM READY
                  </span>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <ReviewCard
                      icon={Star}
                      title="Identity Profile"
                      onEdit={() => {
                        setStep(1);
                        router.push(`/claims/${winnerId}/identity`);
                      }}
                      rows={[
                        {
                          label: "Full Name",
                          value: kycData.fullName || profile?.full_name,
                        },
                        {
                          label: "ID Status",
                          value: (
                            <span className="bg-[#064e3b] text-white text-[10px] px-2 py-0.5 rounded">
                              Verified
                            </span>
                          ),
                        },
                        {
                          label: "Phone",
                          value: kycData.phone || profile?.phone,
                        },
                      ]}
                    />
                    <ReviewCard
                      icon={Activity}
                      title="Banking Details"
                      onEdit={() => {
                        setStep(3);
                        router.push(`/claims/${winnerId}/banking`);
                      }}
                      rows={[
                        { label: "Institution", value: bankingData.bankName },
                        {
                          label: "Account",
                          value: `•••• ${bankingData.accountNumber.slice(-4) || "XXXX"}`,
                        },
                      ]}
                    />
                    <ReviewCard
                      icon={FileText}
                      title="Documentation & Compliance"
                      onEdit={() => {
                        setStep(2);
                        router.push(`/claims/${winnerId}/documents`);
                      }}
                      rows={[
                        { label: "Tax Forms", value: "W-9 (Validated)" },
                        { label: "Compliance", value: "AML-L3 Clearance" },
                        { label: "Attachments", value: "2 PDF Files" },
                      ]}
                    />
                    <div className="bg-[#064e3b] rounded-3xl p-8 text-white relative flex flex-col justify-between">
                      <button
                        onClick={() => {
                          setStep(4);
                          router.push(`/claims/${winnerId}/impact`);
                        }}
                        className="absolute top-6 right-6 text-white/50 hover:text-white"
                      >
                        <Edit2 size={16} />
                      </button>
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                        <Star size={18} />
                      </div>
                      <div>
                        <h4 className="text-lg font-serif mb-1">
                          Impact Selection
                        </h4>
                        <p className="text-[#34d399] text-[12px] mb-4">
                          {charities.find((c) => c.id === bankingData.charityId)
                            ?.name || "Charity"}
                        </p>
                        <div className="space-y-2 pt-4 border-t border-white/10">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white/60 uppercase tracking-widest">
                              Total Win
                            </span>
                            <span>{formatCurrency(winnerAmount)}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-white/60 uppercase tracking-widest">
                              Contribution ({bankingData.contribution}%)
                            </span>
                            <span className="text-[#34d399]">
                              {formatCurrency(
                                winnerAmount * (bankingData.contribution / 100),
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
                            <span className="uppercase text-[10px] tracking-tighter self-center">
                              Net Payout
                            </span>
                            <span>
                              {formatCurrency(
                                winnerAmount *
                                  (1 - bankingData.contribution / 100),
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#f1f5f9] rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white flex shrink-0 items-center justify-center">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0f172a] mb-2">
                        Admin Role
                      </h4>
                      <p className="text-[#475569] text-[13px] leading-relaxed mb-4">
                        An Admin Lead will give the final sign-off. You will
                        receive an email confirmation once the transfer is
                        initiated. Processing typically takes 24-48 business
                        hours from the time of submission.
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-[10px]">
                          A
                        </div>
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#0f172a]">
                          ASSIGNED: LUMINA COMPLIANCE ADMIN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-[#f1f5f9] shadow-lg shadow-[#0f172a]/5 p-8 rounded-3xl space-y-6">
                    <h4 className="font-serif font-bold text-xl text-[#0f172a] mb-6">
                      Admin Checklist
                    </h4>
                    <div className="space-y-4">
                      <CheckRow
                        text="ID Verification complete"
                        checked={!!kycData.id_front_url}
                      />
                      <CheckRow
                        text="Tax Forms validated"
                        checked={!!kycData.w9_form_url}
                      />
                      <CheckRow
                        text="Banking connectivity verified"
                        checked={!!bankingData.accountNumber}
                      />
                      <CheckRow
                        text="Impact Grant scheduled"
                        checked={!!bankingData.charityId}
                      />
                    </div>
                    <div className="bg-[#f8fafc] p-4 rounded-xl flex gap-3 items-start mt-6">
                      <div className="w-4 h-4 rounded-full bg-[#cbd5e1] text-white flex items-center justify-center shrink-0 text-[10px]">
                        i
                      </div>
                      <p className="text-[11px] text-[#64748b]">
                        This is the final step. Once you submit, your claim
                        enters the Final Admin Review queue.
                      </p>
                    </div>
                  </div>

                  <LoadingButton
                    loading={loading}
                    onClick={handleClaimSubmit}
                    className="w-full bg-[#c81e51] text-white py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 hover:bg-[#be184d] transition-all shadow-xl shadow-[#c81e51]/20"
                  >
                    Submit Final Claim <ArrowRight size={18} />
                  </LoadingButton>
                  <button className="w-full text-center text-[#64748b] text-[12px] hover:text-[#0f172a]">
                    Save for Later
                  </button>

                  <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b] rounded-2xl p-6 h-[180px] relative overflow-hidden flex flex-col justify-end text-center mt-6 shadow-xl shadow-[#0f172a]/20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#c81e51]/20 blur-[40px] rounded-full pointer-events-none" />
                    <div className="relative z-10 space-y-2">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-[#94a3b8] flex items-center justify-center gap-2">
                        <Lock size={12} /> SECURITY PROTOCOL
                      </p>
                      <p className="text-white font-serif text-lg tracking-tight">
                        End-to-End Encryption
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function InputF({
  label,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-[#64748b] tracking-widest uppercase">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full bg-transparent border-b border-[#cbd5e1] py-2 text-lg text-[#0f172a] outline-none ${disabled ? "opacity-60" : "focus:border-[#c81e51]"}`}
        placeholder={placeholder}
      />
    </div>
  );
}

function InfoB({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="bg-[#f8fafc] rounded-2xl p-6 border border-[#f1f5f9]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#c81e51] text-white flex items-center justify-center">
          <Icon size={12} />
        </div>
        <h4 className="text-[11px] font-bold text-[#0f172a] uppercase tracking-widest">
          {title}
        </h4>
      </div>
      <p className="text-[12px] text-[#64748b] leading-relaxed">{text}</p>
    </div>
  );
}

function SecTag({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-[#10b981] text-[11px] font-bold">
      <ShieldCheck size={16} /> <span className="text-[#64748b]">{text}</span>
    </div>
  );
}

function UploadSlot({
  label,
  description,
  url,
  onUpload,
  isUploading,
  isVerified,
}: {
  label: string;
  description: string;
  url: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  isVerified: boolean;
}) {
  return (
    <div className="border-2 border-dashed border-[#e2e8f0] rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-[#f8fafc] hover:bg-white transition-all group relative min-h-[220px]">
      <input
        type="file"
        disabled={isVerified || !!url}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        accept="image/*,.pdf"
        onChange={onUpload}
      />
      {url ? (
        <div className="space-y-4">
          <div className="w-12 h-12 bg-[#d1fae5] text-[#059669] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <p className="text-[13px] font-bold text-[#0f172a]">{label} Saved</p>
          <p className="text-[10px] text-[#059669] font-black uppercase tracking-widest">
            Securely Encrypted
          </p>
        </div>
      ) : (
        <>
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-[#e2e8f0] text-[#c81e51] mb-5 group-hover:scale-110 transition-transform">
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-[#c81e51] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload size={20} />
            )}
          </div>
          <h4 className="text-[13px] font-bold text-[#0f172a] mb-1">{label}</h4>
          <p className="text-[11px] text-[#64748b] mb-4">{description}</p>
          <span className="text-[9px] font-black uppercase text-[#94a3b8] tracking-widest">
            Click to Browse
          </span>
        </>
      )}
    </div>
  );
}

function ReviewCard({ 
  icon: Icon, 
  title, 
  rows, 
  onEdit 
}: { 
  icon: React.ElementType; 
  title: string; 
  rows: { label: string; value: React.ReactNode }[]; 
  onEdit: () => void 
}) {
  return (
    <div className="bg-[#f8fafc] rounded-3xl p-8 border border-[#f1f5f9] relative">
      <button
        onClick={onEdit}
        className="absolute top-6 right-6 text-[#94a3b8] hover:text-[#c81e51]"
      >
        <Edit2 size={16} />
      </button>
      <div className="w-10 h-10 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748b] mb-6 shadow-sm">
        <Icon size={20} />
      </div>
      <h4 className="text-lg font-serif mb-6 text-[#0f172a]">{title}</h4>
      <div className="space-y-4">
        {rows.map((r: { label: string; value: React.ReactNode }, i: number) => (
          <div
            key={i}
            className="flex justify-between items-center text-[12px]"
          >
            <span className="text-[#64748b]">{r.label}</span>
            <span className="font-bold text-[#0f172a]">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckRow({ text, checked }: { text: string; checked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded flex items-center justify-center ${checked ? "bg-[#064e3b] text-white" : "border border-[#cbd5e1] text-transparent"}`}
      >
        <Check size={12} />
      </div>
      <span className="text-[13px] text-[#0f172a]">{text}</span>
    </div>
  );
}
