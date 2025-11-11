import { Shield, Upload, Lightbulb, Send, ArrowRight, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { Case } from '../App';

type DashboardProps = {
  onStartNewAppeal: () => void;
  cases: Case[];
  onViewCase: (caseId: string) => void;
  onResumeCase: (caseId: string) => void;
};

export function Dashboard({ onStartNewAppeal, cases, onViewCase, onResumeCase }: DashboardProps) {
  const steps = [
    {
      number: 1,
      icon: Upload,
      title: 'Upload & Analyze',
      description: 'Upload your denial letter and policy. Our AI extracts key information instantly.'
    },
    {
      number: 2,
      icon: Lightbulb,
      title: 'Understand Your Strategy',
      description: 'Get a detailed analysis of why you were denied and how to respond.'
    },
    {
      number: 3,
      icon: Send,
      title: 'Automate Your Outreach',
      description: 'Review and send professionally crafted appeals directly from your email.'
    }
  ];

  const recentCases = cases.slice(-3).reverse();

  const isIncomplete = (caseItem: Case) => {
    return ['denial-upload', 'policy-upload', 'extracted-info', 'strategy', 'email-review'].includes(caseItem.currentStep);
  };

  const getStatusText = (status: Case['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading';
      case 'analyzing': return 'Analyzing';
      case 'ready-to-send': return 'Ready to Send';
      case 'sent': return 'Sent';
      case 'awaiting-reply': return 'Awaiting Reply';
      case 'reply-received': return 'Reply Received';
      default: return status;
    }
  };

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'analyzing': return 'bg-blue-600';
      case 'ready-to-send': return 'bg-green-600';
      case 'sent': case 'awaiting-reply': return 'bg-orange-600';
      case 'reply-received': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="text-4xl font-bold text-gray-900 mb-4">
            Challenge Your Insurance Denial with Confidence
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl">
            Navigate the complex appeals process with AI-powered guidance. We analyze your denial, 
            find conflicting policy provisions, and help you craft compelling appeals.
          </p>
          <Button onClick={onStartNewAppeal} className="px-8" size="lg">
            Start New Appeal
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Recent Cases */}
        {recentCases.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Cases</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {recentCases.map((caseItem) => (
                <Card 
                  key={caseItem.id} 
                  className="p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                    {caseItem.hasNewEmail && (
                      <Badge variant="destructive">New</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {caseItem.insuranceCompany}
                  </h3>
                  <p className="text-sm text-gray-700 mb-2 font-medium">
                    {caseItem.denialReasonTitle}
                  </p>
                  <p className="text-gray-500 mb-3">
                    {new Date(caseItem.dateCreated).toLocaleDateString()}
                  </p>
                  <Badge className={getStatusColor(caseItem.status) + " mb-3"}>
                    {getStatusText(caseItem.status)}
                  </Badge>
                  {isIncomplete(caseItem) ? (
                    <Button 
                      onClick={() => onResumeCase(caseItem.id)} 
                      className="w-full mt-3"
                      variant="outline"
                    >
                      Resume
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => onViewCase(caseItem.id)} 
                      className="w-full mt-3"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* How It Works Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="mb-2 text-blue-600">
                    Step {step.number}
                  </div>
                  <h3 className="text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
