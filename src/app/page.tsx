import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Gradient } from '@/components/gradient'
import { Navbar } from '@/components/navbar'

export const metadata = {
  title: 'Cashflow Management',
  description:
    'Empower your enterprise with CFO-level cashflow management. Visualize cash positions, forecast obligations, and optimize financial operations.',
}

function Hero() {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <Navbar />
        <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-24 md:pb-24">
          <h1 className="font-display text-6xl/[0.9] font-medium tracking-tight text-balance text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
            Empowering Enterprises with CFO-Level Cashflow Management
          </h1>
          <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
            Visualize your cash positions, forecast upcoming obligations, and optimize financial operations through actionable insights.
          </p>
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
            <Button href="/login">
              Sign Up
            </Button>
            <Button href="/login" variant="outline">
              Sign In
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

const problems = [
  {
    name: '🔍 Reactive Financial Management',
    description:
      'Gaining clear visibility into cashflow is challenging and time-consuming. Finance teams spend countless hours manually combining data from multiple disconnected sources.',
  },
  {
    name: '💸 Cash Shortfalls',
    description:
      'Without proper forecasting, enterprises encounter cash shortfalls resulting in delayed payments and damaged relationships with suppliers and stakeholders.',
  },
  {
    name: '💰 Expensive Short-Term Financing',
    description:
      'Poor cashflow visibility leads to expensive reliance on short-term loans or overdrafts, increasing costs and reducing overall profitability.',
  },
]

const solutions = [
  {
    name: '📈 Real-Time Visibility',
    description:
      'Clearly track your current cash position across all accounts and currencies with a consolidated view of your financial data.',
  },
  {
    name: '📊 Reliable Forecasting',
    description:
      'Accurately predict future cash inflows and outflows to avoid surprises and make informed financial decisions.',
  },
  {
    name: '🔍 Actionable Insights',
    description:
      'Identify opportunities to save money, optimize your resources, and strengthen your financial position through data-driven recommendations.',
  },
]

function ProblemStatement() {
  return (
    <div className="bg-white pt-12 pb-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-[#595CFF]">
            The Problem
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            Too Many Enterprises React Instead of Plan
          </p>
          <p className="mt-6 text-lg text-gray-600">
            Finance teams spend countless hours manually combining data from multiple disconnected sources—banks, ERPs, electronic invoices—leading to reactive rather than proactive financial management.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {problems.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-gray-900">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

function SolutionOverview() {
  return (
    <div className="bg-white pt-6 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-[#595CFF]">
            The Solution
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            An Intuitive Cashflow Management Dashboard
          </p>
          <p className="mt-6 text-lg text-gray-600">
            We provide an intuitive, easy-to-use dashboard that consolidates your financial data—from banks, ERP systems, and electronic invoices—into one powerful, centralized tool.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {solutions.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base/7 font-semibold text-gray-900">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base/7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

function FeaturesSummary() {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-[#595CFF]">
            Key Features
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Spend less time gathering data, more time acting on it
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our dashboard gives you the tools to move from reactive to proactive financial planning.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-2">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#595CFF]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
                  </svg>
                </div>
                Real-Time Visibility
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">Clearly track your current cash position across all accounts and currencies with a consolidated financial view.</dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#595CFF]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                  </svg>
                </div>
                Reliable Forecasting
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">Accurately predict future cash inflows and outflows to avoid surprises and make informed decisions.</dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#595CFF]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                  </svg>
                </div>
                Scenario Planning
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">Easily simulate multiple financial situations to make informed decisions and prepare for various outcomes.</dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-[#595CFF]">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                  </svg>
                </div>
                Actionable Insights
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">Identify opportunities to save money, optimize your resources, and strengthen your overall financial position.</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <main>
        <div className="bg-linear-to-b from-white from-50% to-gray-100">
          <ProblemStatement />
          <SolutionOverview />
          <FeaturesSummary />
        </div>
      </main>
      <Footer />
    </div>
  )
}
