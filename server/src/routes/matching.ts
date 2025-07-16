import express from 'express';
import { aiGeminiMatching, getPendingMatches, updateMatchStatus, getMatchingStats, resetRejectedMatches } from '../lib/services/matchingService';
import { getUserCompanyId } from '../lib/services/companyAccessService';

const router = express.Router();

// POST /matching/ai-gemini
router.post('/ai-gemini', async (req, res) => {
  const { supabaseUserId } = req.body;
  if (!supabaseUserId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide supabaseUserId.'
    });
  }
  const companyId = await getUserCompanyId(supabaseUserId);
  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: 'User does not have a company associated.'
    });
  }
  const result = await aiGeminiMatching(companyId.toString());
  res.json(result);
});

// GET /matching/pending
router.get('/pending', async (req, res) => {
  const { supabaseUserId, page = 1, limit = 10, status = 'PENDING', sortBy = 'matchScore', sortOrder = 'desc' } = req.query;
  if (!supabaseUserId || typeof supabaseUserId !== 'string') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide supabaseUserId.'
    });
  }
  const companyId = await getUserCompanyId(supabaseUserId);
  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: 'User does not have a company associated.'
    });
  }
  const result = await getPendingMatches(companyId.toString(), { page: Number(page), limit: Number(limit), status: status as string, sortBy: sortBy as string, sortOrder: sortOrder as string });
  res.json(result);
});

// PUT /matching/pending
router.put('/pending', async (req, res) => {
  const { supabaseUserId, matchId, action, notes } = req.body;
  if (!supabaseUserId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide supabaseUserId.'
    });
  }
  const companyId = await getUserCompanyId(supabaseUserId);
  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: 'User does not have a company associated.'
    });
  }
  const result = await updateMatchStatus(companyId.toString(), matchId, action, notes);
  res.json(result);
});

// GET /matching/stats
router.get('/stats', async (req, res) => {
  const { supabaseUserId } = req.query;
  if (!supabaseUserId || typeof supabaseUserId !== 'string') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide supabaseUserId.'
    });
  }
  const companyId = await getUserCompanyId(supabaseUserId);
  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: 'User does not have a company associated.'
    });
  }
  const result = await getMatchingStats(companyId.toString());
  res.json(result);
});

// POST /matching/reset-rejected
router.post('/reset-rejected', async (req, res) => {
  const { supabaseUserId } = req.body;
  if (!supabaseUserId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide supabaseUserId.'
    });
  }
  const companyId = await getUserCompanyId(supabaseUserId);
  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: 'User does not have a company associated.'
    });
  }
  const result = await resetRejectedMatches(companyId.toString());
  res.json(result);
});

export default router; 