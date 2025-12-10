import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft, Lock, Send, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ProgressBar } from "./ProgressBar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import type { ParsedData, EmailMessage } from "../App";

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

export function EmailReview({
    userEmail,
    parsedData,
    onSend,
    onBack,
    onDelete,
    initialSubject,
    initialBody,
    caseId,
}: EmailReviewProps) {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [to, setTo] = useState(
        "claims@" +
            parsedData.insurer.toLowerCase().replace(/\s+/g, "") +
            ".com"
    );
    const [subject, setSubject] = useState(
        initialSubject ||
            `Appeal for Claim Denial - Policy #${parsedData.policyNumber}`
    );

    const progressSteps = [
        "Choose Plan",
        "Upload Documents",
        "Strategy",
        "Send",
    ];
    const hardcodedEmailBody = `Patient Name: Mae Chen
Date of Birth: 2003-11-21

To the Cigna Appeals Department:

Please be advised that this firm represents the above-referenced insured person. This correspondence serves as a formal appeal of the adverse benefit determination issued on October 1, 2025, regarding claim number C193787 for our client, Mae Chen. The denial of coverage for CPT codes 82306 (Vitamin D, 25 hydroxy) and 84443 (TSH - Thyroid Stimulating Hormone), rendered during an Emergency Room visit on September 21, 2025, is improper, procedurally deficient, and must be reversed.

The denial is based on the assertion that these services were "Not Medically Necessary." However, the determination letter fails to provide any specific clinical rationale or evidence to substantiate this conclusion. Your policy, the Cigna Connect Flex Bronze 0 NA/AN Under 300 MIEP0932 plan, defines Medically Necessary services as those that are, inter alia, "Consistent with the symptoms or diagnosis," for "diagnosis or direct care and treatment," and "In accordance with generally accepted standards of medical practice." Your denial provides a boilerplate recitation of this definition but fails to articulate precisely how the services in question did not meet these criteria in the context of Ms. Chen's presenting condition. A conclusory statement without supporting clinical justification is arbitrary and insufficient to support a denial of benefits.

Furthermore, the denial is procedurally invalid. The plan documents explicitly mandate that "All written denials of requests for covered benefits on the ground that such benefits are not medically necessary... must be signed by a licensed physician/dentist familiar with standards of care in Colorado." The adverse benefit determination letter dated October 1, 2025, conspicuously lacks any such signature, either written or electronic. This is a direct violation of the terms of your own policy and renders the decision procedurally non-compliant and unenforceable.

Given that the denial is both substantively unsubstantiated and procedurally defective, we demand the immediate reversal of this adverse benefit determination. You are required to reprocess claim C193787 and issue payment for CPT codes 82306 and 84443 in accordance with the plan's benefits. We expect a written confirmation of this reversal and payment authorization within fifteen (15) business days.

Respectfully submitted,
PolicyPilot
Patient Advocate`;

    const [body, setBody] = useState(initialBody || hardcodedEmailBody);

    const handleSend = async () => {
        try {
            const response = await fetch("/api/gmail/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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
                throw new Error("Failed to send email");
            }

            const message: EmailMessage = {
                id: Date.now().toString(),
                from: userEmail,
                to,
                subject,
                body,
                date: new Date().toISOString(),
                type: "sent",
            };
            onSend(message);
            setShowConfirmation(false);
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send email. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ProgressBar currentStep={3} steps={progressSteps} />

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-gray-900 mb-2">
                        Draft Your Initial Email
                    </h1>
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
                            <Label className="text-gray-700 mb-2 block">
                                From
                            </Label>
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
                            <Label
                                htmlFor="to"
                                className="text-gray-700 mb-2 block"
                            >
                                To
                            </Label>
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
                            <Label
                                htmlFor="subject"
                                className="text-gray-700 mb-2 block"
                            >
                                Subject
                            </Label>
                            <Input
                                id="subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        {/* Body Editor - Editable */}
                        <div>
                            <Label
                                htmlFor="body"
                                className="text-gray-700 mb-2 block"
                            >
                                Email Body
                            </Label>
                            <Textarea
                                id="body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="w-full min-h-[500px] font-mono"
                                style={{
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "normal",
                                    overflowWrap: "normal",
                                    width: "100%",
                                    boxSizing: "border-box",
                                }}
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
                            <Button
                                variant="destructive"
                                onClick={onDelete}
                                size="lg"
                            >
                                <Trash2 className="mr-2 w-5 h-5" />
                                Delete Case
                            </Button>
                        )}
                    </div>
                    <Button
                        onClick={() => setShowConfirmation(true)}
                        size="lg"
                        className="px-8"
                    >
                        <Send className="mr-2 w-5 h-5" />
                        Send Email
                    </Button>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog
                open={showConfirmation}
                onOpenChange={setShowConfirmation}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Send Appeal Email?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will send your appeal email to {to} from
                            policypilotco@gmail.com on your behalf. Make sure
                            you've reviewed all the details carefully.
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
