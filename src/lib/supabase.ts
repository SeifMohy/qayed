import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to sanitize file names for Supabase Storage
function sanitizeFileName(fileName: string): string {
  // Arabic to Latin transliteration map
  const arabicToLatin: { [key: string]: string } = {
    'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
    'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
    'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y'
  };

  // Get file extension
  const lastDotIndex = fileName.lastIndexOf('.');
  const extension = lastDotIndex > -1 ? fileName.substring(lastDotIndex) : '';
  const nameWithoutExt = lastDotIndex > -1 ? fileName.substring(0, lastDotIndex) : fileName;

  // Transliterate Arabic characters
  let sanitized = nameWithoutExt;
  for (const [arabic, latin] of Object.entries(arabicToLatin)) {
    sanitized = sanitized.replace(new RegExp(arabic, 'g'), latin);
  }

  // Remove non-ASCII characters and replace spaces with hyphens
  sanitized = sanitized
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9\-_.]/g, '') // Keep only alphanumeric, hyphens, underscores, dots
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Limit length and ensure we have a valid name
  sanitized = sanitized.substring(0, 50);
  if (!sanitized) {
    sanitized = 'bank-statement';
  }

  return sanitized + extension;
}

// Upload bank statement file to Supabase Storage
export async function uploadBankStatementFile(file: File, originalFileName: string): Promise<string> {
  try {
    // Create unique filename with timestamp prefix
    const timestamp = Date.now();
    const sanitizedName = sanitizeFileName(originalFileName);
    const fileName = `${timestamp}-${sanitizedName}`;

    console.log(`Uploading file: ${originalFileName} -> ${fileName}`);

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('bank-statements')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('bank-statements')
      .getPublicUrl(fileName);

    console.log(`File uploaded successfully: ${urlData.publicUrl}`);
    return urlData.publicUrl;

  } catch (error: any) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
}

// Delete bank statement file from Supabase Storage
export async function deleteBankStatementFile(fileUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const fileName = fileUrl.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid file URL');
    }

    const { error } = await supabase.storage
      .from('bank-statements')
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }

    console.log(`File deleted successfully: ${fileName}`);
  } catch (error: any) {
    console.error('Error deleting file from Supabase:', error);
    throw error;
  }
} 