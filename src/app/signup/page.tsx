'use client'

// Force dynamic rendering to prevent static generation
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/ui/button'
import { GradientBackground } from '@/components/shared/ui/gradient'
import { Link } from '@/components/shared/ui/link'
import { Checkbox, Field, Input, Label } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'
import { clsx } from 'clsx'
// Remove direct import since we'll use API route
interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

export default function SignUp() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('🚀 Form submitted - handleSubmit called')
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)
    const signUpData: SignUpData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('first_name') as string,
      lastName: formData.get('last_name') as string,
      companyName: formData.get('company') as string,
    }

    console.log('📝 Form data extracted:', { ...signUpData, password: '[HIDDEN]' })



    // Basic validation
    if (signUpData.password !== formData.get('password_confirmation')) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!formData.get('terms')) {
      setError('Please agree to the terms of service and privacy policy')
      setIsLoading(false)
      return
    }

    try {
      console.log('📞 About to call signup API...')
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpData),
      });

      const result = await response.json();
      console.log('📞 API response:', result)
      
      if (!result.success) {
        console.log('❌ Signup error:', result.error)
        setError(result.error)
      } else {
        console.log('✅ Signup successful:', result.user)
        setSuccessMessage('Account created successfully! Please check your email to verify your account.')
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/login?message=Please check your email to verify your account')
        }, 2000)
      }
    } catch (err: any) {
      console.log('💥 Unexpected error in form handler:', err)
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
                {/* Logo here */}
              </Link>
            </div>
            <h1 className="mt-8 text-base/6 font-medium">Create your account</h1>
            <p className="mt-1 text-sm/5 text-gray-600">
              Get started with your cashflow management dashboard.
            </p>
            
            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}
            
            {successMessage && (
              <div className="mt-4 rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{successMessage}</div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field className="space-y-3">
                <Label className="text-sm/5 font-medium">First name</Label>
                <Input
                  required
                  autoFocus
                  type="text"
                  name="first_name"
                  className={clsx(
                    'block w-full rounded-lg border border-transparent ring-1 shadow-sm ring-black/10',
                    'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                    'data-focus:outline data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                  )}
                />
              </Field>
              
              <Field className="space-y-3">
                <Label className="text-sm/5 font-medium">Last name</Label>
                <Input
                  required
                  type="text"
                  name="last_name"
                  className={clsx(
                    'block w-full rounded-lg border border-transparent ring-1 shadow-sm ring-black/10',
                    'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                    'data-focus:outline data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                  )}
                />
              </Field>
            </div>
            
            <Field className="mt-6 space-y-3">
              <Label className="text-sm/5 font-medium">Company name</Label>
              <Input
                required
                type="text"
                name="company"
                className={clsx(
                  'block w-full rounded-lg border border-transparent ring-1 shadow-sm ring-black/10',
                  'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                  'data-focus:outline data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                )}
              />
            </Field>
            
            <Field className="mt-6 space-y-3">
              <Label className="text-sm/5 font-medium">Email</Label>
              <Input
                required
                type="email"
                name="email"
                className={clsx(
                  'block w-full rounded-lg border border-transparent ring-1 shadow-sm ring-black/10',
                  'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                  'data-focus:outline data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                )}
              />
            </Field>
            
            <Field className="mt-6 space-y-3">
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
            
            <Field className="mt-6 space-y-3">
              <Label className="text-sm/5 font-medium">Confirm password</Label>
              <Input
                required
                type="password"
                name="password_confirmation"
                className={clsx(
                  'block w-full rounded-lg border border-transparent ring-1 shadow-sm ring-black/10',
                  'px-[calc(--spacing(2)-1px)] py-[calc(--spacing(1.5)-1px)] text-base/6 sm:text-sm/6',
                  'data-focus:outline data-focus:outline-2 data-focus:-outline-offset-1 data-focus:outline-black',
                )}
              />
            </Field>
            
            <div className="mt-8 flex items-center gap-3">
              <Field className="flex items-center gap-3">
                <Checkbox
                  name="terms"
                  className={clsx(
                    'group block size-4 rounded-sm border border-transparent ring-1 shadow-sm ring-black/10 focus:outline-hidden',
                    'data-checked:bg-black data-checked:ring-black',
                    'data-focus:outline data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-black',
                  )}
                >
                  <CheckIcon className="fill-white opacity-0 group-data-checked:opacity-100" />
                </Checkbox>
                <Label className="text-sm/5">
                  I agree to the{' '}
                  <Link href="#" className="font-medium hover:text-gray-600">
                    terms of service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="font-medium hover:text-gray-600">
                    privacy policy
                  </Link>
                  .
                </Label>
              </Field>
            </div>
            
                <div className="mt-8">
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create account'}
                  </Button>
                </div>
              </form>
          </div>
          <div className="m-1.5 rounded-lg bg-gray-50 py-4 text-center text-sm/5 ring-1 ring-black/5">
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:text-gray-600">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
} 