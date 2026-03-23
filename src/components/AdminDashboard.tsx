import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, CheckCircle, XCircle, Eye, Trash2, Users, UserPlus, X, Copy } from 'lucide-react';

interface Applicant {
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
  profiles?: {
    full_name: string;
    email?: string;
  };
}

interface TeamMember {
  user_id: string;
  role: string;
  email: string;
  full_name: string;
  created_at?: string;
}

export default function AdminDashboard() {
  const { user, role: currentUserRole } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [comment, setComment] = useState('');
  const [preFeedback, setPreFeedback] = useState('');
  const [policyFeedback, setPolicyFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'archived' | 'team'>('pending');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'hr'>('hr');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [invitePassword, setInvitePassword] = useState('');

  const isAdmin = currentUserRole === 'admin';
  const isHR = currentUserRole === 'hr';

  const pendingApplicants = applicants.filter(a => a.status === 'pending' || a.status === 'revision_required');
  const archivedApplicants = applicants.filter(a => a.status === 'approved' || a.status === 'rejected');
  const displayedApplicants = activeTab === 'pending' ? pendingApplicants : archivedApplicants;

  useEffect(() => {
    if (user && (currentUserRole === 'admin' || currentUserRole === 'hr')) {
      fetchApplicants();
      if (currentUserRole === 'admin') {
        fetchTeamMembers();
      }
    }
  }, [user, currentUserRole]);

  const fetchTeamMembers = async () => {
    try {
      // Fetch user_roles for admin and hr
      const { data: rolesData, error: fetchError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('role', ['admin', 'hr']);

      if (fetchError) {
        console.error('Error fetching team members:', fetchError);
        return;
      }

      // Fetch profiles for all team members
      const userIds = (rolesData || []).map((r: any) => r.user_id);
      let profilesData: any[] = [];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email, full_name')
          .in('user_id', userIds);
        profilesData = profiles || [];
      }

      // Merge role data with profile data
      const formatted = (rolesData || []).map((item: any) => {
        const profile = profilesData.find(p => p.user_id === item.user_id);
        return {
          user_id: item.user_id,
          role: item.role,
          email: profile?.email || 'No email',
          full_name: profile?.full_name || 'Unknown'
        };
      });

      setTeamMembers(formatted);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchApplicants = async () => {
    try {
      // Fetch applicants
      const { data: applicantsData, error: fetchError } = await supabase
        .from('applicants' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching applicants:', fetchError);
        setError(fetchError.message);
        setApplicants([]);
        setLoading(false);
        return;
      }

      // Fetch profiles for all applicant user_ids
      const userIds = (applicantsData || []).map((a: any) => a.user_id);
      let profilesData: any[] = [];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        profilesData = profiles || [];
      }

      // Merge applicant data with profile names
      const merged = (applicantsData || []).map((applicant: any) => {
        const profile = profilesData.find(p => p.user_id === applicant.user_id);
        return {
          ...applicant,
          profiles: {
            full_name: profile?.full_name || null
          }
        };
      });

      setApplicants(merged as Applicant[]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500 hover:bg-yellow-600',
      revision_required: 'bg-orange-500 hover:bg-orange-600',
      approved: 'bg-green-500 hover:bg-green-600',
      rejected: 'bg-red-500 hover:bg-red-600'
    };
    return <Badge className={styles[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>;
  };

  const handleViewPdf = (url: string | null) => {
    if (!url) return;
    window.open(url, '_blank');
  };

  const saveDecision = async (status: string) => {
    if (!selectedApplicant || !user) return;

    setSaving(true);
    try {
      const updateData: any = {
        status,
        admin_comment: comment,
        pre_employment_feedback: preFeedback,
        policy_rules_feedback: policyFeedback
      };

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user.id;
      } else if (status === 'rejected') {
        updateData.rejected_at = new Date().toISOString();
        updateData.rejected_by = user.id;
      }

      const { error: appError } = await supabase
        .from('applicants' as any)
        .update(updateData)
        .eq('id', selectedApplicant.id);

      if (appError) throw appError;

      // NOTE: Approved applicants stay as "applicant" role
      // They can still log in to view their submitted documents

      toast.success(status === 'approved' ? 'Applicant approved!' : status === 'rejected' ? 'Applicant rejected.' : 'Revision request sent to applicant.');

      if (status === 'approved') {
        setSelectedApplicant(null);
        setComment('');
        setPreFeedback('');
        setPolicyFeedback('');
      } else {
        setSelectedApplicant({
          ...selectedApplicant,
          status,
          admin_comment: comment,
          pre_employment_feedback: preFeedback,
          policy_rules_feedback: policyFeedback
        });
      }
      fetchApplicants();
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Failed to update applicant status.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApplicant || !user) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this applicant? This will delete the PDF files and user account.');
    if (!confirmDelete) return;

    setSaving(true);
    try {
      // Invoke the secure admin-delete-user Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: selectedApplicant.user_id }
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      toast.success('Applicant and all associated data deleted successfully!');
      setSelectedApplicant(null);
      fetchApplicants();
    } catch (error: any) {
      console.error('Error deleting:', error);
      toast.error(error.message || 'Failed to delete applicant.');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteTeamMember = async () => {
    if (!inviteEmail || !inviteName) {
      toast.error('Please fill in all fields');
      return;
    }

    setInviting(true);
    try {
      // Generate secure temporary password locally to ensure consistency
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const randomPart = Array.from(array, b => b.toString(36).padStart(2, '0')).join('').slice(0, 12);
      const tempPassword = 'Welc@' + randomPart;

      const { data, error: functionError } = await supabase.functions.invoke('admin-invite-user', {
        body: { 
          email: inviteEmail,
          fullName: inviteName,
          role: inviteRole,
          password: tempPassword
        }
      });

      if (functionError) {
        let errorMessage = functionError.message;
        try {
          const body = await functionError.context?.json();
          if (body?.error) errorMessage = body.error;
        } catch (e) {
          console.error('Error parsing error body:', e);
        }
        throw new Error(errorMessage);
      }
      if (data?.error) throw new Error(data.error);

      toast.success(`Invited ${inviteName} as ${inviteRole === 'admin' ? 'Admin' : 'HR Employee'}!`);
      setInvitePassword(tempPassword);
      setInviteSuccess(true);
      fetchTeamMembers();

      // Clear the form fields but keep the password visible in success state
      setInviteEmail('');
      setInviteName('');
      setInviteRole('hr');
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast.error(error.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteTeamMember = async (member: TeamMember) => {
    if (!isAdmin) return;

    if (member.user_id === user?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (member.role === 'admin') {
      const adminCount = teamMembers.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        toast.error('Cannot delete the last admin');
        return;
      }
    }

    const confirmDelete = window.confirm(`Are you sure you want to remove ${member.full_name}? This will delete their account.`);
    if (!confirmDelete) return;

    try {
      // Invoke the secure admin-delete-user Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId: member.user_id }
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      toast.success(`${member.full_name} removed successfully`);
      fetchTeamMembers();
    } catch (error: any) {
      console.error('Error deleting team member:', error);
      toast.error(error.message || 'Failed to remove team member');
    }
  };

  const openReview = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setComment(applicant.admin_comment || '');
    setPreFeedback(applicant.pre_employment_feedback || '');
    setPolicyFeedback(applicant.policy_rules_feedback || '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          {isAdmin ? 'Admin Dashboard' : 'HR Employee Dashboard'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isAdmin ? 'Review and manage onboarding applications' : 'View and review applicant documents'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg border border-destructive/50 bg-destructive/10 flex items-center gap-3 shadow-sm">
          <XCircle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">Error: {error}</p>
        </div>
      )}

      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'pending'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
            }`}
        >
          Pending ({pendingApplicants.length})
        </button>
        <button
          onClick={() => setActiveTab('archived')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'archived'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
            }`}
        >
          Archived ({archivedApplicants.length})
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'team'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
              }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Team ({teamMembers.length})
          </button>
        )}
      </div>

      {activeTab === 'team' && isAdmin ? (
        <Card className="border-border/50 bg-card shadow-lg">
          <CardHeader className="pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Members ({teamMembers.length})
            </CardTitle>
            <Button onClick={() => setShowInviteModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No team members found.</p>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl"
                  >
                    <div>
                      <p className="font-bold text-foreground">
                        {member.full_name}
                        {member.user_id === user?.id && <span className="text-xs ml-2 text-primary">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={member.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}>
                        {member.role === 'admin' ? 'Admin' : 'HR Employee'}
                      </Badge>
                      {member.user_id !== user?.id && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteTeamMember(member)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-border/50 bg-card shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-heading flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {activeTab === 'pending' ? 'Pending Applications' : 'Archived Applications'} ({displayedApplicants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {displayedApplicants.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No {activeTab === 'pending' ? 'pending' : 'archived'} applications.</p>
              ) : (
                <div className="space-y-3">
                  {displayedApplicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group"
                      onClick={() => openReview(applicant)}
                    >
                      <div>
                        <p className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {applicant.profiles?.full_name || `Applicant (${applicant.user_id.slice(0, 8)})`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted {new Date(applicant.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(applicant.status)}
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-heading">Application Review</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedApplicant ? (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground italic">Select an applicant to begin review</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <p className="font-bold text-lg text-foreground">
                      {selectedApplicant.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {selectedApplicant.id}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Pre-Employment PDF</Label>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-border/50 bg-background hover:bg-muted"
                        onClick={() => handleViewPdf(selectedApplicant.pre_employment_url)}
                        disabled={!selectedApplicant.pre_employment_url}
                      >
                        <Eye className="w-4 h-4 mr-2 text-primary" />
                        Open Document
                      </Button>
                      <Input
                        placeholder="Comment for this file..."
                        value={preFeedback}
                        onChange={(e) => setPreFeedback(e.target.value)}
                        className="text-xs bg-muted/20 border-border/50 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Policy Rules PDF</Label>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-border/50 bg-background hover:bg-muted"
                        onClick={() => handleViewPdf(selectedApplicant.policy_rules_url)}
                        disabled={!selectedApplicant.policy_rules_url}
                      >
                        <Eye className="w-4 h-4 mr-2 text-primary" />
                        Open Document
                      </Button>
                      <Input
                        placeholder="Comment for this file..."
                        value={policyFeedback}
                        onChange={(e) => setPolicyFeedback(e.target.value)}
                        className="text-xs bg-muted/20 border-border/50 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Overall Conclusion</Label>
                    <Textarea
                      placeholder="Enter final summary or next steps for the applicant..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px] bg-muted/20 border-border/50 focus:ring-primary text-sm"
                      disabled={activeTab === 'archived'}
                    />
                  </div>

                  {activeTab !== 'archived' && isAdmin && (
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant="outline"
                        className="bg-red-500 hover:bg-red-600 border-none text-white shadow-lg shadow-red-500/20"
                        onClick={() => saveDecision('rejected')}
                        disabled={saving}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        className="bg-orange-500 hover:bg-orange-600 border-none text-white shadow-lg shadow-orange-500/20"
                        onClick={() => saveDecision('revision_required')}
                        disabled={saving}
                      >
                        <FileText className="w-4 h-4 mr-1.5" />
                        Revision
                      </Button>
                      <Button
                        className="bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                        onClick={() => saveDecision('approved')}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                        Approve
                      </Button>
                    </div>
                  )}

                  {activeTab === 'archived' && selectedApplicant && (
                    <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">
                        {selectedApplicant.status === 'approved' ? 'Approved' : 'Rejected'} on:{' '}
                        {new Date(selectedApplicant.status === 'approved' ? selectedApplicant.approved_at : selectedApplicant.rejected_at).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleDelete}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        Delete Applicant (Files + Account)
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        This will delete PDF files and user account. Record will be kept for 45 days.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {showInviteModal && isAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 scale-100">
            <div className="bg-primary/5 p-6 border-b border-border/50 relative">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-heading font-bold flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Invite Team Member
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Add a new administrator or HR employee</p>
            </div>
            
            <div className="p-6 space-y-5">
              {inviteSuccess ? (
                <div className="py-8 text-center space-y-4 animate-in zoom-in-90 duration-500">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold">Invitation Sent!</h4>
                  <p className="text-muted-foreground text-sm">
                    Account created for <strong>{inviteName}</strong>.
                  </p>
                  
                  <div className="bg-muted/50 p-4 rounded-xl space-y-2 border border-border/50">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Temporary Password</p>
                    <div className="flex items-center justify-between gap-2 bg-background p-2 rounded border border-border/50">
                      <code className="text-primary font-mono font-bold text-lg">{invitePassword}</code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          navigator.clipboard.writeText(invitePassword);
                          toast.success('Password copied!');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      Copy and send this to the new member. They should change it via "Forgot Password" after logging in.
                    </p>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteSuccess(false);
                      setInvitePassword('');
                    }}
                  >
                    Okay, Done
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Jane Doe"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      className="bg-muted/30 border-border/50 focus:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-muted/30 border-border/50 focus:ring-primary h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-semibold">Role</Label>
                    <select
                      id="role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'admin'|'hr')}
                      className="w-full h-11 bg-muted/30 border border-border/50 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="admin">Admin (Full Access)</option>
                      <option value="hr">HR Employee (Reviewer Access)</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 border-border/50 h-11"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleInviteTeamMember}
                      disabled={inviting || !inviteEmail || !inviteName}
                      className="flex-1 h-11 shadow-lg shadow-primary/20"
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Inviting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Send Invite
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-[10px] text-muted-foreground text-center italic mt-2">
                    Note: A temporary password will be generated automatically.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
