"use client";

import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { useState } from "react";

interface ReportViewProps {
  content: string;
}

export function ReportView({ content }: ReportViewProps) {
  const [copied, setCopied] = useState(false);

  if (!content) {
    return <p className="text-gray-500 text-sm">Report not generated yet.</p>;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analysis-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-1" />
          {copied ? "Copied!" : "Copy"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
      <div className="prose prose-invert prose-sm max-w-none bg-gray-900 rounded-lg p-6 border border-gray-800">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}
