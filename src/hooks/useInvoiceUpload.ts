import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

export interface UseInvoiceUploadOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export const useInvoiceUpload = (options: UseInvoiceUploadOptions = {}) => {
  const [isUploading, setIsUploading] = useState<string | null>(null)
  const { session } = useAuth()

  const uploadInvoices = async (files: File[], sourceId: string) => {
    if (files.length === 0) return

    // Check if user is authenticated
    if (!session?.user?.id) {
      const error = 'User not authenticated. Please log in again.'
      options.onError?.(error)
      throw new Error(error)
    }

    setIsUploading('processing')
    const allInvoices: any[] = []

    try {
      console.log('📤 Starting unified invoice upload process...')
      console.log(`📄 Processing ${files.length} files for source '${sourceId}'`)
      
      // Process all files - support JSON, Excel, CSV
      for (const file of files) {
        try {
          if (file.name.endsWith('.json')) {
            console.log(`🔍 Processing JSON file: ${file.name}`)
            const text = await file.text()
            const json = JSON.parse(text)
            
            if (Array.isArray(json)) {
              console.log(`✅ Adding ${json.length} invoices from ${file.name}`)
              allInvoices.push(...json)
            } else {
              console.log(`✅ Adding single invoice from ${file.name}`)
              allInvoices.push(json)
            }
          } else if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
            // For non-JSON files, we'll need to implement Excel/CSV parsing
            // For now, show a helpful message
            console.warn(`⚠️ Excel/CSV processing not yet implemented for: ${file.name}`)
            const error = `Excel/CSV file processing is not yet implemented. Please convert ${file.name} to JSON format.`
            options.onError?.(error)
            continue
          } else {
            console.warn(`⚠️ Skipping unsupported file type: ${file.name}`)
            continue
          }
        } catch (parseError) {
          console.error(`❌ Error parsing file ${file.name}:`, parseError)
          const error = `Error parsing file ${file.name}. Please check its format.`
          options.onError?.(error)
          continue
        }
      }

      if (allInvoices.length > 0) {
        console.log(`📤 Uploading ${allInvoices.length} invoices in bulk...`)
        
        // Use Express backend URL if available
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error('Backend URL not configured. Please set NEXT_PUBLIC_BACKEND_URL environment variable.');
        }
        const normalizedBackendUrl = backendUrl.startsWith('http') ? backendUrl : `https://${backendUrl}`;
        const response = await fetch(`${normalizedBackendUrl}/api/invoices`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            supabaseUserId: session.user.id,
            invoices: allInvoices
          }),
        });

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage
          
          try {
            const errorData = JSON.parse(errorText)
            errorMessage = errorData.error || `Server responded with ${response.status}`
          } catch {
            errorMessage = `Server error (${response.status}). Please check the console for details.`
            console.error('Server returned non-JSON response:', errorText)
          }
          
          throw new Error(errorMessage)
        }

        const result = await response.json()
        console.log('✅ Successfully uploaded invoices with LLM name normalization')
        console.log('📊 Processing summary:', result)
        
        options.onSuccess?.()
        
        return result
      } else {
        const error = 'No valid invoices found in the uploaded files'
        options.onError?.(error)
        throw new Error(error)
      }
    } catch (error: any) {
      console.error('❌ Error during unified invoice upload process:', error)
      const errorMessage = error.message || 'Unknown error occurred during upload'
      options.onError?.(errorMessage)
      throw error
    } finally {
      setIsUploading(null)
    }
  }

  return {
    uploadInvoices,
    isUploading
  }
} 