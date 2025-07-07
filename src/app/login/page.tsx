'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/shared/ui/button'
import { GradientBackground } from '@/components/shared/ui/gradient'
import { Link } from '@/components/shared/ui/link'
import { Checkbox, Field, Input, Label } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'
import { clsx } from 'clsx'
import { useAuth } from '@/contexts/auth-context'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading: authLoading, isAuthenticated } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check for success message from signup
    const messageParam = searchParams.get('message')
    if (messageParam) {
      setMessage(messageParam)
    }

    // Redirect if already authenticated
    if (isAuthenticated && !authLoading) {
      router.push('/dashboard')
    }
  }, [searchParams, isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error } = await login(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        // Auth context will handle the redirect via useEffect
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <main className="overflow-hidden bg-gray-50">
      <GradientBackground />
      <div className="isolate flex min-h-dvh items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md rounded-xl bg-white ring-1 shadow-md ring-black/5">
          <div className="p-7 sm:p-11">
            <div className="flex items-start">
              <Link href="/" title="Home">
                {/* <Mark className="h-9 fill-black" /> */}
              </Link>
            </div>
            <h1 className="mt-8 text-base/6 font-medium">Welcome back!</h1>
            <p className="mt-1 text-sm/5 text-gray-600">
              Sign in to your account to continue.
            </p>
            
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            {message && (
              <div className="mt-4 rounded-md bg-blue-50 p-4">
                <div className="text-sm text-blue-700">{message}</div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-8">
              <Field className="space-y-3">
                <Label className="text-sm/5 font-medium">Email</Label>
                <Input
                  required
                  autoFocus
                  type="email"
                  name="email"
                  className={clsx(
                    'block w-full rounded-lg border border-transparent ring-1 shadow-sm ring-black/10',
                    'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                    'data-focus:outline data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                  )}
                />
              </Field>
              <Field className="mt-8 space-y-3">
                <Label className="text-sm/5 font-medium">Password</Label>
                <Input
                  required
                  type="password"
                  name="password"
                  className={clsx(
                    'block w-full rounded-lg border border-transparent ring-1 shadow-sm ring-black/10',
                    'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                    'data-focus:outline data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                  )}
                />
              </Field>
              <div className="mt-8 flex items-center justify-between text-sm/5">
                <Field className="flex items-center gap-3">
                  <Checkbox
                    name="remember-me"
                    className={clsx(
                      'group block size-4 rounded-sm border border-transparent ring-1 shadow-sm ring-black/10 focus:outline-hidden',
                      'data-checked:bg-black data-checked:ring-black',
                      'data-focus:outline data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-black',
                    )}
                  >
                    <CheckIcon className="fill-white opacity-0 group-data-checked:opacity-100" />
                  </Checkbox>
                  <Label>Remember me</Label>
                </Field>
                <Link href="#" className="font-medium hover:text-gray-600">
                  Forgot password?
                </Link>
              </div>
              <div className="mt-8">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || authLoading}
                >
                  {isLoading || authLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
          </div>
          <div className="m-1.5 rounded-lg bg-gray-50 py-4 text-center text-sm/5 ring-1 ring-black/5">
            Not a member?{' '}
            <Link href="/signup" className="font-medium hover:text-gray-600">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
