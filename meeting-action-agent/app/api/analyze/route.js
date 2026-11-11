import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || transcript.trim() === "") {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }

    const systemPrompt = `
You are an expert AI Executive Meeting Assistant.
Analyze the provided meeting transcript and extract:
1. Executive Summary: Short human-readable recap.
2. Decisions: Key agreements made during the meeting.
3. Action Items: Actionable tasks, with owner, explicit or implied deadline, and priority (High/Medium/Low).
4. Unresolved Questions: Open topics or doubts that need future answers.
5. Contradictions or Ambiguities: Conflicting statements, unclear instructions, or overlapping task ownership.

Output strictly valid JSON with no markdown wrapping, backticks, or extra commentary. Structure:
{
  "summary": "string",
  "decisions": ["string"],
  "action_items": [
    {
      "task": "string",
      "owner": "string",
      "deadline": "string",
      "priority": "High" | "Medium" | "Low"
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

    const baseUrl =
      process.env.FREE_LLM_BASE_URL || "http://127.0.0.1:31415/v1";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FREE_LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Groq ka best & free model
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Here is the meeting transcript:\n\n${transcript}`,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      return NextResponse.json(
        { error: `LLM API Error: ${errData}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content.trim();

    const cleanedJsonString = rawContent
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "");
    const parsedData = JSON.parse(cleanedJsonString);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error in analyze API:", error);
    return NextResponse.json(
      { error: "Failed to process meeting transcript", details: error.message },
      { status: 500 },
    );
  }
}
