import { CheckCircle, Eye, Mail, Clock, Home } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ProgressBar } from './ProgressBar';
import type { Case } from '../App';

type EmailSentProps = {
  case: Case;
  onViewReply: () => void;
  onBackToDashboard: () => void;
};

export function EmailSent({ case: caseItem, onViewReply, onBackToDashboard }: EmailSentProps) {
  const insurerName = caseItem.parsedData?.insurer || caseItem.insuranceCompany;
  const [isSyncing, setIsSyncing] = useState(false);


  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={3} />
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-gray-900 mb-2">
            Your Appeal Has Been Sent!
          </h1>
          <p className="text-gray-600">
            We've successfully sent your appeal to {insurerName}
          </p>
        </div>

        {/* Status Card */}
        <Card className="p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-gray-900">Monitoring Active</h2>
                <Badge className="bg-green-600">Active</Badge>
              </div>
              <p className="text-gray-600">
                We're now monitoring your inbox for a reply from {insurerName}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 mb-2">
                  <strong>What's happening now:</strong>
                </p>
                <p className="text-blue-800">
                  We're continuously checking your inbox for any response from the insurance company. 
                  When they reply, we'll notify you immediately and help you analyze their response.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="text-gray-900 mb-6">What to Expect</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 mb-1">Appeal Sent</p>
                <p className="text-gray-500">Just now</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 mb-1">Waiting for Response</p>
                <p className="text-gray-500">
                  Insurance companies typically respond within 15-30 days
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 mb-1">Response Received</p>
                <p className="text-gray-500">
                  We'll notify you and help you understand their reply
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sync Button - Manual Check */}
        <Card className="p-6 bg-blue-50 border-blue-200 mb-6">
          <h3 className="text-gray-900 mb-2">Check for Replies</h3>
          <p className="text-gray-600 mb-4">
            If you've received a reply in your inbox, click below to sync it with the app.
          </p>
          <Button 
            onClick={async () => {
                try {
                    setIsSyncing(true);
                    const { apiUrl } = await import('../config');
                    const res = await fetch(apiUrl('/api/gmail/sync'), { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                        // Always check for updates, even if processed count is 0
                        // (e.g. if we missed the update previously)
                        onViewReply(); 
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsSyncing(false);
                }
            }} 
            variant="outline" 
            className="w-full"
            disabled={isSyncing}
          >
            {isSyncing ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Syncing...
                </>
            ) : (
                <>
                    <Mail className="w-4 h-4 mr-2" />
                    Sync Emails
                </>
            )}
          </Button>
        </Card>

        {/* Next Steps */}
        <Card className="p-6">
          <h3 className="text-gray-900 mb-4">While You Wait</h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Keep any additional medical documentation handy in case you need it for a follow-up
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Check your email regularly (we'll also send you notifications)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                You can view the status of your appeal anytime from your dashboard
              </span>
            </li>
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <Button onClick={onBackToDashboard} variant="outline" size="lg">
            <Home className="mr-2 w-5 h-5" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
