/**
 * API Route for uploading JSON files with proper character encoding detection
 * 
 * This endpoint handles JSON file uploads and properly decodes them using
 * character encoding detection to fix Arabic text encoding issues.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readJSONFileWithEncoding } from '../../../lib/file-encoding-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileEntries = formData.getAll('files');
    
    if (!fileEntries || fileEntries.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 });
    }
    
    console.log(`📤 Processing ${fileEntries.length} JSON files with encoding detection...`);
    
    const processedFiles = [];
    const errors = [];
    
    for (const fileEntry of fileEntries) {
      try {
        // In server environment, fileEntry is a File-like object but not exactly File
        const file = fileEntry as { name: string; arrayBuffer: () => Promise<ArrayBuffer> };
        
        if (!file.name || !file.name.endsWith('.json')) {
          errors.push({
            fileName: file.name || 'unknown',
            error: 'Only JSON files are supported'
          });
          continue;
        }
        
        console.log(`🔍 Processing file: ${file.name}`);
        
        // Convert File-like object to Buffer for server-side processing
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Read JSON with proper encoding detection
        const jsonData = await readJSONFileWithEncoding(buffer);
        
        console.log(`✅ Successfully decoded ${file.name} with proper encoding`);
        
        processedFiles.push({
          fileName: file.name,
          data: jsonData,
          success: true
        });
        
      } catch (error) {
        const fileName = (fileEntry as any)?.name || 'unknown';
        console.error(`❌ Error processing ${fileName}:`, error);
        errors.push({
          fileName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`📊 Processing complete: ${processedFiles.length} successful, ${errors.length} errors`);
    
    return NextResponse.json({
      success: true,
      processedFiles,
      errors,
      summary: {
        total: fileEntries.length,
        successful: processedFiles.length,
        failed: errors.length
      }
    });
    
  } catch (error) {
    console.error('❌ Server error in upload-json:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error processing files',
      technicalError: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'JSON file upload endpoint with encoding detection',
    usage: 'POST multipart/form-data with "files" field containing JSON files',
    features: [
      'Character encoding detection (chardet)',
      'Multiple encoding support (windows-1256, utf-8, iso-8859-6)',
      'Arabic text encoding issue detection',
      'Proper UTF-8 decoding'
    ]
  });
} 