import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  // Log an error or throw an error during development,
  // but allow the app to run for cases where AI is not immediately needed
  // or to avoid crashing the app if the key is missing in production temporarily.
  console.error('Missing VITE_OPENAI_API_KEY environment variable. AI features will be disabled.');
}

// Initialize OpenAI client
// It's okay if OPENAI_API_KEY is undefined here; the OpenAI library can be initialized without a key.
// API calls will fail if the key is missing, which should be handled by the calling code.
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  // We need to set dangerouslyAllowBrowser to true for client-side usage.
  // This is generally not recommended for production without proper security measures
  // (e.g., proxying requests through a backend, using temporary keys, or strict CORS policies).
  // For this exercise, we'll proceed with client-side calls.
  dangerouslyAllowBrowser: true,
});

// Example function to generate text (can be expanded or moved)
export async function generateText(prompt: string): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key is not configured. Cannot generate text.");
    // Potentially throw an error or return a specific error object
    return null;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or your preferred model
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0]?.message?.content?.trim() ?? null;
  } catch (error) {
    console.error("Error generating text with OpenAI:", error);
    // Propagate the error or handle it as per application requirements
    throw error;
  }
}
