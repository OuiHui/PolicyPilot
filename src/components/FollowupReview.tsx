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
};

export function FollowupReview({ userEmail, onSend, onBack }: FollowupReviewProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [to, setTo] = useState('claims@healthguard.com');
  const [subject, setSubject] = useState('Re: Appeal for Claim Denial - Second Appeal');
  const [body, setBody] = useState(
    `Dear Claims Department,

Thank you for your response. However, I must respectfully point out that your reply does not address the specific policy provisions I cited in my original appeal.

In your response, you reference "clinical guidelines" and "evidence-based medical criteria." However, my policy contract does not stipulate that coverage decisions must be based on your internal clinical guidelines. The policy I purchased clearly states in [Citation from Section 4.B] that medically necessary services are those that are "appropriate and consistent with the diagnosis" as determined by my treating physician.

Specifically, your response fails to address:

1. How your "clinical guidelines" supersede the explicit coverage terms in my policy
2. Why my physician's medical determination is being overridden by your internal review process
3. The conflict between your denial and coverage for physician-recommended treatments

I am requesting that you provide:

1. A detailed explanation of the legal basis for applying internal guidelines that are more restrictive than my policy terms
2. Documentation showing how your clinical guidelines were disclosed in my policy documents
3. Reconsideration of my claim based on the policy language I have cited

If these policy conflicts cannot be resolved, please provide information about proceeding to external review.

I look forward to your response addressing these specific questions.

Sincerely,
[Your Name]`
  );

  const handleSend = () => {
    const message: EmailMessage = {
      id: Date.now().toString(),
      from: userEmail,
      to,
      subject,
      body,
      date: new Date().toISOString(),
      type: 'sent'
    };
    onSend(message);
    setShowConfirmation(false);
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
                  value={userEmail}
                  disabled
                  className="w-full bg-gray-100 pr-10"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <Label htmlFor="to" className="text-gray-700 mb-2 block">To</Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="subject" className="text-gray-700 mb-2 block">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full"
              />
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
              This will send your follow-up email to {to} from {userEmail}.
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
