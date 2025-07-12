'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/shared/ui/alert';
import RecurringPaymentForm from './RecurringPaymentForm';
import RecurringPaymentsList from './RecurringPaymentsList';
import { formatEGP, formatEGPForKeyCard } from '@/lib/format';
import { currencyCache } from '@/lib/services/currencyCache';
import { useAuth } from '@/contexts/auth-context';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
  Plus,
  ArrowLeft
} from 'lucide-react';

// Dynamically import Chart.js components to avoid SSR issues
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Bar = dynamic(() => import('react-chartjs-2').then(mod => mod.Bar), { ssr: false });

interface CashflowSummary {
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  totalItems: number;
  projectedItems: number;
  confirmedItems: number;
  dateRange: {
    start: string;
    end: string;
  };
}

interface CashPosition {
  date: string;
  openingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  closingBalance: number;
  projectionCount: number;
}

interface CashPositionSummary {
  averageDailyBalance: number;
  lowestProjectedBalance: number;
  lowestBalanceDate: string;
  highestProjectedBalance: number;
  highestBalanceDate: string;
  cashPositiveDays: number;
  cashNegativeDays: number;
  totalDays: number;
  startingBalance: number;
  latestBalanceDate: string;
  effectiveStartDate: string;
}

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date?: string;
  amount?: number;
  actionRequired: boolean;
}

interface DateRangeState {
  startDate: string;
  endDate: string;
  preset: '30d' | '90d' | '1y' | 'custom';
}

interface RecurringPayment {
  id: number;
  name: string;
  description?: string;
  amount: number;
  type: 'RECURRING_INFLOW' | 'RECURRING_OUTFLOW';
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  category?: string;
  currency: string;
  confidence: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    CashflowProjection: number;
  };
}

interface RecurringPaymentFormData {
  name: string;
  description?: string;
  amount: number;
  type: 'RECURRING_INFLOW' | 'RECURRING_OUTFLOW';
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
  startDate: string;
  endDate?: string;
  dayOfMonth?: number;
  dayOfWeek?: number;
  category?: string;
  currency: string;
  confidence: number;
  isActive: boolean;
}

type RecurringPaymentViewMode = 'list' | 'add' | 'edit';

export default function CashflowOverview() {
  const [summary, setSummary] = useState<CashflowSummary | null>(null);
  const [positions, setPositions] = useState<CashPosition[]>([]);
  const [positionSummary, setPositionSummary] = useState<CashPositionSummary | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [projections, setProjections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [dateRange, setDateRange] = useState<DateRangeState>({
    startDate: new Date().toISOString().split('T')[0], // Will be updated with actual bank statement date
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
    preset: '90d'
  });
  // Add state to track effective dates from API
  const [effectiveDateRange, setEffectiveDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  // Recurring payments state
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>([]);
  const [recurringViewMode, setRecurringViewMode] = useState<RecurringPaymentViewMode>('list');
  const [editingPayment, setEditingPayment] = useState<RecurringPayment | null>(null);
  const [savingRecurring, setSavingRecurring] = useState(false);

  // Daily positions view state
  const [showAllDays, setShowAllDays] = useState(false);

  // Track if we've initialized to prevent infinite loops
  const [isInitialized, setIsInitialized] = useState(false);

  // Auth context
  const { session } = useAuth();

  // Helper function to prepare auth headers
  const getAuthHeaders = () => {
    if (!session?.access_token) {
      throw new Error('Authentication required');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  // Helper functions - moved to top to avoid hoisting issues
  const formatCurrency = (amount: number) => {
    return formatEGPForKeyCard(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Load chart.js when component mounts
  useEffect(() => {
    const loadChartJs = async () => {
      try {
        const ChartJS = await import('chart.js/auto');
        const Chart = ChartJS.default;
        
        // Register all components at once
        const {
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          BarElement,
          Title,
          Tooltip,
          Legend,
          Filler
        } = await import('chart.js');
        
        Chart.register(
          CategoryScale,
          LinearScale,
          PointElement,
          LineElement,
          BarElement,
          Title,
          Tooltip,
          Legend,
          Filler
        );
        
        setChartLoaded(true);
      } catch (error) {
        console.error('Error loading Chart.js:', error);
        // Fallback: try without auto import
        try {
          const ChartModule = await import('chart.js');
          const { Chart } = ChartModule;
          
          Chart.register(
            ChartModule.CategoryScale,
            ChartModule.LinearScale,
            ChartModule.PointElement,
            ChartModule.LineElement,
            ChartModule.BarElement,
            ChartModule.Title,
            ChartModule.Tooltip,
            ChartModule.Legend,
            ChartModule.Filler
          );
          
          setChartLoaded(true);
        } catch (fallbackError) {
          console.error('Error loading Chart.js with fallback:', fallbackError);
          // Set chartLoaded to true to prevent infinite loading
          setChartLoaded(true);
        }
      }
    };
    
    loadChartJs();
  }, []);

  // Function to get the latest bank statement date (same logic as dashboard)
  const getLatestBankStatementDate = async (): Promise<{ date: string; bankName: string }> => {
    try {
      // Use the same API that the dashboard uses to get the reference date
      const response = await fetch('/api/dashboard/stats', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success && data.metadata && data.metadata.referenceDate) {
        const referenceDate = new Date(data.metadata.referenceDate);
        return {
          date: referenceDate.toISOString().split('T')[0],
          bankName: data.metadata.bankName || 'Bank Statements'
        };
      }
      
      // Fallback: if dashboard stats fail, use today's date
      console.warn('⚠️ Could not get latest bank statement date, using today as fallback');
      return {
        date: new Date().toISOString().split('T')[0],
        bankName: 'Current Date'
      };
    } catch (error) {
      console.error('❌ Error fetching latest bank statement date:', error);
      // Fallback to today's date
      return {
        date: new Date().toISOString().split('T')[0],
        bankName: 'Current Date'
      };
    }
  };

  // Initialize date range with latest bank statement date
  const initializeDateRange = async () => {
    const { date: latestDate } = await getLatestBankStatementDate();
    const startDate = new Date(latestDate);
    
    // For initial load, use the next day after the latest bank statement
    const nextDay = new Date(startDate);
    nextDay.setDate(startDate.getDate() + 1);
    
    const endDate = new Date(nextDay);
    endDate.setDate(nextDay.getDate() + 90); // 90 days from the day after latest statement
    
    setDateRange({
      startDate: nextDay.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      preset: '90d'
    });
    
    console.log(`📅 Cashflow: Initialized date range from ${nextDay.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} (based on latest bank statement: ${latestDate})`);
  };

  // Initialize date range with latest bank statement date on component mount
  useEffect(() => {
    const initialize = async () => {
      await initializeDateRange();
      setIsInitialized(true);
    };
    initialize();
  }, []);



  const updateDateRange = async (preset: DateRangeState['preset']) => {
    // Always start from the effective start date if available, otherwise get latest bank statement date
    let baseStartDate: Date;
    
    if (effectiveDateRange?.startDate) {
      baseStartDate = new Date(effectiveDateRange.startDate);
    } else {
      const { date: latestDate } = await getLatestBankStatementDate();
      const latestBankDate = new Date(latestDate);
      // Use the day after the latest bank statement as the starting point
      baseStartDate = new Date(latestBankDate);
      baseStartDate.setDate(latestBankDate.getDate() + 1);
    }
    
    let startDate = new Date(baseStartDate);
    let endDate = new Date(baseStartDate);
    
    switch (preset) {
      case '30d':
        endDate.setDate(baseStartDate.getDate() + 30);
        break;
      case '90d':
        endDate.setDate(baseStartDate.getDate() + 90);
        break;
      case '1y':
        endDate.setFullYear(baseStartDate.getFullYear() + 1);
        break;
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      preset
    });
  };

  const fetchCashflowData = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Fetching unified cashflow data with currency conversion...');
      
      // Use the new unified API endpoint that handles multi-currency conversion
      const unifiedResponse = await fetch(
        `/api/cashflow/unified?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&range=custom&customEndDate=${dateRange.endDate}`,
        { headers: getAuthHeaders() }
      );
      const unifiedData = await unifiedResponse.json();
      
      if (unifiedData.success) {
        console.log('✅ Unified cashflow data received:', unifiedData.metadata);
        
        // Set all data from the unified response
        setSummary(unifiedData.summary);
        setPositions(unifiedData.positions);
        setProjections(unifiedData.projections);
        setPositionSummary(unifiedData.positionSummary);
        setAlerts(unifiedData.alerts);
        
        // Set effective date range from API response
        if (unifiedData.positionSummary && unifiedData.positionSummary.effectiveStartDate) {
          setEffectiveDateRange({
            startDate: unifiedData.positionSummary.effectiveStartDate,
            endDate: dateRange.endDate
          });
        }
        
        console.log(`💰 Cash position summary:`);
        console.log(`   - Starting balance: ${formatCurrency(unifiedData.positionSummary.startingBalance)}`);
        console.log(`   - Currency: ${unifiedData.metadata.currency}`);
        console.log(`   - Total projections: ${unifiedData.metadata.totalProjections}`);
        console.log(`   - Conversion note: ${unifiedData.metadata.conversionNote}`);
        
      } else {
        console.error('❌ Failed to fetch unified cashflow data:', unifiedData.error);
        // Fallback to existing API calls if unified fails
        await fetchCashflowDataFallback();
      }
    } catch (error) {
      console.error('❌ Error fetching unified cashflow data:', error);
      // Fallback to existing API calls
      await fetchCashflowDataFallback();
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Fallback method using separate API calls (original implementation)
  const fetchCashflowDataFallback = async () => {
    try {
      console.log('🔄 Using fallback cashflow data fetching...');
      
      // Fetch projections summary with current date range (using centralized service)
      const projectionsResponse = await fetch(
        `/api/cashflow/projections?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&includeRelated=true&useCentralized=true`,
        { headers: getAuthHeaders() }
      );
      const projectionsData = await projectionsResponse.json();
      
      if (projectionsData.success) {
        setSummary(projectionsData.summary);
        setProjections(projectionsData.projections);
      }

      // Fetch cash position with current date range
      const positionResponse = await fetch(
        `/api/cashflow/position?date=${dateRange.startDate}&customEndDate=${dateRange.endDate}&range=custom`,
        { headers: getAuthHeaders() }
      );
      const positionData = await positionResponse.json();
      
      if (positionData.success) {
        setPositions(positionData.positions);
        setPositionSummary(positionData.summary);
        setAlerts(positionData.alerts);
        
        // Set effective date range from API response
        if (positionData.summary && positionData.summary.effectiveStartDate) {
          setEffectiveDateRange({
            startDate: positionData.summary.effectiveStartDate,
            endDate: dateRange.endDate
          });
        }
      }
    } catch (error) {
      console.error('❌ Error in fallback cashflow data fetch:', error);
    }
  };

  const fetchRecurringPayments = useCallback(async () => {
    try {
      const response = await fetch('/api/cashflow/recurring?includeInactive=true', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setRecurringPayments(data.data);
      } else {
        console.error('Failed to fetch recurring payments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching recurring payments:', error);
    }
  }, []);

  const generateProjections = async () => {
    try {
      setGenerating(true);
      
      console.log('🚀 Starting centralized projection refresh...');
      
      // Use the centralized refresh endpoint
      const response = await fetch('/api/cashflow/projections/refresh', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          forceRecalculate: true
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Centralized projection refresh completed successfully');
        console.log('📊 Summary:', data.summary);
        console.log('🔍 Verification:', data.verification);
        
        // Log detailed breakdown
        const { summary, verification } = data;
        console.log(`   - Total projections generated: ${summary.totalProjections}`);
        console.log(`   - Recurring payments: ${summary.recurringPayments}`);
        console.log(`   - Invoice projections: ${summary.invoiceProjections}`);
        console.log(`   - Bank obligations: ${summary.bankObligations}`);
        
        if (verification.actualProjectionCount !== summary.totalProjections) {
          console.warn(`⚠️ Projection count mismatch: Expected ${summary.totalProjections}, Found ${verification.actualProjectionCount}`);
        }
        
        // Refresh all cashflow data to show updated projections
        await fetchCashflowData();
        console.log('✅ Cashflow data refreshed with centralized projections');
        
      } else {
        console.error('❌ Centralized projection refresh failed:', data.error);
        console.error('Details:', data.details);
        throw new Error(`Projection refresh failed: ${data.error}`);
      }
      
    } catch (error) {
      console.error('❌ Error during centralized projection refresh:', error);
      alert(`Failed to refresh projections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  // Recurring payment handlers
  const handleSaveRecurringPayment = async (paymentData: RecurringPaymentFormData) => {
    try {
      setSavingRecurring(true);
      
      let response;
      if (editingPayment) {
        // Update existing payment
        response = await fetch(`/api/cashflow/recurring/${editingPayment.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(paymentData)
        });
      } else {
        // Create new payment
        response = await fetch('/api/cashflow/recurring', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(paymentData)
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh data in parallel to avoid blank page
        await Promise.all([
          fetchRecurringPayments(),
          fetchCashflowData()
        ]);
        
        setRecurringViewMode('list');
        setEditingPayment(null);
        
        console.log('✅ Successfully saved recurring payment and refreshed data');
      } else {
        console.error('❌ Failed to save recurring payment:', data.error);
        alert(`Failed to save recurring payment: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error saving recurring payment:', error);
      alert(`Error saving recurring payment: ${error instanceof Error ? error.message : 'Network or server error'}`);
      
      // Don't change the view mode on error to prevent blank page
      console.log('🔄 Staying in current view mode due to error');
    } finally {
      setSavingRecurring(false);
    }
  };

  const handleEditRecurringPayment = (payment: RecurringPayment) => {
    setEditingPayment(payment);
    setRecurringViewMode('edit');
  };

  const handleDeleteRecurringPayment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recurring payment? This will also remove all future projections.')) {
      return;
    }

    try {
      const response = await fetch(`/api/cashflow/recurring/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh data in parallel
        await Promise.all([
          fetchRecurringPayments(),
          fetchCashflowData()
        ]);
        console.log('✅ Successfully deleted recurring payment');
      } else {
        console.error('❌ Failed to delete recurring payment:', data.error);
        alert(`Failed to delete recurring payment: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error deleting recurring payment:', error);
      alert(`Error deleting recurring payment: ${error instanceof Error ? error.message : 'Network or server error'}`);
    }
  };

  const handleToggleActiveRecurring = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/cashflow/recurring/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh data in parallel
        await Promise.all([
          fetchRecurringPayments(),
          fetchCashflowData()
        ]);
        console.log('✅ Successfully toggled recurring payment status');
      } else {
        console.error('❌ Failed to update recurring payment:', data.error);
        alert(`Failed to update recurring payment: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error updating recurring payment:', error);
      alert(`Error updating recurring payment: ${error instanceof Error ? error.message : 'Network or server error'}`);
    }
  };

  const handleCancelRecurringForm = () => {
    setRecurringViewMode('list');
    setEditingPayment(null);
  };

  useEffect(() => {
    if (isInitialized) {
      fetchCashflowData();
      fetchRecurringPayments();
    }
  }, [dateRange, isInitialized, fetchCashflowData, fetchRecurringPayments]);

  // Update date range when effective dates are loaded, but only if not already aligned
  useEffect(() => {
    if (effectiveDateRange && 
        effectiveDateRange.startDate !== dateRange.startDate && 
        isInitialized) {
      console.log('🔄 Updating date range to use effective dates:', effectiveDateRange);
      
      setDateRange(prev => ({
        ...prev,
        startDate: effectiveDateRange.startDate,
        endDate: effectiveDateRange.endDate
      }));
    }
  }, [effectiveDateRange, dateRange.startDate, isInitialized]);

  // Prepare chart data for visualizations
  const prepareChartData = () => {
    if (!positions.length) return null;

    const labels = positions.map(p => formatDate(p.date));
    const inflowsData = positions.map(p => p.totalInflows);
    const outflowsData = positions.map(p => p.totalOutflows);
    const balanceData = positions.map(p => p.closingBalance);
    
    // Calculate min and max for better chart scaling
    const minBalance = Math.min(...balanceData);
    const maxBalance = Math.max(...balanceData);
    const balanceRange = maxBalance - minBalance;
    const chartMin = minBalance - balanceRange * 0.1;
    const chartMax = maxBalance + balanceRange * 0.1;

    return {
      labels,
      chartMin,
      chartMax,
      lineData: {
        labels,
        datasets: [
          {
            label: 'Cash Balance',
            data: balanceData,
            borderColor: 'rgb(99, 102, 241)', // indigo-500
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: 'rgb(99, 102, 241)',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
            fill: true
          }
        ]
      },
      barData: {
        labels,
        datasets: [
          {
            label: 'Daily Inflows',
            data: inflowsData,
            backgroundColor: 'rgba(34, 197, 94, 0.7)', // green-500
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          },
          {
            label: 'Daily Outflows',
            data: outflowsData,
            backgroundColor: 'rgba(239, 68, 68, 0.7)', // red-500
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 1
          }
        ]
      }
    };
  };

  const chartData = prepareChartData();

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            return `Cash Balance: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: `Date Range: ${formatDate(effectiveDateRange?.startDate || dateRange.startDate)} - ${formatDate(effectiveDateRange?.endDate || dateRange.endDate)} (All amounts in EGP)`
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cash Balance (EGP)'
        },
        min: chartData?.chartMin,
        max: chartData?.chartMax,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${formatCurrency(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: `Date Range: ${formatDate(effectiveDateRange?.startDate || dateRange.startDate)} - ${formatDate(effectiveDateRange?.endDate || dateRange.endDate)} (All amounts in EGP)`
        }
      },
      y: {
        title: {
          display: true,
          text: 'Daily Cash Flows (EGP)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cashflow Overview</h1>
          <p className="text-gray-600">Monitor your cash position and upcoming obligations</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={generateProjections}
            disabled={generating}
            variant="outline"
            className="relative"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Refreshing Projections...' : 'Refresh Projections'}
          </Button>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Date Range:</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {(['30d', '90d', '1y'] as const).map((preset) => (
              <Button
                key={preset}
                variant={dateRange.preset === preset ? 'primary' : 'outline'}
                onClick={() => updateDateRange(preset)}
                className="text-xs px-3 py-1"
              >
                {preset === '30d' ? '30 Days' : preset === '90d' ? '90 Days' : '1 Year'}
              </Button>
            ))}
            <Button
              variant={dateRange.preset === 'custom' ? 'primary' : 'outline'}
              onClick={() => setDateRange(prev => ({ ...prev, preset: 'custom' }))}
              className="text-xs px-3 py-1"
            >
              Custom
            </Button>
          </div>
          
          {dateRange.preset === 'custom' && (
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="text-xs border border-gray-300 rounded px-2 py-1"
              />
            </div>
          )}
        </div>
      </div>

      {/* Current Date Range Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Viewing cashflow from {formatDate(effectiveDateRange?.startDate || dateRange.startDate)} to {formatDate(effectiveDateRange?.endDate || dateRange.endDate)}
            </span>
            {effectiveDateRange && effectiveDateRange.startDate !== dateRange.startDate && (
              <span className="text-xs text-blue-600 ml-2">
                (adjusted from latest balance date)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-800 border-blue-300">
              {dateRange.preset === 'custom' ? 'Custom Range' : dateRange.preset.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-green-800 border-green-300">
              All amounts in EGP
            </Badge>
          </div>
        </div>
      </div>

      {/* Cash Position Overview */}
      {positionSummary && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <span className="text-sm font-medium text-green-800">
                  Current Cash on Hand: {formatCurrency(positionSummary.startingBalance)}
                </span>
                <span className="text-xs text-green-600 ml-2">
                  (as of {formatDate(positionSummary.latestBalanceDate)})
                </span>
                {positionSummary.startingBalance === 0 && (
                  <span className="text-xs text-orange-600 ml-2">
                    (No bank statements found - using £E 0 as starting balance)
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="text-green-800">
                <span className="font-medium">Projections from:</span> {formatDate(positionSummary.effectiveStartDate)}
              </div>
              <Badge variant="outline" className="text-green-800 border-green-300">
                {positionSummary.totalDays} days
              </Badge>
              <Badge variant="outline" className="text-green-800 border-green-300">
                Multi-currency converted to EGP
              </Badge>
              {effectiveDateRange && effectiveDateRange.startDate !== dateRange.startDate && (
                <Badge variant="outline" className="text-blue-800 border-blue-300">
                  Adjusted from bank date
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inflows (EGP)</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600 break-words">
                {formatCurrency(summary.totalInflows)}
              </div>
              <p className="text-xs text-gray-600">
                From {summary.projectedItems} projections (multi-currency converted)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outflows (EGP)</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600 break-words">
                {formatCurrency(summary.totalOutflows)}
              </div>
              <p className="text-xs text-gray-600">
                Upcoming obligations (multi-currency converted)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cashflow (EGP)</CardTitle>
              <DollarSign className={`h-4 w-4 ${summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold break-words ${summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netCashflow)}
              </div>
              <p className="text-xs text-gray-600">
                {summary.netCashflow >= 0 ? 'Positive' : 'Negative'} position (all currencies in EGP)
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cashflow Visualization Charts */}
      {chartLoaded && chartData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cashflow Visualization</CardTitle>
                <CardDescription>
                  Daily cash position, inflows, and outflows over time
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'line' ? 'primary' : 'outline'}
                  onClick={() => setChartType('line')}
                  className="text-xs px-3 py-1"
                >
                  Line Chart
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'primary' : 'outline'}
                  onClick={() => setChartType('bar')}
                  className="text-xs px-3 py-1"
                >
                  Bar Chart
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {chartType === 'line' ? (
                <Line data={chartData.lineData} options={lineChartOptions} />
              ) : (
                <Bar data={chartData.barData} options={barChartOptions} />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alerts & Notifications (EGP)
            </CardTitle>
            <CardDescription>
              Important cashflow alerts requiring attention - all amounts converted to EGP
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    {alert.title}
                    <Badge variant="outline" className="ml-2">
                      {alert.severity}
                    </Badge>
                  </AlertTitle>
                  <AlertDescription>
                    {alert.description}
                    {alert.date && (
                      <span className="block text-sm text-gray-600 mt-1">
                        Date: {formatDate(alert.date)}
                        {alert.amount && ` • Amount: ${formatCurrency(Math.abs(alert.amount))}`}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cash Position Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Cash Position (EGP)</CardTitle>
          <CardDescription>
            Daily cash flow projections and running balance - all amounts converted from multiple currencies to EGP
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                <div>Date</div>
                <div>Inflows (EGP)</div>
                <div>Outflows (EGP)</div>
                <div>Net (EGP)</div>
                <div>Balance (EGP)</div>
                <div>Items</div>
              </div>
              {(() => {
                // Filter out days with zero projection items for better visibility
                const daysWithActivity = positions.filter(position => position.projectionCount > 0);
                const displayPositions = showAllDays ? daysWithActivity : daysWithActivity.slice(0, 10);
                
                return (
                  <>
                    {displayPositions.map((position) => (
                      <div key={position.date} className="grid grid-cols-6 gap-4 text-sm py-2 border-b border-gray-100">
                        <div className="font-medium">{formatDate(position.date)}</div>
                        <div className="text-green-600">
                          {position.totalInflows > 0 ? formatCurrency(position.totalInflows) : '-'}
                        </div>
                        <div className="text-red-600">
                          {position.totalOutflows > 0 ? formatCurrency(position.totalOutflows) : '-'}
                        </div>
                        <div className={position.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(position.netCashflow)}
                        </div>
                        <div className={`font-medium ${position.closingBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(position.closingBalance)}
                        </div>
                        <div className="text-gray-600">{position.projectionCount}</div>
                      </div>
                    ))}
                    
                    {daysWithActivity.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="mb-2">No days with cash flow activity found.</div>
                        <div className="text-sm">All days in the selected range have zero projected transactions.</div>
                      </div>
                    )}
                    
                    {daysWithActivity.length > 10 && (
                      <div className="text-center py-4">
                        <Button 
                          variant="outline"
                          onClick={() => setShowAllDays(!showAllDays)}
                        >
                          {showAllDays 
                            ? `Show First 10 Days` 
                            : `View All ${daysWithActivity.length} Days with Activity`
                          }
                        </Button>
                        {!showAllDays && (
                          <div className="text-xs text-gray-500 mt-2">
                            Showing only days with projected transactions ({daysWithActivity.length} of {positions.length} total days)
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No cash position data available. Generate projections to see daily cash flow.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recurring Payments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-600" />
                Recurring Payments (Multi-Currency)
              </CardTitle>
              <CardDescription>
                Add recurring income and expenses in any currency - automatically converted to EGP in projections
              </CardDescription>
            </div>
            {recurringViewMode === 'list' && (
              <Button onClick={() => setRecurringViewMode('add')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Recurring Payment
              </Button>
            )}
            {recurringViewMode !== 'list' && (
              <Button variant="outline" onClick={handleCancelRecurringForm}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recurringViewMode === 'list' ? (
            <div className="space-y-4">
              {recurringPayments.length === 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-green-900">Add Recurring Income</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Set up subscriptions, rent, or other regular income
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingPayment(null);
                            setRecurringViewMode('add');
                          }}
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Add Income
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-900">Add Recurring Expenses</h4>
                          <p className="text-sm text-red-700 mt-1">
                            Track salaries, rent, utilities, and other regular costs
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setEditingPayment(null);
                            setRecurringViewMode('add');
                          }}
                        >
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center py-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Improve cashflow accuracy by adding your recurring payments
                    </p>
                    <Button onClick={() => setRecurringViewMode('add')}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Get Started with Recurring Payments
                    </Button>
                  </div>
                </div>
              ) : (
                <RecurringPaymentsList
                  payments={recurringPayments}
                  onEdit={handleEditRecurringPayment}
                  onDelete={handleDeleteRecurringPayment}
                  onToggleActive={handleToggleActiveRecurring}
                  loading={false}
                />
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <RecurringPaymentForm
                payment={editingPayment || undefined}
                onSave={handleSaveRecurringPayment}
                onCancel={handleCancelRecurringForm}
                loading={savingRecurring}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 