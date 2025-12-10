import { useState, useEffect } from "react";
import {
    Lightbulb,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    MessageCircle,
    Loader2,
    Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProgressBar } from "./ProgressBar";
import type { ParsedData } from "../App";
import { apiUrl } from "../config";

type AppealStrategyProps = {
    caseId: string;
    userId: string;
    parsedData: ParsedData;
    onDraftEmail: (draft: { subject: string; body: string }) => void;
    onBack: () => void;
    onDelete?: () => void;
};

type HighlightedTerm = {
    term: string;
    definition: string;
    position: { top: number; left: number };
};

type RAGAnalysisResult = {
    analysis: string;
    terms: { term: string; definition: string }[];
    contextUsed: string[];
};

type EmailDraftResult = {
    emailDraft: { subject: string; body: string };
};

export function AppealStrategy({
    caseId,
    userId,
    parsedData,
    onDraftEmail,
    onBack,
    onDelete,
}: AppealStrategyProps) {
    const [hoveredTerm, setHoveredTerm] = useState<HighlightedTerm | null>(
        null
    );
    const [analysisResult, setAnalysisResult] =
        useState<RAGAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                setIsLoading(true);

                // Wait 1 second before showing results (simulating processing time)
                await new Promise((resolve) => setTimeout(resolve, 1000));

                // Use hardcoded data instead of calling RAG pipeline
                const hardcodedData: RAGAnalysisResult = {
                    analysis:
                        'Your claim for Vitamin D and TSH tests was denied because Cigna determined they were "Not Medically Necessary" for the emergency room visit. Cigna argues these tests are "non-emergent, primary care screenings" that do not change rapidly and would not have influenced the immediate management of your reported symptoms, such as the fall or gastrointestinal distress. Because your policy covers services only when consistent with symptoms and not for convenience, Cigna asserts these specific tests should have been done in an outpatient setting.\n\nHowever, there are several strong arguments against this denial based on your policy\'s specific terms. First, Cigna failed to follow its own procedural rules for Colorado appeals. Your policy explicitly states on page 82 that all written denials based on medical necessity "must be signed by a licensed physician/dentist familiar with standards of care in Colorado" and that a nurse or processor cannot sign on their behalf. Your denial letter is signed generically by the "Utilization Review Department," with no individual physician\'s signature, which appears to violate this requirement.\n\nSecond, the denial incorrectly classifies these tests as routine "screenings" rather than part of a covered "medical screening examination". Your policy defines "Emergency Services" to include ancillary services necessary to evaluate an Emergency Medical Condition. Given that you presented with a fall and gastrointestinal distress, a treating physician may order TSH levels to rule out thyroid dysfunction as the cause of dizziness or metabolic issues, making the test diagnostic rather than routine. Retrospectively labeling these tests as unnecessary ignores the "Prudent Layperson" standard in your policy, which covers emergency care based on the severity of symptoms a layperson perceives, rather than the final diagnosis. By evaluating the claim solely on the final lab results rather than the presenting symptoms, Cigna is failing to cover the evaluation expressly promised under the Emergency Services benefit.',
                    terms: [
                        {
                            term: "medical screening examination",
                            definition:
                                "The process and tests performed in an emergency room to determine if an emergency medical condition exists.",
                        },
                        {
                            term: "Prudent Layperson",
                            definition:
                                "A legal standard defining an emergency based on a regular person's judgment of symptom severity, protecting patients from having coverage denied just because the final diagnosis turned out to be minor.",
                        },
                        {
                            term: "ancillary services",
                            definition:
                                "Supplemental medical services, such as laboratory tests or x-rays, that support the primary physician's diagnosis and treatment.",
                        },
                        {
                            term: "retrospectively",
                            definition:
                                "Looking back at a medical event after it has happened to make a judgment, often used by insurers to deny claims based on the final outcome rather than the symptoms present at the time.",
                        },
                        {
                            term: "utilization review",
                            definition:
                                "The process where an insurance company evaluates the medical necessity, appropriateness, and efficiency of health care services.",
                        },
                        {
                            term: "Medically Necessary",
                            definition:
                                "Services or supplies that Cigna determines are appropriate for your symptoms or diagnosis, provided for direct care, meet generally accepted medical standards, and are not primarily for the convenience of you or the provider.",
                        },
                        {
                            term: "non-emergent, primary care screenings",
                            definition:
                                "A description used in your denial letter to categorize specific lab tests (Vitamin D and TSH) as routine checks that do not change rapidly or influence immediate emergency treatment, implying they should be done in an outpatient setting rather than an ER.",
                        },
                    ],
                    contextUsed: [],
                };

                setAnalysisResult(hardcodedData);
            } catch (err) {
                console.error("Error analyzing case:", err);
                setError("Failed to generate analysis. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [caseId, userId]);

    const handleTextClick = (
        term: string,
        definition: string,
        event: React.MouseEvent
    ) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setHoveredTerm({
            term,
            definition,
            position: { top: rect.top, left: rect.right + 10 },
        });
    };

    const renderHighlightedText = (
        text: string,
        highlights: { term: string; definition: string }[]
    ) => {
        if (!highlights || highlights.length === 0) return <span>{text}</span>;

        const textLower = text.toLowerCase();
        const matches: {
            start: number;
            end: number;
            term: string;
            definition: string;
        }[] = [];

        // Find all occurrences of all terms
        highlights.forEach(({ term, definition }) => {
            const termLower = term.toLowerCase();
            let searchIndex = 0;
            while (true) {
                const index = textLower.indexOf(termLower, searchIndex);
                if (index === -1) break;

                matches.push({
                    start: index,
                    end: index + term.length,
                    term: text.substring(index, index + term.length), // Preserve original case
                    definition,
                });

                searchIndex = index + 1;
            }
        });

        // Sort matches by position in text
        matches.sort((a, b) => a.start - b.start);

        // Remove overlapping matches (keep the first one)
        const nonOverlapping: typeof matches = [];
        for (const match of matches) {
            const overlaps = nonOverlapping.some(
                (existing) =>
                    match.start < existing.end && match.end > existing.start
            );
            if (!overlaps) {
                nonOverlapping.push(match);
            }
        }

        // Build parts array
        const parts: {
            text: string;
            isHighlight: boolean;
            term?: string;
            definition?: string;
        }[] = [];
        let lastIndex = 0;

        nonOverlapping.forEach((match) => {
            if (match.start > lastIndex) {
                parts.push({
                    text: text.substring(lastIndex, match.start),
                    isHighlight: false,
                });
            }
            parts.push({
                text: match.term,
                isHighlight: true,
                term: match.term,
                definition: match.definition,
            });
            lastIndex = match.end;
        });

        if (lastIndex < text.length) {
            parts.push({
                text: text.substring(lastIndex),
                isHighlight: false,
            });
        }

        return (
            <>
                {parts.map((part, index) =>
                    part.isHighlight ? (
                        <span
                            key={index}
                            className="bg-yellow-200 px-1 rounded cursor-help hover:bg-yellow-300 transition-colors"
                            onClick={(e) =>
                                handleTextClick(part.term!, part.definition!, e)
                            }
                            onMouseEnter={(e) =>
                                handleTextClick(part.term!, part.definition!, e)
                            }
                            onMouseLeave={() => setHoveredTerm(null)}
                        >
                            {part.text}
                        </span>
                    ) : (
                        <span key={index}>{part.text}</span>
                    )
                )}
            </>
        );
    };

    const handleDraft = async () => {
        try {
            setIsGeneratingEmail(true);
            setError(null);

            // Wait 1 second before showing results (simulating processing time)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Use hardcoded email draft instead of calling RAG pipeline
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

            onDraftEmail({
                subject: `Appeal for Claim Denial - Policy #${parsedData.policyNumber}`,
                body: hardcodedEmailBody,
            });
        } catch (err) {
            console.error("Error generating email:", err);
            setError("Failed to generate email draft. Please try again.");
        } finally {
            setIsGeneratingEmail(false);
        }
    };

    const progressSteps = [
        "Choose Plan",
        "Upload Documents",
        "Strategy",
        "Send",
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">
                    Analyzing your case...
                </h2>
                <p className="text-gray-600 mt-2">
                    Our AI is reviewing your policy and denial documents.
                </p>
            </div>
        );
    }

    if (error || !analysisResult) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">
                    Analysis Failed
                </h2>
                <p className="text-gray-600 mt-2 mb-6">
                    {error || "Something went wrong."}
                </p>
                <Button onClick={onBack}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <ProgressBar currentStep={2} steps={progressSteps} />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-gray-900 mb-2">
                        Your Appeal Strategy Analysis
                    </h1>
                    <p className="text-gray-600">
                        We've analyzed your documents and identified key points
                        for your appeal.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Denial Analysis */}
                    <Card className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                AI Analysis
                            </h2>
                        </div>
                        <div className="pl-13">
                            <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                                {renderHighlightedText(
                                    analysisResult.analysis,
                                    analysisResult.terms
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Hover Tooltip */}
                    {hoveredTerm && (
                        <div
                            className="fixed z-50 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs"
                            style={{
                                top: `${hoveredTerm.position.top}px`,
                                left: `${hoveredTerm.position.left}px`,
                            }}
                        >
                            <p className="text-blue-600 mb-1">
                                {hoveredTerm.term}
                            </p>
                            <p className="text-gray-700">
                                {hoveredTerm.definition}
                            </p>
                        </div>
                    )}

                    {/* Recommendation */}
                    <Card className="p-6 border-2 border-green-500 bg-green-50">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-gray-900 mb-2">
                                    Our Recommendation
                                </h2>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg mb-4">
                                    <span>Case Correction</span>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    Based on the AI analysis, we have drafted a
                                    professional appeal letter for you.
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onBack}
                                size="lg"
                            >
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
                            onClick={handleDraft}
                            size="lg"
                            className="px-8"
                            disabled={isGeneratingEmail}
                        >
                            {isGeneratingEmail ? (
                                <>
                                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                    Generating Email...
                                </>
                            ) : (
                                <>
                                    Draft Email
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
