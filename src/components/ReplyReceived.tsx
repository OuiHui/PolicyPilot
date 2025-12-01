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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const insurerReply = {
    from: latestReply?.from || "claims@healthguard.com",
    subject: latestReply?.subject || "Re: Appeal for Claim Denial",
    date: latestReply?.date
      ? new Date(latestReply.date).toLocaleString()
      : new Date().toLocaleString(),
    body: latestReply?.body || "No content available.",
  };

  // Map analysis data to UI format
  const analysisData = latestReply?.analysis || {
    terms: [],
    weaknesses: [],
    summary: "No analysis available.",
    actionItems: []
  };

  const [hovered, setHovered] = useState<{
    text: string;
    explanation: string;
    color?: string;
    position?: { top: number; left: number };
  } | null>(null);

  const highlightText = (text: string) => {
    // We only highlight terms for now, as weaknesses might be abstract concepts not in text
    const highlights = (analysisData.terms || []).map(t => ({
        phrase: t.term,
        color: "bg-yellow-200",
        explanation: t.definition
    }));

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
    
    highlights.forEach(({ phrase, color, explanation }) => {
      // Escape special characters in phrase for regex
      const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    matches.forEach(m => {
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
      parts.push({ text: text.substring(start, end), color, explanation });
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
        const response = await fetch(apiUrl(`/api/cases/${caseItem.id}/generate-followup`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.emailDraft) {
                onDraftGenerated(result.emailDraft);
            }
        } else {
            console.error("Failed to generate follow-up");
            alert("Failed to generate follow-up email. Please try again.");
        }
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
            <h1 className="text-gray-900">Insurance Company Response</h1>
            <Badge className="bg-orange-600">Needs Response</Badge>
          </div>
          <p className="text-gray-600">
            Hover over highlighted terms in the email to see our analysis.
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
                        className={`${part.color} px-1 rounded cursor-help hover:bg-yellow-300 transition-colors`}
                        onMouseEnter={(e) => {
                          const rect = (
                            e.target as HTMLElement
                          ).getBoundingClientRect();
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

        {/* Hover Tooltip */}
        {hovered && (
          <div
            className="fixed z-50 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-xs"
            style={{
              top: `${hovered.position?.top}px`,
              left: `${hovered.position?.left}px`,
            }}
          >
            <p className="text-blue-600 font-semibold mb-1">{hovered.text}</p>
            <p className="text-gray-700">{hovered.explanation}</p>
          </div>
        )}

        {/* Recommended Response */}
        <Card className="p-6 bg-orange-50 border-orange-200 mb-6">
          <h3 className="text-gray-900 mb-3">AI Analysis Summary</h3>
          <p className="text-gray-700 mb-4">
            {analysisData.summary}
          </p>
          
          {analysisData.weaknesses && analysisData.weaknesses.length > 0 && (
            <div className="mb-4">
                <h4 className="font-semibold text-orange-800 mb-2">Identified Weaknesses:</h4>
                <ul className="list-disc pl-5 space-y-1">
                    {analysisData.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="text-gray-700">{w}</li>
                    ))}
                </ul>
            </div>
          )}

          {analysisData.actionItems && analysisData.actionItems.length > 0 && (
             <div>
                <h4 className="font-semibold text-orange-800 mb-2">Recommended Actions:</h4>
                <ul className="list-disc pl-5 space-y-1">
                    {analysisData.actionItems.map((item: string, i: number) => (
                        <li key={i} className="text-gray-700">{item}</li>
                    ))}
                </ul>
             </div>
          )}
        </Card>

        <div className="flex justify-between mb-6">
          <Button variant="outline" onClick={onBack} size="lg" disabled={isGenerating}>
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back
          </Button>
          <Button onClick={handleGenerateFollowup} size="lg" className="px-8" disabled={isGenerating}>
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
