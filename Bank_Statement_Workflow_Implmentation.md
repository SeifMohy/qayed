Goal: Create a workflow to take uploaded bank statements and run them through gemini api to extract required information. Final Output:
1. Statement parsing:
a. Bank Name
b. Account Number
c. Statement Period
d. Starting Balance
e. Ending Balance
2. Transaction Parsing:
a. Date
b. Credit Amount
c. Debit Amount
d. Description


Implementation example:
import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

// --- Model and API Key Configuration ---
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('Error: GEMINI_API_KEY environment variable is not set.');
}

// --- Helper Function to convert File to Base64 ---
async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

// --- System Prompt for Document Parsing ---
const PARSING_SYSTEM_PROMPT = `
You are an AI assistant specialized in extracting text content from various document types.
Your task is to extract the full text content from the provided document file.

Please return all the text content you can extract from the document.
Focus on maintaining the document's structure where possible.

Ensure accuracy in extracting text content from the provided document.
*CRITICAL: Only return the extracted text content as your final output. Do NOT include ANY introductory text, concluding remarks, or explanations.*
`.trim();

// --- API Route Handler ---
export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Server configuration error: API key not found.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucketId = formData.get('bucketId') as string | null;
    const bucketName = formData.get('bucketName') as string | null;
    const bucketDescription = formData.get('bucketDescription') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided for parsing.' }, { status: 400 });
    }

    if (!bucketId || !bucketName || !bucketDescription) {
      return NextResponse.json({ error: 'Bucket information not provided.' }, { status: 400 });
    }

    // --- Initialize Gemini ---
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    console.log('Initialized Gemini model for document parsing.');

    try {
      const base64Data = await fileToBase64(file);
      const prompt = ⁠ Please extract the text content from the provided document. ⁠;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ 
          role: "user", 
          parts: [
            { text: PARSING_SYSTEM_PROMPT },
            { text: prompt },
            { 
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            }
          ]
        }],
        config: {
          temperature: 0.1,
          topK: 1,
          topP: 0.95,
          maxOutputTokens: 16384,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error(⁠ Gemini returned empty text content for document. ⁠);
      }

      return NextResponse.json({
        success: true,
        fileName: file.name,
        bucketId,
        bucketName,
        bucketDescription,
        extractedText: text,
      });

    } catch (error: any) {
      console.error('Error in document parsing:', error);
      return NextResponse.json({
        success: false,
        error: error.message || 'An unexpected error occurred during processing.'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in parse route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred during processing.'
    }, { status: 500 });
  }
}