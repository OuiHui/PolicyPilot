import { useState } from 'react';
import { CheckCircle, Mail, Clock, Home, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { ProgressBar } from './ProgressBar';
import type { Case, EmailMessage } from '../App';

type EmailSentProps = {
  case: Case;
  onViewReply: () => void;
  onBackToDashboard: () => void;
  userEmail: string;
  onSubmitResponse?: (response: EmailMessage) => void;
};

export function EmailSent({ case: caseItem, onViewReply, onBackToDashboard, userEmail, onSubmitResponse }: EmailSentProps) {
  const insurerName = caseItem.parsedData?.insurer || 'Insurance Company';
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      alert('Please paste the insurance company response before submitting.');
      return;
    }

    const response: EmailMessage = {
      id: Date.now().toString(),
      from: `claims@${insurerName.toLowerCase().replace(/\s+/g, '')}.com`,
      to: userEmail,
      subject: 'Re: Appeal for Claim Denial',
      body: responseText,
      date: new Date().toISOString(),
      type: 'received'
    };

    if (onSubmitResponse) {
      setSubmitting(true);
      onSubmitResponse(response);
      // Reset after submission
      setTimeout(() => {
        setSubmitting(false);
        setResponseText('');
      }, 500);
    }
  };

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
            Your Appeal Letter is Ready!
          </h1>
          <p className="text-gray-600">
            You can now send your appeal to {insurerName} from your email client
          </p>
        </div>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="text-gray-900 mb-6">What to Expect</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-1">Appeal Letter Generated</p>
                <p className="text-gray-500 text-sm">Just now</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-1">Waiting for Response</p>
                <p className="text-gray-500 text-sm">
                  Insurance companies typically respond within 15-30 days
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-gray-600 font-medium mb-1">Response Received</p>
                <p className="text-gray-500 text-sm">
                  When you receive a response, paste it below to continue
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Response Paste Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Received a Response?</h2>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            When {insurerName} replies to your appeal, paste their email response here to continue the process.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="response" className="text-gray-700 mb-2 block">Insurance Company Response</Label>
              <Textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Paste the complete email response from your insurance company here..."
                className="w-full min-h-[200px] font-mono text-sm"
              />
            </div>

            <Button
              onClick={handleSubmitResponse}
              disabled={!responseText.trim() || submitting}
              className="w-full"
              size="lg"
            >
              <Send className="mr-2 w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </div>
        </Card>

        {/* Demo Button - Simulating Reply */}
        <Card className="p-6 bg-purple-50 border-purple-200 mb-6">
          <h3 className="text-gray-900 mb-2 font-semibold">Demo Mode</h3>
          <p className="text-gray-600 mb-4 text-sm">
            In this prototype, click below to simulate receiving a reply from the insurance company.
          </p>
          <Button onClick={onViewReply} variant="outline" className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            Simulate Reply Received
          </Button>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 mb-6">
          <h3 className="text-gray-900 mb-4 font-semibold">While You Wait</h3>
          <ul className="space-y-3 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Keep any additional medical documentation handy in case you need it for a follow-up
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                Check your email regularly for responses from the insurance company
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
