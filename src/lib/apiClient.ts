import { useAuth } from '@/contexts/auth-context';

// Types for better type safety
interface SSECallback {
  (data: any): void;
}

interface ApiClientOptions {
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseUrl: string;
  private getAuthHeaders: () => Record<string, string>;
  private options: ApiClientOptions;

  constructor(baseUrl: string, getAuthHeaders: () => Record<string, string>, options: ApiClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.getAuthHeaders = getAuthHeaders;
    this.options = {
      timeout: 30000, // 30 seconds default timeout
      retries: 3,
      ...options
    };
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    // Handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
    
    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async get(endpoint: string, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string, options?: RequestInit): Promise<Response> {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Special method for file uploads
  async uploadFiles(endpoint: string, files: FileList | File[], additionalData?: Record<string, any>): Promise<Response> {
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...this.getAuthHeaders(),
      },
    });
  }

  // SSE handler for long-running operations like PDF parsing
  async handleSSE(endpoint: string, onMessage: SSECallback, options?: RequestInit): Promise<{ success: boolean; results?: any[] }> {
    return new Promise((resolve, reject) => {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
      
      const headers = {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        ...this.getAuthHeaders(),
        ...options?.headers,
      };

      // For file uploads, don't set Accept header conflicts
      if (options?.body instanceof FormData) {
        delete headers['Accept'];
      }

      fetch(url, {
        method: options?.method || 'POST',
        headers,
        body: options?.body,
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          if (!response.body) {
            throw new Error('No response body for SSE');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let finalResults: any = null;

          const processStream = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      onMessage(data);

                      // Check for completion
                      if (data.type === 'complete') {
                        finalResults = data;
                      } else if (data.type === 'error') {
                        throw new Error(data.error || 'Unknown error occurred');
                      }
                    } catch (parseError) {
                      console.warn('Failed to parse SSE data:', line);
                    }
                  }
                }
              }

              // Stream completed successfully
              resolve({
                success: true,
                results: finalResults?.results || []
              });

            } catch (error) {
              console.error('Error processing SSE stream:', error);
              reject(error);
            } finally {
              reader.releaseLock();
            }
          };

          processStream();
        })
        .catch(error => {
          console.error('Error initiating SSE request:', error);
          reject(error);
        });
    });
  }

  // Utility method to get JSON response
  async getJSON(endpoint: string, options?: RequestInit): Promise<any> {
    const response = await this.get(endpoint, options);
    return response.json();
  }

  // Utility method to post JSON and get JSON response
  async postJSON(endpoint: string, data?: any, options?: RequestInit): Promise<any> {
    const response = await this.post(endpoint, data, options);
    return response.json();
  }
}

// Feature flags for gradual migration
export const useFeatureFlags = () => {
  return {
    usePDFParsingBackend: process.env.NEXT_PUBLIC_USE_BACKEND_PDF_PARSING === 'true',
    useStructuringBackend: process.env.NEXT_PUBLIC_USE_BACKEND_STRUCTURING === 'true',
    useCashflowBackend: process.env.NEXT_PUBLIC_USE_BACKEND_CASHFLOW === 'true',
    useMatchingBackend: process.env.NEXT_PUBLIC_USE_BACKEND_MATCHING === 'true',
  };
};

// Express backend client
export const useBackendApiClient = () => {
  const { session } = useAuth();
  
  const getAuthHeaders = () => {
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
    };
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  
  return new ApiClient(backendUrl, getAuthHeaders, {
    timeout: 300000, // 5 minutes for long-running operations
    retries: 2
  });
};

// Next.js API client (legacy)
export const useNextApiClient = () => {
  const { session } = useAuth();
  
  const getAuthHeaders = () => {
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
    };
  };

  return new ApiClient('', getAuthHeaders); // Empty base URL for relative paths
};

// Smart API client that uses feature flags to route requests
export const useApiClient = () => {
  const backendClient = useBackendApiClient();
  const nextClient = useNextApiClient();
  const flags = useFeatureFlags();

  return {
    // PDF Parsing - routes to Express backend if flag is enabled
    parseBankStatements: async (files: FileList | File[], onMessage?: SSECallback) => {
      if (flags.usePDFParsingBackend) {
        console.log('🚀 Using Express backend for PDF parsing');
        if (onMessage) {
          return backendClient.handleSSE('/api/bank-statements/parse', onMessage, {
            method: 'POST',
            body: (() => {
              const formData = new FormData();
              Array.from(files).forEach(file => formData.append('files', file));
              return formData;
            })()
          });
        } else {
          return backendClient.uploadFiles('/api/bank-statements/parse', files);
        }
      } else {
        console.log('📄 Using Next.js API for PDF parsing');
        if (onMessage) {
          const formData = new FormData();
          Array.from(files).forEach(file => formData.append('files', file));
          return nextClient.handleSSE('/api/parse-bankstatement', onMessage, {
            method: 'POST',
            body: formData
          });
        } else {
          return nextClient.uploadFiles('/api/parse-bankstatement', files);
        }
      }
    },

    // Other API methods continue to use Next.js for now
    getCashflowData: (params: Record<string, string>) => {
      const queryString = new URLSearchParams(params).toString();
      return nextClient.getJSON(`/api/cashflow/unified?${queryString}`);
    },

    getCustomers: () => nextClient.getJSON('/api/customers'),
    getSuppliers: () => nextClient.getJSON('/api/suppliers'),
    getBanks: () => nextClient.getJSON('/api/banks'),

    // Health check for both backends
    checkBackendHealth: async () => {
      try {
        const backendHealth = await backendClient.getJSON('/health');
        return { backend: backendHealth, status: 'ok' };
      } catch (error) {
        return { backend: null, status: 'error', error: error.message };
      }
    },

    // Access to both clients for advanced usage
    backend: backendClient,
    next: nextClient,
    flags
  };
}; 