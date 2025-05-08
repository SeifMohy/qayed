'use client'

import { Button } from '@/components/button'
import { GradientBackground } from '@/components/gradient'
import { Link } from '@/components/link'
import { Checkbox, Field, Input, Label } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'
import { clsx } from 'clsx'

export default function SignUp() {
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
            
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              <Link href="/dashboard">
                <Button className="w-full">
                  Create account
                </Button>
              </Link>
            </div>
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