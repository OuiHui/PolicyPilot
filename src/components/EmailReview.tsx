import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Lock, Send, Trash2 } from 'lucide-react';
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
import type { ParsedData, EmailMessage } from '../App';

type EmailReviewProps = {
  userEmail: string;
  parsedData: ParsedData;
  onSend: (message: EmailMessage) => void;
  onBack: () => void;
  onDelete?: () => void;
  initialSubject?: string;
  initialBody?: string;
  caseId: string; // Add caseId prop
};

export function EmailReview({ userEmail, parsedData, onSend, onBack, onDelete, initialSubject, initialBody, caseId }: EmailReviewProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [to, setTo] = useState('claims@' + parsedData.insurer.toLowerCase().replace(/\s+/g, '') + '.com');
  const [subject, setSubject] = useState(initialSubject || `Appeal for Claim Denial - Policy #${parsedData.policyNumber}`);

  const progressSteps = [
    "Choose Plan",
    "Upload Documents",
    "Strategy",
    "Send",
  ];
  const [body, setBody] = useState(initialBody ||
    `Dear ${parsedData.insurer} Claims Department,

I am writing to formally appeal the denial of my recent claim under Policy #${parsedData.policyNumber} for medical services rendered on [Date of Service].

According to your denial notice, the claim was denied on the basis that the "${parsedData.denialReason.toLowerCase()}." After reviewing my policy, I believe this determination is inconsistent with the terms of coverage.

Per Section 4.B of my policy, "Medically necessary services include those procedures that are appropriate and consistent with the diagnosis and that could not have been omitted without adversely affecting the patient's condition or the quality of care provided."

My treating physician has provided detailed medical documentation confirming that this procedure was clinically necessary for the management of my condition and consistent with accepted standards of care. The decision to perform this service was based on sound medical judgment and was essential for my treatment and recovery.

Accordingly, I respectfully request that ${parsedData.insurer}:
1. Conduct a full reconsideration of my claim in light of the supporting medical documentation provided;
2. Review the determination under the cited policy provisions; and
3. Provide a written explanation detailing the rationale and evidence used should the denial be upheld.

Please confirm receipt of this appeal and advise me of any additional information required to facilitate your review. I look forward to your response within the timeframe specified under my policy’s appeals process.

Thank you for your prompt attention to this matter.

Sincerely,
[Your Name]`
  );

  const handleSend = async () => {
    try {
      const response = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          message: body,
          userEmail, // Pass userEmail for labeling
          caseId, // Pass caseId for tracking
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

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
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={3} steps={progressSteps} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Draft Your Initial Email</h1>
          <p className="text-gray-600">
            Review and edit your appeal email before sending.
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
                  id="from"
                  type="email"
                  value="policypilotco@gmail.com"
                  disabled
                  className="w-full bg-gray-100 pr-10"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-500 mt-1">
                Email will be sent from policypilotco@gmail.com
              </p>
            </div>

            {/* To Field - Editable */}
            <div>
              <Label htmlFor="to" className="text-gray-700 mb-2 block">To</Label>
              <Input
                id="to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="claims@insurer.com"
                className="w-full"
              />
              <p className="text-gray-500 mt-1">
                Insurance company claims department email
              </p>
            </div>

            {/* Subject Field - Editable */}
            <div>
              <Label htmlFor="subject" className="text-gray-700 mb-2 block">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Body Editor - Editable */}
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

        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} size="lg">
              <ArrowLeft className="mr-2 w-5 h-5" />
              Back
            </Button>
            {onDelete && (
              <Button variant="destructive" onClick={onDelete} size="lg">
                <Trash2 className="mr-2 w-5 h-5" />
                Delete Case
              </Button>
            )}
          </div>
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
            <AlertDialogTitle>Send Appeal Email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send your appeal email to {to} from policypilotco@gmail.com on your behalf.
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
