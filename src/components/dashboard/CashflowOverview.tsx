'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { Button } from '@/components/shared/ui/button';
import { Badge } from '@/components/shared/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/shared/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings,
  CalendarDays
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
  averageConfidence: number;
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
  averageConfidence: number;
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

export default function CashflowOverview() {
  const [summary, setSummary] = useState<CashflowSummary | null>(null);
  const [positions, setPositions] = useState<CashPosition[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [projections, setProjections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [dateRange, setDateRange] = useState<DateRangeState>({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    preset: '90d'
  });

  // Helper functions - moved to top to avoid hoisting issues
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
      const { 
        Chart, 
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
    };
    
    loadChartJs();
  }, []);

  const updateDateRange = (preset: DateRangeState['preset']) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date(today);
    
    switch (preset) {
      case '30d':
        endDate.setDate(today.getDate() + 30);
        break;
      case '90d':
        endDate.setDate(today.getDate() + 90);
        break;
      case '1y':
        endDate.setFullYear(today.getFullYear() + 1);
        break;
    }
    
    setDateRange({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      preset
    });
  };

  const fetchCashflowData = async () => {
    try {
      setLoading(true);
      
      // Fetch projections summary with current date range
      const projectionsResponse = await fetch(
        `/api/cashflow/projections?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&includeRelated=true`
      );
      const projectionsData = await projectionsResponse.json();
      
      if (projectionsData.success) {
        setSummary(projectionsData.summary);
        setProjections(projectionsData.projections);
      }

      // Fetch cash position with current date range
      const positionResponse = await fetch(
        `/api/cashflow/position?date=${dateRange.startDate}&customEndDate=${dateRange.endDate}&range=custom`
      );
      const positionData = await positionResponse.json();
      
      if (positionData.success) {
        setPositions(positionData.positions);
        setAlerts(positionData.alerts);
      }
    } catch (error) {
      console.error('Error fetching cashflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProjections = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/cashflow/projections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchCashflowData(); // Refresh data
      }
    } catch (error) {
      console.error('Error generating projections:', error);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchCashflowData();
  }, [dateRange]);

  // Prepare chart data for visualizations
  const prepareChartData = () => {
    if (!positions.length) return null;

    const labels = positions.map(p => formatDate(p.date));
    const inflowsData = positions.map(p => p.totalInflows);
    const outflowsData = positions.map(p => p.totalOutflows);
    const balanceData = positions.map(p => p.closingBalance);

    return {
      labels,
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
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cash Balance'
        },
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
        }
      },
      y: {
        title: {
          display: true,
          text: 'Daily Cash Flows'
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
      {/* Header with Date Range Controls */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cashflow Overview</h1>
          <p className="text-gray-600">Monitor your cash position and upcoming obligations</p>
        </div>
        
        {/* Date Range Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          
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

        <div className="flex gap-2">
          <Button
            onClick={generateProjections}
            disabled={generating}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Generating...' : 'Refresh Projections'}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Current Date Range Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Viewing cashflow from {formatDate(dateRange.startDate)} to {formatDate(dateRange.endDate)}
            </span>
          </div>
          <Badge variant="outline" className="text-blue-800 border-blue-300">
            {dateRange.preset === 'custom' ? 'Custom Range' : dateRange.preset.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inflows</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalInflows)}
              </div>
              <p className="text-xs text-gray-600">
                From {summary.projectedItems} projections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Outflows</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.totalOutflows)}
              </div>
              <p className="text-xs text-gray-600">
                Upcoming obligations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Cashflow</CardTitle>
              <DollarSign className={`h-4 w-4 ${summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.netCashflow)}
              </div>
              <p className="text-xs text-gray-600">
                {summary.netCashflow >= 0 ? 'Positive' : 'Negative'} position
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Confidence</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(summary.averageConfidence * 100)}%
              </div>
              <p className="text-xs text-gray-600">
                Average projection confidence
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
              Alerts & Notifications
            </CardTitle>
            <CardDescription>
              Important cashflow alerts requiring attention
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
          <CardTitle>Daily Cash Position</CardTitle>
          <CardDescription>
            Daily cash flow projections and running balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {positions.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-4 text-sm font-medium text-gray-600 border-b pb-2">
                <div>Date</div>
                <div>Inflows</div>
                <div>Outflows</div>
                <div>Net</div>
                <div>Balance</div>
                <div>Items</div>
                <div>Confidence</div>
              </div>
              {positions.slice(0, 10).map((position) => (
                <div key={position.date} className="grid grid-cols-7 gap-4 text-sm py-2 border-b border-gray-100">
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
                  <div className="text-gray-600">{Math.round(position.averageConfidence * 100)}%</div>
                </div>
              ))}
              {positions.length > 10 && (
                <div className="text-center py-4">
                  <Button variant="outline">
                    View All {positions.length} Days
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No cash position data available. Generate projections to see daily cash flow.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 