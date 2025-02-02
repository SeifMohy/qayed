import { Button } from '@/components/button'
import { Container } from '@/components/container'
import { Footer } from '@/components/footer'
import { Gradient } from '@/components/gradient'
import { Navbar } from '@/components/navbar'

export const metadata = {
  title: 'AI Demand Planning',
  description:
    "Optimize inventory, boost profitability, and reduce waste with SKU's AI-powered solutions.",
}

function Hero() {
  return (
    <div className="relative">
      <Gradient className="absolute inset-2 bottom-0 rounded-4xl ring-1 ring-black/5 ring-inset" />
      <Container className="relative">
        <Navbar />
        <div className="pt-16 pb-24 sm:pt-24 sm:pb-32 md:pt-24 md:pb-24">
          <h1 className="font-display text-6xl/[0.9] font-medium tracking-tight text-balance text-gray-950 sm:text-8xl/[0.8] md:text-9xl/[0.8]">
            Increase Sales and Reduce Waste.
          </h1>
          <p className="mt-8 max-w-lg text-xl/7 font-medium text-gray-950/75 sm:text-2xl/8">
            Optimize your inventory, enhance customer satisfaction, and boost
            profitability advanced AI solutions.
          </p>
          <div className="mt-12 flex flex-col gap-x-6 gap-y-4 sm:flex-row">
            <Button href="https://calendar.app.google/xJNUPr3weESwkqSA6">
              Book a Demo
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

const problems = [
  {
    name: '🚨 Revenue Loss Due to Stockouts',
    description:
      'When products are out of stock, you miss out on potential sales, leading to decreased revenue and a damaged brand reputation as customers turn to competitors.',
  },
  {
    name: '😡 Poor Customer Experience & Churn',
    description:
      'Customers who repeatedly encounter unavailable products become frustrated and lose trust, ultimately seeking alternatives, increasing churn rates.',
  },
  {
    name: '💸 Excess Inventory Drains Cash Flow',
    description:
      'Overstocking ties up valuable capital, increases storage costs, and risks product obsolescence or expiry, reducing overall profitability.',
  },
]

const solutions = [
  {
    name: '📈 Clean & Standardized Data',
    description:
      'Ensure historical data is accurate and structured, allowing for precise demand forecasting and trend analysis based on real, reliable insights.',
  },
  {
    name: '📊 Comprehensive Analysis',
    description:
      'Analyze stock availability, seasonality trends, and sensitivity to external factors to identify inefficiencies and recommend the most effective inventory strategies.',
  },
  {
    name: '🔍 Actionable Insights & Automation',
    description:
      'Generate demand forecasts, optimize inventory levels, provide detailed reports, and implement automated purchasing triggers to prevent stock issues before they happen.',
  },
]

function SectionOne() {
  return (
    <div className="bg-white pt-12 pb-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-[#595CFF]">
            The Problem
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            The Hidden Costs of Poor Inventory Management{' '}
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

function SectionTwo() {
  return (
    <div className="bg-white pt-6 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base/7 font-semibold text-[#595CFF]">
            The Solution
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl lg:text-balance">
            AI Powered Forecasts and Data Driven Decisions{' '}
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

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero />
      <main>
        <div className="bg-linear-to-b from-white from-50% to-gray-100">
          <SectionOne />
          <SectionTwo />
        </div>
      </main>
      <Footer />
    </div>
  )
}
