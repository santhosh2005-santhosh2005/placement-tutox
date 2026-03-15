import express, { Router, Request, Response } from 'express';
import { callGemini, parseLLMResponse, saveEvaluationToSession, recordMetric, isRetryableStatus } from '../services/gradingService';
import { validateGrading } from '../schemas/gradingSchema';

const router: Router = express.Router();

// Grading endpoint
router.post('/interviews/:sessionId/grade', async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const { questionId, answer, answerType = "text", meta = {} } = req.body || {};
  
  // Validate required fields
  if (!questionId || !answer) {
    return res.status(400).json({ 
      status: "failed", 
      message: "missing questionId or answer" 
    });
  }

  // Build prompt (server-side template)
  const prompt = `
You are an objective interview grader. Input: a question and a candidate's answer. Return ONLY JSON matching this schema:
{
  "score": number between 0 and 100,
  "rubric": { "correctness": 0-1, "efficiency": 0-1, "explainability": 0-1 },
  "feedback": "short text",
  "evidence": { "keywords": [...], "missing_points": [...] }
}

Question: "${questionId}"
Answer: "${answer}"
Constraints: Keep JSON compact. Ensure rubric values sum logically (not necessarily 1).
`;

  let attempt = 0;
  const maxAttempts = 2;
  
  while (attempt <= maxAttempts) {
    try {
      // Record attempt
      recordMetric("grading_attempt", { sessionId, questionId, attempt });
      
      const raw = await callGemini(prompt, 15000);
      
      // Try parse JSON. If LLM returns text with JSON, extract JSON object substring.
      let parsed;
      try {
        parsed = parseLLMResponse(raw);
      } catch (e: any) {
        throw new Error("LLM returned non-JSON: " + (e.message || String(e)));
      }
      
      // Validate structure
      const valid = validateGrading(parsed);
      if (!valid) {
        throw new Error("invalid grading schema: " + JSON.stringify(validateGrading.errors));
      }

      // Persist evaluation to DB
      await saveEvaluationToSession(sessionId, questionId, parsed);

      // Metrics log
      recordMetric("grading_success", { sessionId, questionId, attempts: attempt + 1 });

      return res.status(200).json({ status: "ok", ...parsed });
    } catch (err: any) {
      attempt++;
      const status = err?.response?.status;
      const retryable = status ? isRetryableStatus(status) : 
        (err.message && /timeout|ECONNRESET|ETIMEDOUT/i.test(err.message)) ||
        (err.code && ['ECONNABORTED', 'ENOTFOUND', 'EAI_AGAIN'].includes(err.code));
      
      console.error("grading attempt", attempt - 1, "error:", err?.response?.data || err.message);

      // Generate a trace ID for debugging
      const traceId = `grade-${sessionId}-${questionId}-${Date.now()}`;

      if (retryable && attempt <= maxAttempts) {
        // Wait before retry with exponential backoff
        await new Promise(r => setTimeout(r, attempt === 1 ? 500 : 1500));
        continue;
      }

      if (retryable) {
        // Exhausted retries
        recordMetric("grading_retry_exhausted", { sessionId, questionId, attempts: attempt, traceId });
        return res.status(503).json({ 
          status: "retryable_error", 
          message: "Temporary error evaluating answer. Please try again.",
          traceId
        });
      } else {
        recordMetric("grading_permanent_fail", { sessionId, questionId, error: err.message, traceId });
        return res.status(500).json({ 
          status: "failed", 
          message: "Could not evaluate answer: " + (err.message || "unknown"),
          traceId
        });
      }
    }
  }
});

export default router;