import { Mail, Lightbulb, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProgressBar } from "./ProgressBar";
import type { Case } from "../App";
import { useState } from "react";

type ReplyReceivedProps = {
  case: Case;
  onDraftFollowup: () => void;
  onBack: () => void;
};

export function ReplyReceived({
  case: caseItem,
  onDraftFollowup,
  onBack,
}: ReplyReceivedProps) {
  const latestReply = caseItem.emailThread
    .filter((e) => e.type === "received")
    .pop();

  const insurerReply = {
    from: latestReply?.from || "claims@healthguard.com",
    subject: latestReply?.subject || "Re: Appeal for Claim Denial",
    date: latestReply?.date
      ? new Date(latestReply.date).toLocaleString()
      : "October 27, 2025 at 2:34 PM",
    body: `Dear Policyholder,

Thank you for your appeal regarding claim #${caseItem.parsedData?.policyNumber}.

We have reviewed your submitted documentation and appeal letter. However, after careful consideration by our medical review team, we must uphold our original denial determination.

Our medical director has determined that the requested service does not meet the criteria for medical necessity as outlined in our clinical guidelines. While we understand your physician recommended this treatment, our internal medical review process applies evidence-based medical criteria that must be met for coverage approval.

You have the right to request an external review by an independent medical reviewer if you disagree with this determination. Information about the external review process is attached.

Please contact our member services department if you have any questions.

Sincerely,
${caseItem.insuranceCompany} Claims Department`,
  };

  const analysis = [
    {
      color: "bg-red-100",
      label: "Misleading",
      items: [
        {
          text: "clinical guidelines",
          explanation:
            "They're referencing internal guidelines, not your policy terms. This is a common tactic to avoid honoring the actual policy language.",
        },
      ],
    },
    {
      color: "bg-blue-100",
      label: "Technical Jargon",
      items: [
        {
          text: "evidence-based medical criteria",
          explanation:
            "They're applying stricter criteria than what's written in your policy. Your policy doesn't require evidence-based standards.",
        },
      ],
    },
    {
      color: "bg-green-100",
      label: "Opportunity",
      items: [
        {
          text: "external review",
          explanation:
            "This is good! They're informing you of escalation options. You may want to pursue this if the second appeal fails.",
        },
      ],
    },
  ];

  const [hovered, setHovered] = useState<{
    text: string;
    explanation: string;
    color?: string;
    position?: { top: number; left: number };
  } | null>(null);

  const highlightText = (text: string) => {
    const highlights = [
      { phrase: "clinical guidelines", color: "bg-red-100" },
      { phrase: "evidence-based medical criteria", color: "bg-blue-100" },
      { phrase: "external review", color: "bg-green-100" },
    ];

    let parts: { text: string; color?: string; explanation?: string }[] = [];
    let lastIndex = 0;

    // Find all occurrences
    const matches: {
      start: number;
      end: number;
      color: string;
      phrase: string;
      explanation: string;
    }[] = [];
    highlights.forEach(({ phrase, color }) => {
      const regex = new RegExp(phrase, "gi");
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
          // find explanation for this phrase from analysis
          const found = analysis
            .flatMap((a) => a.items)
            .find((i) => i.text.toLowerCase() === match![0].toLowerCase());
          matches.push({
          start: match.index,
          end: match.index + match[0].length,
          color,
          phrase: match[0],
          explanation: found ? found.explanation : "",
        });
      }
    });

    // Sort by position
    matches.sort((a, b) => a.start - b.start);

    // Build parts
    matches.forEach(({ start, end, color, explanation }) => {
      if (start > lastIndex) {
        parts.push({ text: text.substring(lastIndex, start) });
      }
      parts.push({ text: text.substring(start, end), color, explanation });
      lastIndex = end;
    });

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex) });
    }

    return parts;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={3} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-gray-900">Insurance Company Response</h1>
            <Badge className="bg-orange-600">Needs Response</Badge>
          </div>
          <p className="text-gray-600">
            The insurance company has responded to your appeal. We've analyzed
            their reply below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Side - Insurer's Reply */}
          <div>
            <Card className="p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">Insurer's Reply</h2>
              </div>

              {/* Email Header */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-500">From:</span>
                  <span className="text-gray-900">{insurerReply.from}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-900">{insurerReply.date}</span>
                </div>
                <div>
                  <span className="text-gray-500">Subject:</span>
                  <p className="text-gray-900 mt-1">{insurerReply.subject}</p>
                </div>
              </div>

              {/* Email Body with Color-Coded Highlighting */}
              <div className="space-y-4">
                {insurerReply.body.split("\n\n").map((paragraph, index) => {
                  const parts = highlightText(paragraph);
                  return (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {parts.map((part, partIndex) =>
                        part.color ? (
                          <span
                            key={partIndex}
                            className={`${part.color} px-1 rounded cursor-pointer`}
                            onMouseEnter={(e) => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              setHovered({
                                text: part.text,
                                explanation: part.explanation || "",
                                color: part.color,
                                position: {
                                  top: rect.top,
                                  left: rect.right + 10,
                                },
                              });
                            }}
                            onMouseLeave={() => setHovered(null)}
                          >
                            {part.text}
                          </span>
                        ) : (
                          <span key={partIndex}>{part.text}</span>
                        )
                      )}
                    </p>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Side - Analysis */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">Our Analysis</h2>
              </div>
              <p className="text-gray-600 mb-6">
                We've identified key points in their response that you should
                address in your follow-up.
              </p>

              <div className="space-y-6">
                {analysis.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-4 h-4 rounded ${category.color}`}
                      ></div>
                      <span className="text-gray-900">{category.label}</span>
                    </div>
                    <div className="space-y-3">
                      {category.items.map((item, itemIndex) => {
                        const isHovered =
                          hovered &&
                          hovered.text.toLowerCase() ===
                            item.text.toLowerCase();
                        return (
                          <div
                            key={itemIndex}
                            className={`p-4 rounded-lg ${
                              category.color
                            } border-l-4 ${
                              isHovered ? "shadow-lg scale-101 transform" : ""
                            }`}
                          >
                            <p className="text-gray-900 mb-2">
                              <strong>"{item.text}"</strong>
                            </p>
                            <p className="text-gray-700">{item.explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-orange-50 border-orange-200">
              <h3 className="text-gray-900 mb-3">Recommended Response</h3>
              <p className="text-gray-700 mb-4">
                This is a <strong>standard denial response</strong> that doesn't
                address the specific policy conflicts you raised. They're
                referencing their internal guidelines instead of your policy
                terms.
              </p>
              <p className="text-gray-700">
                <strong>Your next step:</strong> Draft a follow-up that points
                out they haven't addressed the policy sections you cited and
                requests clarification on how their clinical guidelines override
                your policy.
              </p>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={onBack} size="lg">
                <ArrowLeft className="mr-2 w-5 h-5" />
                Back
              </Button>
              <Button onClick={onDraftFollowup} size="lg" className="px-8">
                Draft Follow-up Response
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
