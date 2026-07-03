import axios from 'axios';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Summarize a GitHub issue using Gemini 1.5 Flash.
 *
 * Called server-side only — the API key never reaches the browser.
 *
 * Returns a structured object:
 * {
 *   summary:          string   — 2-3 sentence plain English explanation
 *   skills:           string[] — technologies / skills needed
 *   complexity:       'Beginner' | 'Intermediate' | 'Advanced'
 *   complexityReason: string   — one-sentence reasoning
 *   approach:         string   — numbered step-by-step approach
 *   estimatedTime:    string   — e.g. "2–4 hours"
 *   beginnerFit:      boolean
 * }
 */
export async function summarizeIssue({ title, bodyPreview, labels = [], repoFullName, language }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('GEMINI_API_KEY is not configured on the server.'), { status: 503 });
  }

  const labelStr = labels.length > 0 ? labels.join(', ') : 'none';

  const prompt = `You are an expert open-source contributor helping a developer understand a GitHub issue.
Analyse this issue and respond ONLY with a valid JSON object — no markdown, no backticks, no extra text.

Issue Title: ${title}
Repository: ${repoFullName}
Primary Language: ${language || 'unknown'}
Labels: ${labelStr}
Issue Body:
${bodyPreview || '(no description provided)'}

Respond with EXACTLY this JSON structure:
{
  "summary": "2-3 clear sentences explaining what this issue is asking for in plain English",
  "skills": ["skill or technology 1", "skill or technology 2"],
  "complexity": "Beginner or Intermediate or Advanced",
  "complexityReason": "One sentence explaining why this complexity level was chosen",
  "approach": "Step-by-step suggested approach: 1. ... 2. ... 3. ...",
  "estimatedTime": "e.g. 2-4 hours, or 1-2 days",
  "beginnerFit": true or false
}

Rules:
- skills array: 2 to 5 items, specific (e.g. "React hooks", "CSS Grid", "MongoDB aggregation")
- complexity must be exactly one of: Beginner, Intermediate, Advanced
- estimatedTime: honest estimate for someone reasonably familiar with the language
- beginnerFit: true only if the issue is genuinely approachable for someone new to open source
- If the body is empty or very short, base your analysis only on the title and labels`;

  const { data } = await axios.post(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature:     0.3,   // low temp = consistent structured output
        maxOutputTokens: 512,
        topP:            0.8,
      },
    },
    { timeout: 15000 }
  );

  // Extract the raw text from Gemini's response
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // Strip any accidental markdown fences Gemini might add despite instructions
  const clean = rawText
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch {
    throw Object.assign(
      new Error('Gemini returned an unparseable response. Please try again.'),
      { status: 502 }
    );
  }

  // Validate and sanitize required fields
  return {
    summary:          String(parsed.summary          || ''),
    skills:           Array.isArray(parsed.skills) ? parsed.skills.slice(0, 5) : [],
    complexity:       ['Beginner', 'Intermediate', 'Advanced'].includes(parsed.complexity)
                        ? parsed.complexity
                        : 'Intermediate',
    complexityReason: String(parsed.complexityReason || ''),
    approach:         String(parsed.approach         || ''),
    estimatedTime:    String(parsed.estimatedTime    || ''),
    beginnerFit:      Boolean(parsed.beginnerFit),
  };
}
