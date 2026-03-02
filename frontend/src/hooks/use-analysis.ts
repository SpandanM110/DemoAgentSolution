"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, startAnalysis, getResults } from "@/lib/api";
import { useAnalysisStore } from "@/stores/analysis-store";

export function useAnalysis() {
  const router = useRouter();
  const { setSession, setStatus, setResults } = useAnalysisStore();

  const handleUploadAndAnalyze = useCallback(
    async (file: File) => {
      try {
        setStatus("uploading");

        // Upload
        const uploadRes = await uploadDocument(file);
        setSession(uploadRes.session_id, uploadRes.filename);

        // Start analysis
        setStatus("running");
        await startAnalysis(uploadRes.session_id);

        // Navigate to dashboard
        router.push(`/analysis/${uploadRes.session_id}`);
      } catch (err) {
        setStatus("error");
        throw err;
      }
    },
    [setSession, setStatus, router]
  );

  const fetchResults = useCallback(
    async (sessionId: string) => {
      const results = await getResults(sessionId);
      setResults({
        problems: results.problems || [],
        tasks: results.prioritized_tasks || [],
        specialistOutputs: results.specialist_outputs || [],
        synthesizedSolution: results.synthesized_solution || null,
        finalReport: results.final_report || null,
        errors: results.errors || [],
      });
    },
    [setResults]
  );

  return { handleUploadAndAnalyze, fetchResults };
}
