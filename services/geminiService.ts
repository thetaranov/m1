import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SUPPORT_SYSTEM_INSTRUCTION = `
You are the "bbqp Product Specialist". You are an expert on the bbqp dual-mode grill/oven.
Your goal is to help potential customers understand the unique features of the grill and guide them towards selecting a model.

Key Product Features to emphasize:
1. Dual Mode (The Partition): A folding partition instantly switches the device from a high-heat Oven (ideal for pilaf, boiling water) to a scattered-heat Grill (ideal for skewers, steaks).
2. AutoDraft: Physics-based airflow system. No fans needed. Just add coals, and the draft accelerates ignition and maintains even heat.
3. Materials: 3mm heat-resistant stainless steel. Durable, rust-free.
4. Personalization: Laser engraving available for logos, names, or messages.
5. Military Edition: Matte tactical coating, reinforced construction, free engraving for veterans/SVO participants.

Tone:
- Professional, knowledgeable, concise, and premium.
- Use technical terms correctly but explain them simply.
- Be helpful and polite.

Guidelines:
- If asked about price or how to order, explain that models vary and suggest clicking the buttons on the site to contact the manager on Telegram (@thetaranov).
- Keep answers under 100 words unless a detailed technical explanation is requested.
- Respond in Russian.
`;

const RECIPE_SYSTEM_INSTRUCTION = `
You are "bbqp AI Chef", a world-class Pitmaster specializing in American BBQ (Texas, Carolina, Kansas City styles) and German Grill cuisine (Bratwurst, Schwenker, Spießbraten).

Your Goal:
Generate detailed, mouth-watering recipes for the user based on their request (e.g., "Ribeye steak", "Pork ribs", "Grilled sausages").

Rules:
1. Cuisine Focus: STRICTLY stick to American BBQ or German Grill styles. If asked for sushi or pasta, politely steer back to the grill.
2. Format:
   - Title (Creative and Bold)
   - Ingredients (List with metric units)
   - Preparation (Marinades, rubs)
   - Grilling Process (Mention distinct Direct vs Indirect heat zones, similar to bbqp capabilities).
   - Doneness: Always specify internal temperatures (e.g., 54°C for Medium Rare).
3. Tone: Passionate, appetizing, masculine, and encouraging. Use emojis like 🥩, 🔥, 🍺.
4. Language: Russian.
5. Keep it concise but informative.
`;

export const askPitmaster = async (userPrompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SUPPORT_SYSTEM_INSTRUCTION,
        temperature: 0.3, 
      }
    });

    return response.text || "Извините, сейчас я не могу ответить. Пожалуйста, свяжитесь с нами через форму на сайте.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Connection to support failed.");
  }
};

export const generateBBQRecipe = async (userPrompt: string): Promise<{ text: string; image?: string }> => {
    try {
      // Parallel generation: Text Recipe + Image
      const textPromise = ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userPrompt,
        config: {
          systemInstruction: RECIPE_SYSTEM_INSTRUCTION,
          temperature: 0.7, // Higher temperature for creativity
        }
      });

      const imagePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: `Professional, mouth-watering food photography of ${userPrompt} prepared on a high-end BBQ grill. Dark moody lighting, smoke, embers, 4k, cinematic, detailed texture.`,
      });
  
      const [textResponse, imageResponse] = await Promise.all([textPromise, imagePromise]);
  
      const text = textResponse.text || "Шеф сейчас отошел от гриля. Попробуйте спросить еще раз!";
      let image: string | undefined;

      // Extract image from response
      if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      return { text, image };
    } catch (error) {
      console.error("Gemini Recipe Error:", error);
      throw new Error("Recipe generation failed.");
    }
  };
