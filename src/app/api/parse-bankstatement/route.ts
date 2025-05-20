import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for parsing.' }, { status: 400 });
    }

    // Initialize Gemini
    const ai = new GoogleGenerativeAI(API_KEY);
    console.log('Initialized Gemini model for document parsing.');

    const results = [];
    
    // Process each file
    for (const file of files) {
      try {
        // Only process PDF files
        if (!file.type.includes('pdf')) {
          results.push({
            fileName: file.name,
            success: false,
            error: 'Only PDF files are supported.'
          });
          continue;
        }

        const base64Data = await fileToBase64(file);
        const prompt = "Please extract the text content from the provided document.";

        const model = ai.getGenerativeModel({ model: MODEL_NAME });
        const response = await model.generateContent({
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
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.95,
            maxOutputTokens: 32768,
          }
        });

        const text = response.response.text();
        if (!text) {
          throw new Error("Gemini returned empty text content for document.");
        }

        // Add to results
        results.push({
          fileName: file.name,
          success: true,
          extractedText: text
        });

      } catch (error: any) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          fileName: file.name,
          success: false,
          error: error.message || 'An unexpected error occurred during processing.'
        });
      }
    }

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error: any) {
    console.error('Error in parse route:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred during processing.'
    }, { status: 500 });
  }
} 