const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `You are an autonomous industrial data extraction agent for SerialSense. Your sole task is to analyze images of electrical battery containers and return structured data with 100% precision.

Look for two primary data points:
1. Serial Number: Alphanumeric codes located on barcodes, engraved metal plates, or asset tags.
2. Inspection Status: Labels, text, handwritten marks, or stickers indicating "Pass", "Fail", "OK", or "Damaged".

Rules:
- Never guess. If an element is missing or completely unreadable, return null.
- Evaluate your own certainty and provide a confidence score between 0.0 and 1.0.
- You must output strictly valid JSON matching the schema below. Do not wrap the JSON in markdown formatting or include conversational text.`;

/**
 * Analyzes an image URL using OpenAI gpt-4o-mini and returns extracted metadata.
 * @param {string} imageUrl The URL of the image to analyze.
 * @returns {Promise<Object>} The structured JSON output from the AI.
 */
async function analyzeImage(imageUrl) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image according to the system instructions." },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low" // Configured for token optimization
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.0 // Deterministic Output
    });

    const aiOutput = response.choices[0].message.content;
    return JSON.parse(aiOutput);
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
}

module.exports = { analyzeImage };
