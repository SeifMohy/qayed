/**
 * Name Normalization Service using Gemini AI
 *
 * Handles normalization of Arabic and English company names using LLM
 */
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
    errors: {
        id: string;
        error: string;
    }[];
}
/**
 * Normalizes a batch of company names using Gemini AI
 */
export declare function normalizeNames(names: NameToNormalize[]): Promise<NameNormalizationResult>;
/**
 * Checks if name normalization is available (server-side only)
 */
export declare function isNameNormalizationAvailable(): boolean;
