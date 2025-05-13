'use client'

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import { Bars2Icon } from '@heroicons/react/24/solid'
import { Button } from '@/components/shared/ui/button'
import { Link } from '@/components/shared/ui/link'
import { Logo } from '@/components/shared/logo'
import { PlusGrid, PlusGridItem, PlusGridRow } from '@/components/dashboard/plus-grid'

function DesktopNav() {
  return (
    <nav className="relative hidden lg:flex">
      <Button href="https://calendar.app.google/xJNUPr3weESwkqSA6">
        Book a Demo
      </Button>
    </nav>
  )
}

function MobileNavButton() {
  return (
    <DisclosureButton
      className="flex size-12 items-center justify-center self-center rounded-lg data-hover:bg-black/5 lg:hidden"
      aria-label="Open main menu"
    >
      <Bars2Icon className="size-6" />
    </DisclosureButton>
  )
}

function MobileNav() {
  return (
    <DisclosurePanel className="lg:hidden">
      <div className="flex flex-col gap-6 py-4">
        <Button href="https://calendar.app.google/xJNUPr3weESwkqSA6">
          Book a Demo
        </Button>
      </div>
      <div className="absolute left-1/2 w-screen -translate-x-1/2">
        <div className="absolute inset-x-0 top-0 border-t border-black/5" />
        <div className="absolute inset-x-0 top-2 border-t border-black/5" />
      </div>
    </DisclosurePanel>
  )
}

export function Navbar({ banner }: { banner?: React.ReactNode }) {
  return (
    <Disclosure as="header" className="pt-12 sm:pt-16">
      <PlusGrid>
        <PlusGridRow className="relative flex justify-between">
          <div className="relative flex gap-6">
            <PlusGridItem className="py-3">
              <Link href="/" title="Home">
                <Logo className="h-9" />
              </Link>
            </PlusGridItem>
            {banner && (
              <div className="relative hidden items-center py-3 lg:flex">
                {banner}
              </div>
            )}
          </div>
          {/* <DesktopNav /> */}
          {/* <MobileNavButton /> */}
        </PlusGridRow>
      </PlusGrid>
      {/* <MobileNav /> */}
    </Disclosure>
  )
}
