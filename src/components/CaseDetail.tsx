import { ArrowLeft, FileText, Mail, Download, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { Case } from '../App';

type CaseDetailProps = {
  case: Case;
  onBack: () => void;
};

export function CaseDetail({ case: caseItem, onBack }: CaseDetailProps) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Button variant="outline" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Cases
        </Button>

        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-gray-900 mb-2">
                {caseItem.insuranceCompany}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(caseItem.dateCreated).toLocaleDateString()}</span>
                </div>
                {caseItem.parsedData && (
                  <span>Policy #{caseItem.parsedData.policyNumber}</span>
                )}
              </div>
            </div>
            <Badge className="bg-blue-600">{getStatusText(caseItem.status)}</Badge>
          </div>
        </div>

        <div className="space-y-6">
          {/* Uploaded Documents */}
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4">Uploaded Documents</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-700 mb-2">Denial Documents</p>
                {caseItem.denialFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-900">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {caseItem.policyFiles.length > 0 && (
                <div>
                  <p className="text-gray-700 mb-2">
                    Policy Documents ({caseItem.policyType === 'comprehensive' ? 'Comprehensive' : 'Supplementary'})
                  </p>
                  {caseItem.policyFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Extracted Information */}
          {caseItem.parsedData && (
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Extracted Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 mb-1">Insurance Company</p>
                  <p className="text-gray-900">{caseItem.parsedData.insurer}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Policy Number</p>
                  <p className="text-gray-900">{caseItem.parsedData.policyNumber}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 mb-1">Denial Reason</p>
                  <p className="text-gray-900">{caseItem.parsedData.denialReason}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Email Thread */}
          {caseItem.emailThread.length > 0 && (
            <Card className="p-6">
              <h2 className="text-gray-900 mb-4">Email Thread</h2>
              <div className="space-y-4">
                {caseItem.emailThread.map((email, index) => (
                  <div key={email.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start gap-3">
                      <Mail className={`w-5 h-5 flex-shrink-0 mt-1 ${
                        email.type === 'sent' ? 'text-blue-600' : 'text-green-600'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-gray-900">{email.subject}</p>
                            <p className="text-gray-500">
                              {email.type === 'sent' ? 'To' : 'From'}: {email.type === 'sent' ? email.to : email.from}
                            </p>
                          </div>
                          <Badge variant={email.type === 'sent' ? 'default' : 'secondary'}>
                            {email.type === 'sent' ? 'Sent' : 'Received'}
                          </Badge>
                        </div>
                        <p className="text-gray-600">{new Date(email.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
