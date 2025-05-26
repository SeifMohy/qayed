import { supabase } from './supabase';

const BUCKET_NAME = 'bank-statements';

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadBankStatement(file: File, userId: string): Promise<UploadResult> {
  try {
    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}/${timestamp}-${file.name}`;

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      success: true,
      fileUrl: urlData.publicUrl
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file'
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteBankStatement(fileUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-2).join('/'); // Get userId/filename part

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
}

/**
 * Get download URL for a file
 */
export async function getDownloadUrl(fileUrl: string): Promise<string | null> {
  try {
    // For public files, the fileUrl is already the download URL
    return fileUrl;
  } catch (error) {
    console.error('Get download URL error:', error);
    return null;
  }
}

/**
 * Initialize storage bucket (call this once during setup)
 */
export async function initializeBucket(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Initialize bucket error:', error);
    return false;
  }
} 