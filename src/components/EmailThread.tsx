import React, { useState } from "react";
import { ArrowLeft, Mail, Send, Inbox } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import type { EmailMessage } from "../App";

type EmailThreadProps = {
    emailThread: EmailMessage[];
    userEmail: string;
    onBack: () => void;
};

type HighlightedComment = {
    text: string;
    type: "positive" | "concern" | "suggestion" | "opportunity";
    position: { top: number; left: number };
};

export function EmailThread({
    emailThread,
    userEmail,
    onBack,
}: EmailThreadProps) {
    const [hoveredComment, setHoveredComment] =
        useState<HighlightedComment | null>(null);

    const getEmailAnalysis = (email: EmailMessage) => {
        if (email.type === "sent") {
            return [
                {
                    phrase: "Strong opening",
                    comment:
                        "Strong opening that establishes the purpose clearly",
                    type: "positive" as const,
                },
                {
                    phrase: "policy language",
                    comment:
                        "Effective use of policy language to support your argument",
                    type: "positive" as const,
                },
                {
                    phrase: "specific dates",
                    comment:
                        "Consider adding specific dates for stronger documentation",
                    type: "suggestion" as const,
                },
            ];
        } else {
            return [
                {
                    phrase: "generic language",
                    comment:
                        "Response uses generic language without addressing specific policy sections",
                    type: "concern" as const,
                },
                {
                    phrase: "physician's documentation",
                    comment:
                        "They haven't addressed your physician's documentation - highlight this in follow-up",
                    type: "opportunity" as const,
                },
                {
                    phrase: "acknowledge receipt",
                    comment:
                        "They acknowledge receipt and timeline, which is procedurally important",
                    type: "positive" as const,
                },
            ];
        }
    };

    const handleTextHover = (
        comment: string,
        type: HighlightedComment["type"],
        event: React.MouseEvent
    ) => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        setHoveredComment({
            text: comment,
            type,
            position: { top: rect.top, left: rect.right + 10 },
        });
    };

    const renderHighlightedEmail = (email: EmailMessage) => {
        const analysis = getEmailAnalysis(email);
        let bodyText = email.body;
        const parts: {
            text: string;
            isHighlight: boolean;
            comment?: string;
            type?: HighlightedComment["type"];
        }[] = [];
        let lastIndex = 0;

        // Find and highlight phrases
        analysis.forEach(({ phrase, comment, type }) => {
            const index = bodyText
                .toLowerCase()
                .indexOf(phrase.toLowerCase(), lastIndex);
            if (index !== -1) {
                if (index > lastIndex) {
                    parts.push({
                        text: bodyText.substring(lastIndex, index),
                        isHighlight: false,
                    });
                }
                parts.push({
                    text: bodyText.substring(index, index + phrase.length),
                    isHighlight: true,
                    comment,
                    type,
                });
                lastIndex = index + phrase.length;
            }
        });

        if (lastIndex < bodyText.length) {
            parts.push({
                text: bodyText.substring(lastIndex),
                isHighlight: false,
            });
        }

        const getHighlightColor = (type?: HighlightedComment["type"]) => {
            switch (type) {
                case "positive":
                    return "bg-green-200 hover:bg-green-300";
                case "concern":
                    return "bg-red-200 hover:bg-red-300";
                case "suggestion":
                    return "bg-blue-200 hover:bg-blue-300";
                case "opportunity":
                    return "bg-yellow-200 hover:bg-yellow-300";
                default:
                    return "bg-yellow-200 hover:bg-yellow-300";
            }
        };

        return (
            <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {parts.map((part, index) =>
                    part.isHighlight ? (
                        <span
                            key={index}
                            className={`${getHighlightColor(
                                part.type
                            )} px-1 rounded cursor-help transition-colors`}
                            onMouseEnter={(e) =>
                                handleTextHover(part.comment!, part.type!, e)
                            }
                            onMouseLeave={() => setHoveredComment(null)}
                        >
                            {part.text}
                        </span>
                    ) : (
                        <span key={index}>{part.text}</span>
                    )
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <Button variant="outline" onClick={onBack} className="mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Case Details
                </Button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Email Thread
                    </h1>
                    <p className="text-gray-600">
                        View your complete email conversation with the insurance
                        company
                    </p>
                </div>

                <div className="space-y-4">
                    {emailThread.map((email, index) => (
                        <Card
                            key={email.id}
                            className={`p-6 ${
                                email.type === "sent"
                                    ? "bg-blue-50 border-blue-200"
                                    : "bg-white"
                            }`}
                        >
                            <div className="flex items-start gap-4 mb-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        email.type === "sent"
                                            ? "bg-blue-600"
                                            : "bg-green-600"
                                    }`}
                                >
                                    {email.type === "sent" ? (
                                        <Send className="w-5 h-5 text-white" />
                                    ) : (
                                        <Inbox className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">
                                                    {email.type === "sent"
                                                        ? "You"
                                                        : email.from.split(
                                                              "@"
                                                          )[0]}
                                                </span>
                                                <Badge
                                                    variant={
                                                        email.type === "sent"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {email.type === "sent"
                                                        ? "Sent"
                                                        : "Received"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {email.type === "sent"
                                                    ? `To: ${email.to}`
                                                    : `From: ${email.from}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(
                                                    email.date
                                                ).toLocaleString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        {email.subject}
                                    </h3>
                                    <div className="bg-white p-4 rounded-lg border">
                                        {/* Preserve explicit newlines by splitting body into lines
                                            and rendering each line (with highlighting) as its own block.
                                            This ensures \n becomes visible as line breaks. */}
                                        {email.body.split("\n").map((line, i, arr) =>
                                            line === "" ? (
                                                // render empty lines as a visible gap
                                                <div key={i} className="py-1" />
                                            ) : (
                                                <div
                                                    key={i}
                                                    className="whitespace-pre-wrap"
                                                >
                                                    {renderHighlightedEmail({
                                                        ...email,
                                                        body: line,
                                                    })}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {emailThread.length === 0 && (
                    <Card className="p-12 text-center">
                        <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            No Emails Yet
                        </h2>
                        <p className="text-gray-600">
                            Once you send your appeal, the email thread will
                            appear here.
                        </p>
                    </Card>
                )}
            </div>

            {/* Hover Tooltip */}
            {hoveredComment && (
                <div
                    className="fixed z-50 max-w-xs p-3 rounded-lg shadow-lg border"
                    style={{
                        top: `${hoveredComment.position.top}px`,
                        left: `${hoveredComment.position.left}px`,
                        backgroundColor:
                            hoveredComment.type === "positive"
                                ? "#f0fdf4"
                                : hoveredComment.type === "concern"
                                ? "#fef2f2"
                                : hoveredComment.type === "suggestion"
                                ? "#eff6ff"
                                : "#fefce8",
                        borderColor:
                            hoveredComment.type === "positive"
                                ? "#86efac"
                                : hoveredComment.type === "concern"
                                ? "#fca5a5"
                                : hoveredComment.type === "suggestion"
                                ? "#93c5fd"
                                : "#fde047",
                    }}
                >
                    <p
                        className={`text-sm font-medium mb-1 ${
                            hoveredComment.type === "positive"
                                ? "text-green-800"
                                : hoveredComment.type === "concern"
                                ? "text-red-800"
                                : hoveredComment.type === "suggestion"
                                ? "text-blue-800"
                                : "text-yellow-800"
                        }`}
                    >
                        {hoveredComment.type === "positive"
                            ? "✓ Strength"
                            : hoveredComment.type === "concern"
                            ? "⚠ Concern"
                            : hoveredComment.type === "suggestion"
                            ? "💡 Suggestion"
                            : "🎯 Opportunity"}
                    </p>
                    <p className="text-sm text-gray-700">
                        {hoveredComment.text}
                    </p>
                </div>
            )}
        </div>
    );
}
