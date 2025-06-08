'use client'

import { useState, useEffect } from 'react'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { CurrencyDollarIcon, BanknotesIcon, CreditCardIcon, ArrowTrendingUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { clsx } from 'clsx'
import dynamic from 'next/dynamic'
import KeyFigureCard from '@/components/visualization/key-figure-card'
import type { ChangeType } from '@/components/visualization/key-figure-card'

// Dynamically import Chart.js components
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false })

// Icon mapping
const iconMap = {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon
}

interface DashboardStat {
  title: string;
  value: number;
  change: number;
  changeType: ChangeType;
  icon: keyof typeof iconMap;
  iconColor: string;
  dataSource: string;
  interpretation?: 'positive' | 'negative';
}

interface TimelineItem {
  id: number;
  amount: number;
  dueDate: string;
  status?: string;
  confidence?: number;
  description?: string;
}

interface SupplierPayment extends TimelineItem {
  supplier: string;
}

interface CustomerPayment extends TimelineItem {
  customer: string;
}

interface BankPayment extends TimelineItem {
  bank: string;
  type: string;
}

interface CashPosition {
  date: string;
  openingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  netCashflow: number;
  closingBalance: number;
  transactionCount?: number;
  projectionCount?: number;
  isActual?: boolean;
}

interface DashboardMetadata {
  referenceDate: string;
  referenceDateFormatted: string;
  bankName: string;
  accountNumber?: string;
  note: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [timeline, setTimeline] = useState<{
    suppliers: SupplierPayment[];
    customers: CustomerPayment[];
    banks: BankPayment[];
  }>({ suppliers: [], customers: [], banks: [] });
  const [historicalPositions, setHistoricalPositions] = useState<CashPosition[]>([]);
  const [projectedPositions, setProjectedPositions] = useState<CashPosition[]>([]);
  const [metadata, setMetadata] = useState<DashboardMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chart.js when component mounts
  useEffect(() => {
    const loadChartJs = async () => {
      const { 
        Chart, 
        CategoryScale, 
        LinearScale, 
        PointElement, 
        LineElement, 
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
        Title, 
        Tooltip, 
        Legend, 
        Filler
      );
      
      setChartLoaded(true);
    };
    
    loadChartJs();
  }, []);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First fetch stats to get the reference date
        const statsRes = await fetch('/api/dashboard/stats');
        if (!statsRes.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
          setMetadata(statsData.metadata);
        }

        // Use the reference date from stats for projections
        const referenceDate = statsData.metadata?.referenceDate || new Date().toISOString();
        const nextDay = new Date(referenceDate);
        nextDay.setDate(nextDay.getDate() + 1);

        // Fetch remaining data in parallel
        const [timelineRes, historicalRes, projectedRes] = await Promise.all([
          fetch('/api/dashboard/timeline'),
          fetch('/api/dashboard/historical-cashflow'),
          fetch(`/api/cashflow/position?date=${nextDay.toISOString().split('T')[0]}&range=30d`)
        ]);

        if (!timelineRes.ok || !historicalRes.ok || !projectedRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [timelineData, historicalData, projectedData] = await Promise.all([
          timelineRes.json(),
          historicalRes.json(),
          projectedRes.json()
        ]);

        if (timelineData.success) {
          setTimeline(timelineData.timeline);
        }

        if (historicalData.success) {
          setHistoricalPositions(historicalData.positions);
        }

        if (projectedData.success) {
          setProjectedPositions(projectedData.positions);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      day: 'numeric',
      year: 'numeric'
    });
  };

  const prepareChartData = () => {
    if (!chartLoaded || (historicalPositions.length === 0 && projectedPositions.length === 0)) {
      return null;
    }

    // Get the Total Cash On Hand from stats
    const totalCashOnHand = stats.find(stat => stat.title === 'Total Cash On Hand')?.value || 0;
    
    // Prepare historical data - adjust the last point to match Total Cash On Hand
    let adjustedHistoricalPositions = [...historicalPositions];
    if (adjustedHistoricalPositions.length > 0 && totalCashOnHand > 0) {
      // Update the last historical data point to match Total Cash On Hand
      const lastIndex = adjustedHistoricalPositions.length - 1;
      adjustedHistoricalPositions[lastIndex] = {
        ...adjustedHistoricalPositions[lastIndex],
        closingBalance: totalCashOnHand
      };
    }

    // Prepare projected data - start from Total Cash On Hand
    let adjustedProjectedPositions = [...projectedPositions];
    if (adjustedProjectedPositions.length > 0 && totalCashOnHand > 0) {
      // Adjust all projected positions to start from Total Cash On Hand
      const firstProjectedBalance = adjustedProjectedPositions[0]?.openingBalance || 0;
      const adjustment = totalCashOnHand - firstProjectedBalance;
      
      adjustedProjectedPositions = adjustedProjectedPositions.map(position => ({
        ...position,
        openingBalance: position.openingBalance + adjustment,
        closingBalance: position.closingBalance + adjustment
      }));
    }

    // Combine and sort all positions
    const allPositions = [...adjustedHistoricalPositions, ...adjustedProjectedPositions];
    const sortedPositions = allPositions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Remove duplicates and ensure smooth transition
    const uniquePositions = [];
    let lastDate = '';
    
    for (const position of sortedPositions) {
      if (position.date !== lastDate) {
        uniquePositions.push(position);
        lastDate = position.date;
      }
    }

    const labels = uniquePositions.map(p => formatDate(p.date));
    const balances = uniquePositions.map(p => p.closingBalance);
    
    // Split data into historical and projected segments
    const historicalEndIndex = adjustedHistoricalPositions.length;
    const historicalBalances = balances.slice(0, historicalEndIndex);
    const projectedBalances = balances.slice(historicalEndIndex - 1); // Include overlap point

    return {
      labels,
      datasets: [
        {
          label: 'Historical Cash Position',
          data: [...historicalBalances, ...new Array(Math.max(0, projectedBalances.length - 1)).fill(null)],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
          fill: false
        },
        {
          label: 'Projected Cash Position',
          data: [...new Array(Math.max(0, historicalEndIndex - 1)).fill(null), ...projectedBalances],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointRadius: 3,
          pointHoverRadius: 5,
          tension: 0.1,
          fill: false
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Cash Flow Position - Historical & Projected',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          maxTicksLimit: 15
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Amount (USD)',
          font: {
            size: 14,
            weight: 'bold' as const
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    elements: {
      point: {
        hoverRadius: 8
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-600" />
        <span className="ml-2 text-lg">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Dashboard Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Real-time overview of your financial position and upcoming obligations
            </p>
            
            {/* Reference Date Information */}
            {metadata && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Data as of <span className="font-semibold">{metadata.referenceDateFormatted}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            
            {/* Key Statistics */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                  const IconComponent = iconMap[stat.icon];
                  return (
                    <KeyFigureCard
                      key={index}
                      title={stat.title}
                      value={formatCurrency(stat.value)}
                      change={`${Math.abs(stat.change).toFixed(1)}%`}
                      changeType={stat.changeType}
                      icon={IconComponent}
                      iconColor={stat.iconColor}
                      interpretation={stat.interpretation}
                    />
                  );
                })}
              </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="mt-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Cash Flow Overview
                    </h3>
                    {metadata && (
                      <div className="text-sm text-gray-500">
                        Based on data through {metadata.referenceDateFormatted}
                      </div>
                    )}
                  </div>
                  <div className="h-[32rem] w-full">
                    {chartData && chartLoaded ? (
                      <Line data={chartData} options={chartOptions} />
                    ) : (
                      <div className="flex justify-center items-center h-full">
                        <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-600" />
                        <span className="ml-2">Loading chart...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Sections */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              
              {/* Supplier Payments */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Upcoming Supplier Payments
                  </h3>
                  <div className="space-y-4">
                    {timeline.suppliers.length > 0 ? (
                      timeline.suppliers.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.supplier}</p>
                            <p className="text-xs text-gray-500">{formatDate(payment.dueDate)}</p>
                            <p className="text-xs text-gray-400">{payment.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-red-600">
                              -{formatCurrency(payment.amount)}
                            </p>
                            <span className={clsx(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                              payment.status === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            )}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No upcoming supplier payments
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Payments */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Expected Customer Payments
                  </h3>
                  <div className="space-y-4">
                    {timeline.customers.length > 0 ? (
                      timeline.customers.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.customer}</p>
                            <p className="text-xs text-gray-500">{formatDate(payment.dueDate)}</p>
                            <p className="text-xs text-gray-400">{payment.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">
                              +{formatCurrency(payment.amount)}
                            </p>
                            <span className={clsx(
                              'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                              payment.status === 'Pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            )}>
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No expected customer payments
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Payments */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Upcoming Bank Obligations
                  </h3>
                  <div className="space-y-4">
                    {timeline.banks.length > 0 ? (
                      timeline.banks.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{payment.bank}</p>
                            <p className="text-xs text-gray-500">{formatDate(payment.dueDate)}</p>
                            <p className="text-xs text-gray-400">{payment.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-purple-600">
                              -{formatCurrency(payment.amount)}
                            </p>
                            <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-1 text-xs font-medium">
                              {payment.type}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No upcoming bank obligations
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 