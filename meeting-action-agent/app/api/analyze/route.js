import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || !transcript.trim()) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.FREE_LLM_API_KEY;
    const baseUrl = process.env.FREE_LLM_BASE_URL;
    // FreeLLMAPI par Gemini 3.7 Flash active model hai
    const model = process.env.FREE_LLM_MODEL || "gemini-3.7-flash";

    if (!apiKey || !baseUrl || !model) {
      return NextResponse.json(
        { error: "Missing FreeLLMAPI environment variables" },
        { status: 500 }
      );
    }

    const systemPrompt = `
You are an expert AI Executive Meeting Assistant.

Analyze the meeting transcript and extract:
1. Executive Summary
2. Decisions
3. Action Items with owner, deadline and priority
4. Unresolved Questions
5. Contradictions or Ambiguities

Return strictly valid JSON:
{
  "summary": "string",
  "decisions": ["string"],
  "action_items": [
    {
      "task": "string",
      "owner": "string",
      "deadline": "string",
      "priority": "High | Medium | Low"
    }
  ],
  "unresolved_questions": ["string"],
  "contradictions_and_ambiguities": [
    {
      "issue": "string",
      "context": "string"
    }
  ]
}
`;

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Bypass-Tunnel-Reminder": "true",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Meeting transcript:\n\n${transcript}`,
            },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("FreeLLMAPI Error:", errorText);

      return NextResponse.json(
        { error: `FreeLLMAPI Error: ${errorText}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    const rawContent =
      result.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Empty response from AI provider");
    }

    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsedData = JSON.parse(cleaned);

    return NextResponse.json({
      success: true,
      data: parsedData,
    });

  } catch (error) {
    console.error("Analyze API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to process meeting transcript",
        details: error.message,
      },
      { status: 500 }
    );
  }
}