import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';
import ApplicantDashboard from '@/components/ApplicantDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { toast } from 'sonner';
import { PartyPopper } from 'lucide-react';

export default function Dashboard() {
  const { role, loading } = useAuth();
  const prevRole = useRef<string | null>(null);

  useEffect(() => {
    if (prevRole.current === 'applicant' && role === 'hr') {
      toast.success('Congratulations! You are now an HR Employee with access to view applicant records.', {
        icon: <PartyPopper className="w-5 h-5 text-primary" />,
        duration: 8000,
      });
    }
    prevRole.current = role;
  }, [role]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {role === 'applicant' && <ApplicantDashboard />}
      {(role === 'admin' || role === 'hr') && <AdminDashboard />}
      {!role && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No role assigned. Please contact an administrator.</p>
        </div>
      )}
    </Layout>
  );
}
