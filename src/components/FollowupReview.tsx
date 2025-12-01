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

  const [subject, setSubject] = useState(getReplySubject());
  const [body, setBody] = useState(initialBody ||
    `Dear Claims Department,

Thank you for your recent correspondence regarding my appeal. After reviewing your response, I must respectfully note that several key policy and medical considerations outlined in my initial appeal were not directly addressed.

Your letter references the use of "clinical guidelines" and "evidence-based criteria" in support of your determination. However, my policy does not state that internal guidelines may override the policy definitions of medical necessity. As referenced in Section 4.B of my policy, medically necessary services are defined as those that are "appropriate and consistent with the diagnosis and that could not have been omitted without adversely affecting the patient's condition or quality of care."

Accordingly, I am requesting clarification on the following points:

1. The legal and contractual basis under which internal clinical guidelines are applied in lieu of the policy’s stated coverage criteria.  
2. The rationale for disregarding the medical judgment of my treating physician, who determined that the procedure was clinically necessary for my diagnosis and recovery.  
3. Documentation or disclosure indicating where your internal review criteria were referenced or incorporated into my policy documents at the time of purchase.  

In light of these concerns, I am requesting that HealthGuard conduct a second-level review of my appeal, taking into account both the policy language and the supporting medical documentation provided by my physician.

If this matter cannot be resolved through internal review, please provide information on the process for requesting an independent external review under applicable state and federal regulations.

Thank you for your continued attention to this matter. I look forward to your timely and comprehensive response.

Sincerely,
[Your Name]`
  );

  const handleSend = async () => {
    // Find the last received email to reply to
    const lastReceived = emailThread
        .filter(e => e.type === 'received')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    console.log("FollowupReview: emailThread", emailThread);
    console.log("FollowupReview: lastReceived", lastReceived);

    // We need the threadId from the last email, or any email in the thread
    // And the messageId of the last email for In-Reply-To
    const threadId = lastReceived?.threadId;
    const inReplyTo = lastReceived?.id; // Assuming id is the messageId for received emails

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
