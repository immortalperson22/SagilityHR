import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, CheckCircle, FileText, User, CreditCard, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function EmployeeDashboard() {
  const { profile } = useAuth();

  const features = [
    {
      title: 'Company Policies',
      description: 'View internal guidelines and handbooks.',
      icon: ShieldCheck,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      title: 'My Profile',
      description: 'Manage your personal and work information.',
      icon: User,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      title: 'Payroll & Benefits',
      description: 'Access tax forms and insurance documents.',
      icon: CreditCard,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      title: 'Knowledge Base',
      description: 'Learn how we work and find help.',
      icon: FileText,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-heading font-bold text-foreground">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Employee'}!
        </h2>
        <p className="text-muted-foreground mt-2">Your employment records are synchronized and up to date.</p>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <CheckCircle className="w-5 h-5" />
              Employment Status
            </CardTitle>
            <CardDescription>Your current standing in the HR Portal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-background/50 rounded-xl border border-primary/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg text-foreground">Active Member</p>
                <p className="text-sm text-muted-foreground italic">
                  Since {profile?.id ? 'February 2026' : 'joining the team'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Documents signed</span>
              <span className="font-bold text-foreground">2 / 2</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-muted-foreground">Everything looks good!</p>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {features.map((feature, idx) => (
          <button
            key={idx}
            className="group relative p-6 rounded-2xl border border-border/50 bg-card hover:bg-muted/50 transition-all duration-300 text-left overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${feature.bg} ${feature.color} mb-4 transition-transform group-hover:scale-110 duration-500`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1 font-heading">{feature.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{feature.description}</p>

            {/* Subtle glow effect */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
