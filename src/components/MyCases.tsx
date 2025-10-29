import { FileText, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { Case } from '../App';

type MyCasesProps = {
  cases: Case[];
  onViewCase: (caseId: string) => void;
  onResumeCase: (caseId: string) => void;
  onStartNew: () => void;
};

export function MyCases({ cases, onViewCase, onResumeCase, onStartNew }: MyCasesProps) {
  const isIncomplete = (caseItem: Case) => {
    return ['denial-upload', 'policy-upload', 'extracted-info', 'strategy', 'email-review'].includes(caseItem.currentStep);
  };

  const getStepText = (step: Case['currentStep']) => {
    switch (step) {
      case 'denial-upload': return 'Uploading Denial Documents';
      case 'policy-upload': return 'Uploading Policy Documents';
      case 'extracted-info': return 'Reviewing Extracted Info';
      case 'strategy': return 'Reviewing Strategy';
      case 'email-review': return 'Drafting Email';
      case 'email-sent': return 'Email Sent';
      case 'reply-received': return 'Reply Received';
      case 'followup-review': return 'Drafting Follow-up';
      default: return step;
    }
  };

  const getStatusText = (status: Case['status']) => {
    switch (status) {
      case 'uploading': return 'Uploading';
      case 'analyzing': return 'Analysis Complete';
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">My Cases</h1>
            <p className="text-gray-600">
              Manage and track all your insurance appeals
            </p>
          </div>
          <Button onClick={onStartNew} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            New Appeal
          </Button>
        </div>

        {cases.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-gray-900 mb-2">No Active Cases</h2>
            <p className="text-gray-600 mb-6">
              Upload documents to start your first appeal.
            </p>
            <Button onClick={onStartNew}>
              <Plus className="w-5 h-5 mr-2" />
              Start New Appeal
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem) => (
              <Card
                key={caseItem.id}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                  {caseItem.hasNewEmail && (
                    <Badge variant="destructive" className="animate-pulse">
                      New
                    </Badge>
                  )}
                </div>
                <h3 className="text-gray-900 mb-2">
                  {caseItem.insuranceCompany}
                </h3>
                <p className="text-gray-500 mb-3">
                  Created {new Date(caseItem.dateCreated).toLocaleDateString()}
                </p>
                {isIncomplete(caseItem) ? (
                  <>
                    <Badge className="bg-yellow-600 mb-3">
                      In Progress: {getStepText(caseItem.currentStep)}
                    </Badge>
                    <Button 
                      onClick={() => onResumeCase(caseItem.id)} 
                      className="w-full mt-3"
                    >
                      Resume
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge className={getStatusColor(caseItem.status) + " mb-3"}>
                      {getStatusText(caseItem.status)}
                    </Badge>
                    <Button 
                      onClick={() => onViewCase(caseItem.id)} 
                      className="w-full mt-3"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
