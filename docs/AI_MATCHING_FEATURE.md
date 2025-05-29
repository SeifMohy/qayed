# AI-Powered Invoice-Transaction Matching

## Overview

This feature uses Google's Gemini AI to automatically match invoices with bank transactions, helping to streamline the reconciliation process.

## Features

- **Intelligent Matching**: AI analyzes invoice and transaction data to find potential matches
- **Real-time Statistics**: View total invoices, transactions, and unmatched items
- **Smart Filtering**: Pre-filters transactions based on date proximity and amount similarity
- **Confidence Scoring**: Each match comes with a confidence score (0.5-1.0)
- **Batch Processing**: Efficiently processes large datasets in manageable batches

## How It Works

1. **Data Collection**: Fetches unmatched invoices and transactions from the database
2. **Pre-filtering**: Applies basic filters to reduce the search space:
   - Date proximity (within 60 days)
   - Amount similarity (within 20% difference)
3. **AI Analysis**: Uses Gemini to analyze each invoice against potential transactions
4. **Match Creation**: Saves high-confidence matches to the database

## Matching Criteria

The AI considers the following factors when matching:

- **Amount Similarity**: Exact or very close amount matches
- **Date Proximity**: Transactions within a reasonable timeframe
- **Entity Matching**: Company names in transaction descriptions
- **Transaction Type**: Credit for customer payments, debit for supplier payments

## Score Ranges

- **0.9-1.0**: Exact amount + strong entity match + close date
- **0.7-0.89**: Close amount + partial entity match + reasonable date
- **0.5-0.69**: Reasonable amount + weak entity indicators
- **< 0.5**: Not included in results

## Setup Requirements

### Environment Variables

Add to your `.env.local` file:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

### Dependencies

The following packages are required (already included):
- `@google/generative-ai`
- `@prisma/client`

## Usage

1. Navigate to the Matching page (`/dashboard/matching`)
2. View the statistics in the AI-Powered Invoice Matching section
3. Click "Start AI Matching" to begin the process
4. Monitor progress and view results

## API Endpoints

### GET `/api/matching/stats`
Returns matching statistics:
- Total invoices
- Total transactions  
- Unmatched invoices
- Unmatched transactions

### POST `/api/matching/ai-gemini`
Starts the AI matching process:
- Processes unmatched invoices and transactions
- Returns total matches found
- Creates TransactionMatch records in database

## Database Schema

Matches are stored in the `TransactionMatch` table with:
- `matchType`: 'SUGGESTED' (AI-generated)
- `matchScore`: Confidence score (0.5-1.0)
- `matchReason`: Array of matching reasons
- `passedStrictCriteria`: Boolean indicating high confidence
- `status`: 'PENDING' (awaiting review)

## Performance Considerations

- Processes 100 invoices and 200 transactions per batch
- Includes rate limiting delays (100ms between requests)
- Pre-filtering reduces API calls by 80-90%
- Efficient database queries with proper indexing

## Future Enhancements

- Manual match review interface
- Bulk approval/rejection of matches
- Machine learning improvements based on user feedback
- Integration with additional AI models
- Advanced matching algorithms for complex scenarios

## Troubleshooting

### Common Issues

1. **API Key Not Set**: Ensure `GEMINI_API_KEY` is in your environment variables
2. **Rate Limits**: The system includes automatic delays to respect API limits
3. **No Matches Found**: Check that invoices and transactions exist in the database
4. **Database Errors**: Ensure Prisma schema is up-to-date with latest migrations

### Logs

Check the console for detailed logging:
- Processing status for each invoice
- API response handling
- Database operation results
- Error messages with context 