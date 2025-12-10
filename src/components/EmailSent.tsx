import { CheckCircle, Eye, Mail, Clock, Home, Loader2, ClipboardPaste, Send, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ProgressBar } from './ProgressBar';
import { apiUrl } from '../config';
import type { Case, EmailMessage } from '../App';

type EmailSentProps = {
  case: Case;
  onViewReply: () => void;
  onBackToDashboard: () => void;
  onReplySubmitted?: (reply: EmailMessage) => void;
  onSyncComplete?: () => void;
};

export function EmailSent({ case: caseItem, onViewReply, onBackToDashboard, onReplySubmitted, onSyncComplete }: EmailSentProps) {
  const insurerName = caseItem.parsedData?.insurer || caseItem.insuranceCompany;
  const [showPasteSection, setShowPasteSection] = useState(false);
  const [pastedReply, setPastedReply] = useState('');
  const [replyFrom, setReplyFrom] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleSyncEmails = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const response = await fetch(apiUrl('/api/gmail-api/sync'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.processed > 0) {
          setSyncStatus(`Found ${result.processed} new email(s)!`);
          // Call the callback to refresh case data and navigate
          if (onSyncComplete) {
            onSyncComplete();
          }
        } else {
          setSyncStatus('No new replies found. Check back later!');
        }
      } else {
        const error = await response.json();
        setSyncStatus(`Sync failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error syncing emails:', error);
      setSyncStatus('Sync failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!pastedReply.trim()) {
      alert('Please paste the insurance company\'s reply');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create an email message from the pasted content
      const replyMessage: EmailMessage = {
        id: `pasted-${Date.now()}`,
        from: replyFrom || `claims@${insurerName?.toLowerCase().replace(/\s+/g, '')}.com`,
        to: 'policypilotco@gmail.com',
        subject: replySubject || `Re: Appeal for Claim Denial - Policy #${caseItem.parsedData?.policyNumber}`,
        body: pastedReply,
        date: new Date().toISOString(),
        type: 'received',
      };

      if (onReplySubmitted) {
        onReplySubmitted(replyMessage);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to process reply. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                <h2 className="text-gray-900">Awaiting Response</h2>
                <Badge className="bg-yellow-600">Waiting</Badge>
              </div>
              <p className="text-gray-600">
                When you receive a reply from {insurerName}, paste it below and we'll help you analyze it.
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 mb-2">
                  <strong>What to do when you receive a reply:</strong>
                </p>
                <p className="text-blue-800">
                  Open the email from the insurance company, copy the entire message, and paste it in the section below. We'll analyze their response and help you draft an effective follow-up.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Sync Emails Section - Primary Action */}
        <Card className="p-6 mb-6 border-2 border-green-300 bg-green-50">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-green-600" />
            <h3 className="text-gray-900 font-semibold">Check for Replies</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Click below to automatically check your email for any replies from {insurerName}.
          </p>
          <Button
            onClick={handleSyncEmails}
            disabled={isSyncing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking for replies...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Emails
              </>
            )}
          </Button>
          {syncStatus && (
            <p className={`mt-3 text-sm ${syncStatus.includes('Found') ? 'text-green-700' : 'text-gray-600'}`}>
              {syncStatus}
            </p>
          )}
        </Card>

        {/* Paste Reply Section - Alternative */}
        <Card className="p-6 mb-6 border-2 border-dashed border-blue-300 bg-blue-50">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardPaste className="w-5 h-5 text-blue-600" />
            <h3 className="text-gray-900 font-semibold">Paste Insurance Company's Reply</h3>
          </div>

          {!showPasteSection ? (
            <Button
              onClick={() => setShowPasteSection(true)}
              variant="outline"
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              I received a reply - paste it here
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="replyFrom" className="text-gray-700 mb-2 block">From (optional)</Label>
                  <Input
                    id="replyFrom"
                    value={replyFrom}
                    onChange={(e) => setReplyFrom(e.target.value)}
                    placeholder={`claims@${insurerName?.toLowerCase().replace(/\s+/g, '')}.com`}
                  />
                </div>
                <div>
                  <Label htmlFor="replySubject" className="text-gray-700 mb-2 block">Subject (optional)</Label>
                  <Input
                    id="replySubject"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder="Re: Appeal for Claim Denial"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="replyBody" className="text-gray-700 mb-2 block">
                  Email Body <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="replyBody"
                  value={pastedReply}
                  onChange={(e) => setPastedReply(e.target.value)}
                  placeholder="Paste the insurance company's reply here..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitReply}
                  disabled={!pastedReply.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Analyze Reply & Draft Response
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPasteSection(false);
                    setPastedReply('');
                    setReplyFrom('');
                    setReplySubject('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
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
                  Paste their reply above and we'll help you respond
                </p>
              </div>
            </div>
          </div>
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
                Check your email regularly for a response from {insurerName}
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

