"use client";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

export async function* runGemini(prompt: string, apiKey: string) {
  if (!apiKey) {
    throw new Error("Gemini API কী সেট করা নেই।");
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    for await (const chunk of result.stream) {
      if (chunk.text) {
        yield chunk.text();
      }
    }
  } catch (error: any) {
    if (error.message?.includes("API key not valid")) {
      throw new Error(
        "অবৈধ API কী। অনুগ্রহ করে প্রোফাইল সেটিংস থেকে আপনার কী পরীক্ষা করুন।",
      );
    }
    console.error("Gemini API Error:", error);
    throw new Error(
      "Gemini থেকে উত্তর পেতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    );
  }
}
