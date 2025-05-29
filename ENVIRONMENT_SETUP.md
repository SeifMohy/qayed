# Environment Setup for AI Matching Feature

## Required Environment Variables

To use the AI-powered invoice-transaction matching feature, you need to set up the following environment variables.

### 1. Create Environment File

Create a `.env.local` file in the root directory:

```bash
# Copy this template and fill in your actual values

# Gemini AI Configuration (REQUIRED for AI matching)
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration (should already be set)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
DIRECT_URL="postgresql://username:password@localhost:5432/database_name"

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file

### 3. Verify Setup

To test if your environment is properly configured:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard/matching`

3. Check the browser console for any environment-related errors

4. Try the "Start AI Matching" button

### 4. Common Issues

#### Missing API Key
- **Error**: "GEMINI_API_KEY is not defined"
- **Solution**: Make sure the API key is added to `.env.local` without quotes

#### Invalid API Key
- **Error**: "API key is invalid"  
- **Solution**: Generate a new API key from Google AI Studio

#### Database Connection
- **Error**: "Failed to fetch matching statistics"
- **Solution**: Verify your database is running and `DATABASE_URL` is correct

### 5. Testing the Feature

Once set up, you can test the feature:

1. Ensure you have some invoices and transactions in your database
2. Go to `/dashboard/matching`
3. Check the statistics show unmatched items
4. Click "Start AI Matching"
5. Monitor the console logs for progress
6. Check the results in the UI

### 6. Production Deployment

For production deployment (Vercel, etc.):

1. Add the environment variables to your hosting platform
2. Make sure `GEMINI_API_KEY` is added as a secure environment variable
3. Verify the API endpoints are accessible

### 7. Rate Limits

The Gemini API has rate limits:
- Free tier: 60 requests per minute
- The system includes automatic delays (100ms) between requests
- Processing is done in batches to respect limits

If you hit rate limits, the system will:
- Log errors for failed requests
- Continue processing remaining items
- Show partial results in the UI 