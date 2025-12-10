import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Send, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ProgressBar } from './ProgressBar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import type { EmailMessage } from '../App';

type FollowupReviewProps = {
  userEmail: string;
  onSend: (message: EmailMessage) => void;
  onBack: () => void;
  initialSubject?: string;
  initialBody?: string;
  caseId: string;
  emailThread: EmailMessage[];
};

export function FollowupReview({ userEmail, onSend, onBack, initialSubject, initialBody, caseId, emailThread }: FollowupReviewProps) {
  // Find the last received email to determine the recipient
  const lastReceivedEmail = emailThread
    .filter(e => e.type === 'received')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Extract email from "Name <email>" format if necessary, or use default
  const getSenderEmail = (fromStr?: string) => {
    if (!fromStr) return 'claims@healthguard.com';
    const match = fromStr.match(/<([^>]+)>/);
    return match ? match[1] : fromStr;
  };

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [to, setTo] = useState(getSenderEmail(lastReceivedEmail?.from));
  
  // Use the last email's subject for the reply to ensure threading works
  const getReplySubject = () => {
    if (lastReceivedEmail?.subject) {
        return lastReceivedEmail.subject.startsWith('Re:') 
            ? lastReceivedEmail.subject 
            : `Re: ${lastReceivedEmail.subject}`;
    }
    return initialSubject || 'Re: Appeal for Claim Denial';
  };

  const hardcodedEmailBody = `Dear Mr. Hayes,

RE: Mae Chen

Claim Number: C193787

Policy: Cigna Connect Flex Bronze 0 NA/AN Under 300 MIEP0932

Thank you for your prompt procedural audit and for overturning the adverse benefit determination for the services rendered to our client, Mae Chen, on September 21, 2025. We appreciate your confirmation that CPT codes 82306 and 84443 will be reprocessed for payment.

However, we must formally object to your refusal to provide the 'Relevant Information' requested in our initial appeal. Your response states that because the denial is now "null and void," there is no longer an active adverse determination to support with the requested documentation. This position is inconsistent with the plan's own terms and our client's rights.

Our right to receive this information was established the moment the initial adverse determination was issued. The policy itself defines 'Relevant Information' as "any document, record, or other information which (a) was relied upon in making the benefit determination; (b) was submitted, considered, or generated in the course of making the benefit determination, without regard to whether such document, record, or other information was relied upon..."

The subsequent procedural reversal does not erase the fact that a benefit determination *was* made, and documents *were* generated and relied upon in that process. Allowing an insurer to shield its initial clinical reasoning from review simply by overturning a denial on a technicality creates a loophole that undermines transparency and accountability. Understanding the basis for the original flawed denial is critical to ensuring such improper determinations are not made in the future.

Therefore, we reiterate our demand for the complete administrative file related to the *initial* denial of claim C193787. This includes, but is not limited to, all documents, records, internal notes, the specific clinical rationale, applicable medical policies, and reviewer credentials that were submitted, considered, or generated in the course of making that determination.

Please provide this information within 15 business days.

Sincerely,

PolicyPilot

Legal Counsel for Mae Chen`;

  const [subject, setSubject] = useState(getReplySubject());
  const [body, setBody] = useState(initialBody || hardcodedEmailBody);

  const handleSend = async () => {
    // Find the last received email to reply to
    const lastReceived = emailThread
        .filter(e => e.type === 'received')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    console.log("FollowupReview: emailThread", emailThread);
    console.log("FollowupReview: lastReceived", lastReceived);

    // We need the threadId from the last email, or any email in the thread
    // And the messageId of the last email for In-Reply-To
    // CRITICAL: Use the RFC 2822 Message-ID header if available, otherwise Gmail API ID might fail threading
    const threadId = lastReceived?.threadId;
    const inReplyTo = lastReceived?.messageIdHeader || lastReceived?.id;

    console.log("FollowupReview: threadId", threadId);
    console.log("FollowupReview: inReplyTo", inReplyTo);

    try {
        const response = await fetch('/api/gmail/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to,
                subject,
                message: body,
                userEmail,
                caseId,
                threadId,
                inReplyTo
            })
        });

        if (!response.ok) {
            throw new Error('Failed to send email');
        }

        const result = await response.json();

        const message: EmailMessage = {
            id: result.result?.id || Date.now().toString(),
            from: userEmail,
            to,
            subject,
            body,
            date: new Date().toISOString(),
            type: 'sent',
            threadId: result.result?.threadId || threadId
        };
        onSend(message);
        setShowConfirmation(false);
    } catch (error) {
        console.error('Error sending follow-up:', error);
        alert('Failed to send follow-up email.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={3} />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Draft Follow-up Response</h1>
          <p className="text-gray-600">
            We've drafted a strategic follow-up that addresses the gaps in their response.
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Email Details</h2>
          </div>

          <div className="space-y-6">
            {/* From Field - Locked */}
            <div>
              <Label className="text-gray-700 mb-2 block">From</Label>
              <div className="relative">
                <Input
                  value="policypilotco@gmail.com"
                  disabled
                  className="w-full bg-gray-100 pr-10"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>



            <div>
              <Label htmlFor="body" className="text-gray-700 mb-2 block">Email Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[500px] font-mono"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <Button onClick={() => setShowConfirmation(true)} size="lg" className="px-8">
            <Send className="mr-2 w-5 h-5" />
            Send Email
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Follow-up Email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send your follow-up email to {to} from policypilotco@gmail.com on your behalf.
              Make sure you've reviewed all the details carefully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>
              Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
