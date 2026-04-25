// import OpenAI from "openai";

// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function summarizeAndTagMessage(input: {
//   text?: string;
//   type: string;
//   metadata?: any;
// }) {
//   if (!input.text && !input.metadata?.title) {
//     return {
//       summary: "",
//       tags: [],
//     };
//   }

//   const prompt = `
// You are organizing Telegram saved messages.

// Return JSON ONLY with:
// {
//   "summary": "short 1 sentence summary",
//   "tags": ["tag1", "tag2"]
// }

// Rules:
// - tags must be lowercase
// - no duplicates
// - max 5 tags
// - be specific, not generic

// Message:
// ${input.text || input.metadata?.title || ""}
// `;

//   try {
//     const res = await client.chat.completions.create({
//       model: "gpt-4o-mini",
//       temperature: 0.3,
//       messages: [{ role: "user", content: prompt }],
//     });

//     const content = res.choices[0]?.message?.content || "{}";

//     const parsed = JSON.parse(content);

//     return {
//       summary: parsed.summary || "",
//       tags: parsed.tags || [],
//     };
//   } catch (err) {
//     console.error("AI error:", err);
//     return { summary: "", tags: [] };
//   }
// }
