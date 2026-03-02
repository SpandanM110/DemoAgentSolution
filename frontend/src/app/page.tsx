"use client";

import { DocumentUpload } from "@/components/upload/document-upload";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Multi-Agent Problem Solver
          </h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto">
            Upload an organizational document and let our AI agents analyze problems,
            prioritize tasks, and generate comprehensive solutions.
          </p>
        </div>

        <DocumentUpload />

        <div className="grid grid-cols-3 gap-4 text-sm text-gray-500 pt-4">
          <div className="space-y-1">
            <p className="font-medium text-gray-300">7 AI Agents</p>
            <p>Specialized analysis pipeline</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-300">Real-time</p>
            <p>Live progress streaming</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-gray-300">Executive Reports</p>
            <p>Actionable insights</p>
          </div>
        </div>
      </div>
    </main>
  );
}
