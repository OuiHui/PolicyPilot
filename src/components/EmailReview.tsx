import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Lock, Send } from 'lucide-react';
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
};

export function EmailReview({ userEmail, parsedData, onSend, onBack }: EmailReviewProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [to, setTo] = useState('claims@' + parsedData.insurer.toLowerCase().replace(/\s+/g, '') + '.com');
  const [subject, setSubject] = useState(`Appeal for Claim Denial - Policy #${parsedData.policyNumber}`);
  const [body, setBody] = useState(
    `Dear ${parsedData.insurer} Claims Department,

I am writing to formally appeal the denial of my recent claim (Policy #${parsedData.policyNumber}) for medical services rendered.

Your denial letter states that the service was "${parsedData.denialReason.toLowerCase()}." However, this determination appears to conflict with the coverage provisions outlined in my policy.

Specifically, [Citation from Section 4.B] of my policy document states: "Medically necessary services include those procedures that are appropriate and consistent with the diagnosis and that could not have been omitted without adversely affecting the patient's condition or the quality of medical care rendered."

My treating physician has provided documentation confirming that this service was essential for my treatment and recovery. The procedure was performed based on professional medical judgment and aligns with standard medical practices for my condition.

I request that you:
1. Review the enclosed medical documentation
2. Reconsider your denial based on the policy provisions cited above
3. Provide a detailed explanation if the denial is upheld

I look forward to your response within the timeframe specified in my policy.

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
                  value={userEmail}
                  disabled
                  className="w-full bg-gray-100 pr-10"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-gray-500 mt-1">
                Email will be sent from your connected Gmail account
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
              <p className="text-gray-500 mt-1">
                Policy citations are marked with [Citation from Section X.X]
              </p>
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
            <AlertDialogTitle>Send Appeal Email?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send your appeal email to {to} from {userEmail}. 
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
