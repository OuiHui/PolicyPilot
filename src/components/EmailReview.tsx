import { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ProgressBar } from './ProgressBar';
import type { ParsedData, EmailMessage } from '../App';

type EmailReviewProps = {
  userEmail: string;
  parsedData: ParsedData;
  onSend: (message: EmailMessage) => void;
  onBack: () => void;
};

export function EmailReview({ userEmail, parsedData, onSend, onBack }: EmailReviewProps) {
  const [copied, setCopied] = useState(false);
  const [to, setTo] = useState('claims@' + parsedData.insurer.toLowerCase().replace(/\s+/g, '') + '.com');
  const [subject, setSubject] = useState(`Appeal for Claim Denial - Policy #${parsedData.policyNumber}`);

  const progressSteps = [
    "Choose Plan",
    "Upload Documents",
    "Strategy",
    "Copy Email",
  ];
  const [body, setBody] = useState(
    `Dear ${parsedData.insurer} Claims Department,

I am writing to formally appeal the denial of my recent claim under Policy #${parsedData.policyNumber} for medical services rendered on [Date of Service].

According to your denial notice, the claim was denied on the basis that the "${parsedData.denialReason.toLowerCase()}." After reviewing my policy, I believe this determination is inconsistent with the terms of coverage.

Per Section 4.B of my policy, "Medically necessary services include those procedures that are appropriate and consistent with the diagnosis and that could not have been omitted without adversely affecting the patient's condition or the quality of care provided."

My treating physician has provided detailed medical documentation confirming that this procedure was clinically necessary for the management of my condition and consistent with accepted standards of care. The decision to perform this service was based on sound medical judgment and was essential for my treatment and recovery.

Accordingly, I respectfully request that ${parsedData.insurer}:
1. Conduct a full reconsideration of my claim in light of the supporting medical documentation provided;
2. Review the determination under the cited policy provisions; and
3. Provide a written explanation detailing the rationale and evidence used should the denial be upheld.

Please confirm receipt of this appeal and advise me of any additional information required to facilitate your review. I look forward to your response within the timeframe specified under my policy's appeals process.

Thank you for your prompt attention to this matter.

Sincerely,
[Your Name]`
  );

  const handleCopyEmail = async () => {
    const emailText = `To: ${to}
Subject: ${subject}

${body}`;

    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      // DO NOT call onSend here - just copy to clipboard
    } catch (err) {
      console.error('Failed to copy email:', err);
      alert('Failed to copy to clipboard. Please try again or copy manually.');
    }
  };

  const handleNext = () => {
    // Save to email thread when user clicks Next
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={3} steps={progressSteps} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Review Your Appeal Letter</h1>
          <p className="text-gray-600">
            Review and edit your appeal email, then copy it to send from your email client.
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Email Details</h2>
          </div>

          <div className="space-y-6">
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
              <p className="text-gray-500 mt-1 text-sm">
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
                className="w-full min-h-[500px] font-mono text-sm"
              />
            </div>
          </div>
        </Card>

        {/* Instructions Banner */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 mb-1 font-semibold">
                Next Steps:
              </p>
              <p className="text-blue-800 text-sm">
                Click "Copy to Clipboard" to copy this email, then paste it into your email client
                to send to the insurance company. When ready, click "Next" to continue tracking your appeal.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} size="lg">
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={handleCopyEmail}
              size="lg"
              variant="outline"
              className="px-6"
            >
              {copied ? (
                <>
                  <Check className="mr-2 w-5 h-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 w-5 h-5" />
                  Copy to Clipboard
                </>
              )}
            </Button>
            <Button
              onClick={handleNext}
              size="lg"
              className="px-8"
            >
              Next
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
