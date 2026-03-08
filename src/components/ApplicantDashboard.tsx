import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  Loader2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  Eye,
  ExternalLink,
  Edit2,
  Save
} from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface ApplicantRecord {
  id: string;
  user_id: string;
  pre_employment_url: string | null;
  policy_rules_url: string | null;
  created_at: string;
  status: string;
  admin_comment: string | null;
  pre_employment_feedback: string | null;
  policy_rules_feedback: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
}

const PRE_EMPLOYMENT_TEMPLATE = 'https://drive.google.com/uc?export=download&id=1GHeJTZPXcIdZkMg8X0DaV9O4adqA-H5c';
const POLICY_TEMPLATE = 'https://drive.google.com/uc?export=download&id=1moSDwjV9A4UJngeGBJGTfQbFmiMlgXMl';

const getSejdaUrl = (fileUrl: string) => {
  return `https://www.sejda.com/sign-pdf?files=[${JSON.stringify({ downloadUrl: fileUrl })}]`;
};

const handleViewPdf = (url: string | null) => {
  if (url) window.open(url, '_blank');
};

export default function ApplicantDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [applicant, setApplicant] = useState<ApplicantRecord | null>(null);
  const [preEmploymentFile, setPreEmploymentFile] = useState<File | null>(null);
  const [policyFile, setPolicyFile] = useState<File | null>(null);
  const [userFullName, setUserFullName] = useState<string>('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (user) {
      fetchApplicantRecord();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.full_name) {
        setUserFullName(data.full_name);
        setEditedName(data.full_name);
      } else {
        setEditedName('');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveName = async () => {
    if (!user || !editedName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editedName.trim() })
        .eq('user_id', user.id);

      if (error) throw error;

      setUserFullName(editedName.trim());
      setIsEditingName(false);
      toast.success('Name updated successfully!');
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name');
    }
  };

  const sanitizeFileName = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  };

  const fetchApplicantRecord = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('applicants' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setApplicant(data as unknown as ApplicantRecord | null);
    } catch (error) {
      console.error('Error fetching applicant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (type: 'pre' | 'policy') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.type !== 'application/pdf') {
          toast.error('Please upload a PDF file');
          return;
        }
        if (type === 'pre') setPreEmploymentFile(file);
        else setPolicyFile(file);
      }
    };
    input.click();
  };

  const handleDrop = (type: 'pre' | 'policy') => (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (type === 'pre') setPreEmploymentFile(file);
      else setPolicyFile(file);
    }
  };

  const uploadFile = async (file: File, fileName: string, useName: boolean = false): Promise<string | null> => {
    if (!user) return null;

    const sanitizedName = useName && userFullName ? `${sanitizeFileName(userFullName)}-${fileName}` : fileName;
    const filePath = `${user.id}/${sanitizedName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('applicant-docs')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: signedUrl } = await supabase.storage
        .from('applicant-docs')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      return signedUrl?.signedUrl || null;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!user || !preEmploymentFile || !policyFile) return;

    setSubmitting(true);
    try {
      const preUrl = await uploadFile(preEmploymentFile, 'pre-employment.pdf', true);
      const policyUrl = await uploadFile(policyFile, 'policy-rules.pdf', true);

      if (!preUrl || !policyUrl) {
        toast.error('Failed to upload files. Please try again.');
        return;
      }

      const { error } = await supabase
        .from('applicants' as any)
        .insert({
          user_id: user.id,
          pre_employment_url: preUrl,
          policy_rules_url: policyUrl,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Application submitted successfully!');
      fetchApplicantRecord();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('An error occurred during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!user || !applicant) return;
    if (!preEmploymentFile && !policyFile) {
      toast.error('Please select at least one file to resubmit.');
      return;
    }

    setSubmitting(true);
    try {
      const updates: Partial<ApplicantRecord> = {
        status: 'pending',
        admin_comment: null
      };

      if (preEmploymentFile) {
        const url = await uploadFile(preEmploymentFile, 'pre-employment.pdf', true);
        if (url) updates.pre_employment_url = url;
      }

      if (policyFile) {
        const url = await uploadFile(policyFile, 'policy-rules.pdf', true);
        if (url) updates.policy_rules_url = url;
      }

      const { error } = await supabase
        .from('applicants' as any)
        .update(updates)
        .eq('id', applicant.id);

      if (error) throw error;

      toast.success('Application resubmitted successfully!');
      setPreEmploymentFile(null);
      setPolicyFile(null);
      fetchApplicantRecord();
    } catch (error) {
      console.error('Resubmit error:', error);
      toast.error('An error occurred during resubmission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasFeedback = applicant?.admin_comment;
  const showResubmit = applicant && (applicant.status === 'revision_required' || applicant.status === 'rejected');
  const isPending = applicant?.status === 'pending';
  const isApproved = applicant?.status === 'approved';

  const canSubmitInitial = !applicant && preEmploymentFile && policyFile;
  const canResubmitNow = showResubmit && (preEmploymentFile || policyFile);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Applicant Dashboard</h2>
          <p className="text-muted-foreground mt-1">Complete your onboarding requirements</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter your full name"
                className="w-48"
              />
              <Button size="sm" onClick={handleSaveName}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => {
              setEditedName(userFullName);
              setIsEditingName(true);
            }}>
              <Edit2 className="w-4 h-4 mr-1" />
              Edit Name
            </Button>
          )}
        </div>
      </div>

      {/* Status Alerts */}
      {isApproved && (
        <div className="p-4 rounded-lg border border-success/50 bg-success/10 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-success" />
          <p className="text-sm font-medium text-success">Your application has been approved!</p>
        </div>
      )}

      {isPending && (
        <div className="p-4 rounded-lg border border-primary/50 bg-primary/10 flex items-center gap-3 shadow-sm">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <p className="text-sm font-medium text-primary">Your documents are pending review.</p>
        </div>
      )}

      {/* Admin Feedback Banner */}
      {hasFeedback && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-destructive/50 bg-destructive/10">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-destructive text-sm font-heading">Admin Feedback</p>
            <p className="text-sm text-muted-foreground mt-1">"{applicant.admin_comment}"</p>
          </div>
        </div>
      )}

      {/* Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pre-Employment Form Card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg leading-none font-heading">Pre-Employment Form</h3>
          </div>

          <div className="space-y-3 mb-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Pre-Employment PDF</Label>
            <Button
              variant="outline"
              className="w-full justify-start border-border/50 bg-background hover:bg-muted"
              onClick={() => handleViewPdf(applicant?.pre_employment_url)}
              disabled={!applicant?.pre_employment_url}
            >
              <Eye className="w-4 h-4 mr-2 text-primary" />
              Open Document
            </Button>

            <a
              href={getSejdaUrl(applicant?.pre_employment_url || PRE_EMPLOYMENT_TEMPLATE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 w-fit"
            >
              <Download className="w-3 h-3" />
              Sign Online: Pre-Employment.pdf
            </a>
          </div>

          <div
            onDrop={handleDrop('pre')}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !isApproved && handleFileSelect('pre')}
            className={`flex-grow border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4 flex flex-col justify-center items-center ${isApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Click or drag PDF to upload</p>
            <button
              disabled={isApproved || submitting}
              className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); handleFileSelect('pre'); }}
            >
              Select PDF
            </button>
          </div>

          {(preEmploymentFile || applicant?.pre_employment_url) ? (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg py-3 px-4 transition-all duration-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                </div>
                <span className="text-sm text-green-400 truncate">
                  {preEmploymentFile ? preEmploymentFile.name : 'pre-employment_signed.pdf'}
                </span>
              </div>
              {!isApproved && !isPending && (
                <button
                  onClick={() => setPreEmploymentFile(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/30 border border-border py-3 px-4 text-center">
              <p className="text-sm text-muted-foreground">No file selected</p>
            </div>
          )}

          {applicant?.pre_employment_feedback && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{applicant.pre_employment_feedback}</p>
            </div>
          )}
        </div>

        {/* Policy Acknowledgement Card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg leading-none font-heading">Policy Acknowledgement Form</h3>
          </div>

          <div className="space-y-3 mb-4">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Policy Rules PDF</Label>
            <Button
              variant="outline"
              className="w-full justify-start border-border/50 bg-background hover:bg-muted"
              onClick={() => handleViewPdf(applicant?.policy_rules_url)}
              disabled={!applicant?.policy_rules_url}
            >
              <Eye className="w-4 h-4 mr-2 text-primary" />
              Open Document
            </Button>

            <a
              href={getSejdaUrl(applicant?.policy_rules_url || POLICY_TEMPLATE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 w-fit"
            >
              <Download className="w-3 h-3" />
              Sign Online: Policy_Acknowledgement.pdf
            </a>
          </div>

          <div
            onDrop={handleDrop('policy')}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !isApproved && handleFileSelect('policy')}
            className={`flex-grow border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors mb-4 flex flex-col justify-center items-center ${isApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Upload className="w-8 h-8 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Click or drag PDF to upload</p>
            <button
              disabled={isApproved || submitting}
              className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
              onClick={(e) => { e.stopPropagation(); handleFileSelect('policy'); }}
            >
              Select PDF
            </button>
          </div>

          {(policyFile || applicant?.policy_rules_url) ? (
            <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg py-3 px-4 transition-all duration-300">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white opacity-80" />
                </div>
                <span className="text-sm text-green-400 truncate">
                  {policyFile ? policyFile.name : 'policy_signed.pdf'}
                </span>
              </div>
              {!isApproved && !isPending && (
                <button
                  onClick={() => setPolicyFile(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors ml-2 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/30 border border-border py-3 px-4 text-center">
              <p className="text-sm text-muted-foreground">No file selected</p>
            </div>
          )}

          {applicant?.policy_rules_feedback && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive flex gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{applicant.policy_rules_feedback}</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Warning */}
      {!isApproved && !isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-amber-500 bg-amber-500/10 py-2 px-4 rounded-full w-fit mx-auto mb-8 border border-amber-500/20">
          <AlertCircle className="w-4 h-4" />
          All required PDFs must be uploaded before submitting.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        {!showResubmit ? (
          !isApproved && (
            <button
              disabled={!canSubmitInitial || submitting || isPending}
              onClick={handleSubmit}
              className="px-10 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 min-w-[220px] justify-center shadow-lg shadow-primary/20"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? 'Application Pending' : 'Submit Application'}
            </button>
          )
        ) : (
          <button
            disabled={!canResubmitNow || submitting}
            onClick={handleResubmit}
            className="px-10 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 min-w-[220px] justify-center shadow-lg shadow-primary/20"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Resubmit Application
          </button>
        )}
      </div>

      <footer className="mt-16 text-center text-xs text-muted-foreground border-t border-border pt-8">
        © 2026 HR Portal System. All onboarding data is securely encrypted.
      </footer>
    </div>
  );
}
