import { Mail, Lightbulb, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProgressBar } from "./ProgressBar";
import type { Case } from "../App";
import { useState } from "react";
import { apiUrl } from "../config";

type ReplyReceivedProps = {
    case: Case;
    onDraftGenerated: (draft: { subject: string; body: string }) => void;
    onBack: () => void;
    onDraftFollowup?: () => void; // Keep for backward compatibility if needed, but we'll use onDraftGenerated
};

export function ReplyReceived({
    case: caseItem,
    onDraftGenerated,
    onBack,
}: ReplyReceivedProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const latestReply = caseItem.emailThread
        .filter((e) => e.type === "received")
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];

    const insurerReply = {
        from: latestReply?.from || "claims@healthguard.com",
        subject: latestReply?.subject || "Re: Appeal for Claim Denial",
        date: latestReply?.date
            ? new Date(latestReply.date).toLocaleString()
            : new Date().toLocaleString(),
        body: latestReply?.body || "No content available.",
    };

    // Use hardcoded analysis data
    const hardcodedAnalysis = {
        summary:
            "This is a win! Cigna has accepted your appeal and overturned their previous decision to deny coverage for the Vitamin D and TSH tests. They admitted that the original denial letter was invalid (\"procedurally deficient\") because it lacked a required physician's signature and specific clinical reasons. Consequently, they are approving payment for both tests at the plan's allowed amount. They also stated they will not provide the administrative files you requested because the denial is now void and the claim is approved.",
        weaknesses: [
            "Refusal to provide 'Relevant Information': Cigna argues that because the denial is overturned, the request for the administrative file is moot. While legally defensible, this prevents you from verifying if the original reviewer was unqualified, effectively hiding the specifics of the initial error.",
            "Payment at 'allowed amount': The email states the claims are approved for the 'allowed amount,' but does not specify the dollar figure. Depending on your deductible and coinsurance status, there is a remote possibility of remaining financial responsibility, although emergency protections usually limit this.",
        ],
        terms: [
            {
                term: "adverse benefit determination",
                definition:
                    "A formal decision by an insurance company to deny, reduce, or terminate payment for a claim.",
            },
            {
                term: "adjudication",
                definition:
                    "The process by which an insurance company reviews a claim to determine if it should be paid and how much.",
            },
            {
                term: "procedural audit",
                definition:
                    "An internal review conducted by the insurance company to verify if their own processing steps followed the correct rules and regulations.",
            },
            {
                term: "procedurally deficient",
                definition:
                    "Failed to follow the required legal or administrative rules, such as missing a required signature or explanation.",
            },
            {
                term: "allowed amount",
                definition:
                    "The maximum amount the health insurance plan considers payment in full for a specific covered service.",
            },
        ],
        actionItems: [
            "Monitor your insurance portal or mail for the revised Explanation of Benefits (EOB) within the next 15 business days to confirm the claim status is updated to 'Paid'.",
            "Contact the billing department at Grady Hospital in about 3-4 weeks to verify they have received the payment and updated your balance to zero (or your applicable deductible/copay amount).",
            "Save a copy of this email and the new EOB permanently; if the hospital mistakenly bills you for these tests in the future, these documents are your proof of coverage.",
        ],
    };

    // Map analysis data to UI format - use hardcoded data
    const analysisData = latestReply?.analysis || hardcodedAnalysis;

    const [hovered, setHovered] = useState<{
        text: string;
        explanation: string;
        color?: string;
        position?: { top: number; left: number };
    } | null>(null);

    const highlightText = (text: string) => {
        // We only highlight terms for now, as weaknesses might be abstract concepts not in text
        const highlights = (analysisData.terms || []).map((t) => ({
            phrase: t.term,
            color: "bg-yellow-200",
            explanation: t.definition,
        }));

        let parts: { text: string; color?: string; explanation?: string }[] =
            [];
        let lastIndex = 0;

        // Find all occurrences
        const matches: {
            start: number;
            end: number;
            color: string;
            phrase: string;
            explanation: string;
        }[] = [];

        highlights.forEach(({ phrase, color, explanation }) => {
            // Escape special characters in phrase for regex
            const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escapedPhrase, "gi");
            let match: RegExpExecArray | null;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    color,
                    phrase: match[0],
                    explanation: explanation,
                });
            }
        });

        // Sort by position
        matches.sort((a, b) => a.start - b.start);

        // Remove overlaps (simple greedy approach: keep first, skip overlapping)
        const uniqueMatches: typeof matches = [];
        let currentEnd = 0;
        matches.forEach((m) => {
            if (m.start >= currentEnd) {
                uniqueMatches.push(m);
                currentEnd = m.end;
            }
        });

        // Build parts
        uniqueMatches.forEach(({ start, end, color, explanation }) => {
            if (start > lastIndex) {
                parts.push({ text: text.substring(lastIndex, start) });
            }
            parts.push({
                text: text.substring(start, end),
                color,
                explanation,
            });
            lastIndex = end;
        });

        if (lastIndex < text.length) {
            parts.push({ text: text.substring(lastIndex) });
        }

        return parts;
    };

    const handleGenerateFollowup = async () => {
        setIsGenerating(true);
        try {
            // Wait 1 second before showing results (simulating processing time)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Use hardcoded email draft instead of calling RAG pipeline
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

            // Get the last received email to determine the reply subject
            const lastReceived = caseItem.emailThread
                .filter((e) => e.type === "received")
                .sort(
                    (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                )[0];

            const replySubject = lastReceived?.subject
                ? lastReceived.subject.startsWith("Re:")
                    ? lastReceived.subject
                    : `Re: ${lastReceived.subject}`
                : "Re: Appeal for Claim Denial";

            onDraftGenerated({
                subject: replySubject,
                body: hardcodedEmailBody,
            });
        } catch (e) {
            console.error("Error generating follow-up:", e);
            alert("Error generating follow-up email.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-40">
            <ProgressBar currentStep={3} />

            <div className="max-w-4xl mx-auto px-6 pt-16 pb-40 mt-8">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-gray-900">
                            Insurance Company Response
                        </h1>
                        <Badge className="bg-orange-600">Needs Response</Badge>
                    </div>
                    <p className="text-gray-600">
                        Hover over highlighted terms in the email to see our
                        analysis.
                    </p>
                </div>

                {/* Insurer's Reply */}
                <Card className="p-6 mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Mail className="w-5 h-5 text-blue-600" />
                        <h2 className="text-gray-900">Insurer's Reply</h2>
                    </div>

                    {/* Email Header */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                        <div className="flex justify-between">
                            <span className="text-gray-500">From:</span>
                            <span className="text-gray-900">
                                {insurerReply.from}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date:</span>
                            <span className="text-gray-900">
                                {insurerReply.date}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-500">Subject:</span>
                            <p className="text-gray-900 mt-1">
                                {insurerReply.subject}
                            </p>
                        </div>
                    </div>

                    {/* Email Body with Color-Coded Highlighting */}
                    <div className="space-y-4">
                        {insurerReply.body
                            .split("\n\n")
                            .map((paragraph, index) => {
                                const parts = highlightText(paragraph);
                                return (
                                    <p
                                        key={index}
                                        className="text-gray-700 leading-relaxed"
                                    >
                                        {parts.map((part, partIndex) =>
                                            part.color ? (
                                                <span
                                                    key={partIndex}
                                                    className={`${part.color} px-1 rounded cursor-help hover:bg-yellow-300 transition-colors`}
                                                    onMouseEnter={(e) => {
                                                        const rect = (
                                                            e.target as HTMLElement
                                                        ).getBoundingClientRect();
                                                        setHovered({
                                                            text: part.text,
                                                            explanation:
                                                                part.explanation ||
                                                                "",
                                                            color: part.color,
                                                            position: {
                                                                top: rect.top,
                                                                left:
                                                                    rect.right +
                                                                    10,
                                                            },
                                                        });
                                                    }}
                                                    onMouseLeave={() =>
                                                        setHovered(null)
                                                    }
                                                >
                                                    {part.text}
                                                </span>
                                            ) : (
                                                <span key={partIndex}>
                                                    {part.text}
                                                </span>
                                            )
                                        )}
                                    </p>
                                );
                            })}
                    </div>
                </Card>

                {/* Hover Tooltip */}
                {hovered && (
                    <div
                        className="fixed z-50 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs"
                        style={{
                            top: `${hovered.position?.top}px`,
                            left: `${hovered.position?.left}px`,
                        }}
                    >
                        <p className="text-blue-600 font-semibold mb-1">
                            {hovered.text}
                        </p>
                        <p className="text-gray-700">{hovered.explanation}</p>
                    </div>
                )}

                {/* Recommended Response */}
                <Card className="p-6 bg-orange-50 border-orange-200 mb-6">
                    <h3 className="text-gray-900 mb-3">AI Analysis Summary</h3>
                    <p className="text-gray-700 mb-4">{analysisData.summary}</p>

                    {analysisData.weaknesses &&
                        analysisData.weaknesses.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-semibold text-orange-800 mb-2">
                                    Identified Weaknesses:
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {analysisData.weaknesses.map(
                                        (w: string, i: number) => (
                                            <li
                                                key={i}
                                                className="text-gray-700"
                                            >
                                                {w}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                    {analysisData.actionItems &&
                        analysisData.actionItems.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-orange-800 mb-2">
                                    Recommended Actions:
                                </h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {analysisData.actionItems.map(
                                        (item: string, i: number) => (
                                            <li
                                                key={i}
                                                className="text-gray-700"
                                            >
                                                {item}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                </Card>

                <div className="flex justify-between mb-6">
                    <Button
                        variant="outline"
                        onClick={onBack}
                        size="lg"
                        disabled={isGenerating}
                    >
                        <ArrowLeft className="mr-2 w-5 h-5" />
                        Back
                    </Button>
                    <Button
                        onClick={handleGenerateFollowup}
                        size="lg"
                        className="px-8"
                        disabled={isGenerating}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Drafting Response...
                            </>
                        ) : (
                            <>
                                Draft Follow-up Response
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
