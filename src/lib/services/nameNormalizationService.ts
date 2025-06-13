/**
 * Name Normalization Service using Gemini AI
 * 
 * Handles normalization of Arabic and English company names using LLM
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface NameToNormalize {
  id: string;
  name: string;
  type: 'issuer' | 'receiver';
}

export interface NormalizedName {
  id: string;
  originalName: string;
  normalizedName: string;
  confidence: number;
}

export interface NameNormalizationResult {
  normalizedNames: NormalizedName[];
  errors: { id: string; error: string }[];
}

/**
 * Normalizes a batch of company names using Gemini AI
 */
export async function normalizeNames(names: NameToNormalize[]): Promise<NameNormalizationResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  if (names.length === 0) {
    return { normalizedNames: [], errors: [] };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    const prompt = `
You are an expert in normalizing Arabic and English company names for financial data processing.

Your task is to clean and normalize the following company names by:

1. **Arabic Text Normalization:**
   - Fix spacing between Arabic words that are incorrectly joined
   - Separate words like "الشركة", "المصرية", "لتكنولوجيا", "التجارة", etc.
   - Fix common Arabic encoding issues
   - Ensure proper spacing between Arabic words
   - Handle business entity indicators like "شركة", "مؤسسة", "الجمعية", etc.

2. **English Text Normalization:**
   - Separate camelCase words (e.g., "VodafoneEgypt" → "Vodafone Egypt")
   - Fix spacing between company name components
   - Standardize business entity abbreviations (Ltd, Inc, LLC, etc.)
   - Handle mixed Arabic-English names

3. **General Rules:**
   - Preserve the original meaning and legal entity type
   - Don't change currency codes, reference numbers, or technical IDs
   - Maintain capitalization for proper nouns
   - Remove extra whitespace and trim

COMPANY NAMES TO NORMALIZE:
${names.map((item, index) => `
${index + 1}. ID: ${item.id}
   Name: "${item.name}"
   Type: ${item.type}
`).join('')}

RESPONSE FORMAT (JSON only, no other text):
{
  "results": [
    {
      "id": "${names[0]?.id}",
      "originalName": "${names[0]?.name}",
      "normalizedName": "Cleaned and normalized name here",
      "confidence": 0.95
    }
  ]
}

Important: 
- Return results for ALL provided names
- Confidence should be 0.8-1.0 for good normalizations
- If a name doesn't need normalization, return it unchanged with confidence 1.0
- Only return valid JSON, no additional text or explanations`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in Gemini response:', text);
      return {
        normalizedNames: [],
        errors: names.map(n => ({ id: n.id, error: 'Failed to parse LLM response' }))
      };
    }

    const parsedResult = JSON.parse(jsonMatch[0]);
    
    if (!parsedResult.results || !Array.isArray(parsedResult.results)) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const normalizedNames: NormalizedName[] = [];
    const errors: { id: string; error: string }[] = [];

    // Validate and process each result
    for (const name of names) {
      const result = parsedResult.results.find((r: any) => r.id === name.id);
      
      if (result && result.normalizedName) {
        normalizedNames.push({
          id: result.id,
          originalName: result.originalName || name.name,
          normalizedName: result.normalizedName,
          confidence: result.confidence || 0.5
        });
      } else {
        errors.push({
          id: name.id,
          error: 'No normalization result found'
        });
      }
    }

    console.log(`✅ Normalized ${normalizedNames.length} names, ${errors.length} errors`);
    
    return { normalizedNames, errors };

  } catch (error) {
    console.error('Error calling Gemini API for name normalization:', error);
    
    // Return fallback result with original names
    const fallbackResults = names.map(name => ({
      id: name.id,
      originalName: name.name,
      normalizedName: name.name, // Use original name as fallback
      confidence: 0.1
    }));

    return {
      normalizedNames: fallbackResults,
      errors: [{ id: 'general', error: `LLM API error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
    };
  }
}

/**
 * Checks if name normalization is available (server-side only)
 */
export function isNameNormalizationAvailable(): boolean {
  return typeof window === 'undefined' && !!process.env.GEMINI_API_KEY;
} 