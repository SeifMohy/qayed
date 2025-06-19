'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import useMeasure, { type RectReadOnly } from 'react-use-measure'
import { Container } from '@/components/shared/ui/container'
import { Link } from '@/components/shared/ui/link'
import { Heading, Subheading } from '@/components/shared/ui/text'

interface Testimonial {
  img: string;
  name: string;
  title: string;
  quote: string;
}

const testimonialData: Testimonial[] = [
  {
    img: '/testimonials/tina-yards.jpg',
    name: 'Tina Yards',
    title: 'VP of Sales, Protocol',
    quote:
      "Thanks to Qayed, we're able to manage our cashflow with complete financial visibility and control.",
  },
  {
    img: '/testimonials/veronica-winton.jpg',
    name: 'Veronica Winton',
    title: 'CSO, Planeteria',
    quote:
      "We've managed to put two of our main competitors out of business in 6 months.",
  },
  {
    img: '/testimonials/ryan-lewis.jpg',
    name: 'Ryan Lewis',
    title: 'Account Manager, Commit',
    quote:
      "I've smashed all my targets without having to speak to a lead in months.",
  },
]

function TestimonialGroup({
  testimonials,
  className,
  main = false,
}: {
  testimonials: Testimonial[];
  className?: string;
  main?: boolean;
}) {
  return (
    <div className={className}>
      <div className="-mx-4 flex gap-8 overflow-x-auto px-4 pb-12 sm:overflow-visible">
        {testimonials.map((testimonial, testimonialIndex) => (
          <Testimonial
            key={testimonialIndex}
            testimonial={testimonial}
            main={main && testimonialIndex === 0}
          />
        ))}
      </div>
    </div>
  )
}

function Testimonial({
  testimonial,
  main = false,
}: {
  testimonial: Testimonial;
  main?: boolean;
}) {
  return (
    <figure
      className={
        main
          ? 'col-span-2 hidden sm:flex sm:items-center sm:justify-center md:col-start-2 lg:col-span-1 lg:col-start-auto lg:row-span-2 lg:row-start-1'
          : 'flex-none snap-always snap-center sm:snap-start'
      }
    >
      <blockquote
        className={
          main
            ? 'relative flex h-full w-full flex-col bg-gray-950 px-10 py-20 sm:rounded-4xl sm:px-20 sm:shadow-md sm:shadow-gray-950/10'
            : 'relative flex h-full w-80 flex-col justify-between bg-gray-950 px-6 py-8 sm:w-96 sm:rounded-4xl sm:px-8 sm:shadow-md sm:shadow-gray-950/10'
        }
      >
        <div>
          <div className="flex gap-4">
            <img
              alt=""
              src={testimonial.img}
              className="h-12 w-12 flex-none rounded-xl object-cover"
            />
            <div>
              <div className="font-display text-base/6 font-semibold text-white">
                {testimonial.name}
              </div>
              <div className="mt-1 text-sm/6 text-gray-400">
                {testimonial.title}
              </div>
            </div>
          </div>
          <div className="mt-8 text-lg/7 text-white">{testimonial.quote}</div>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <div className="flex gap-1">
            {[...Array(5)].map((_, starIndex) => (
              <svg
                key={starIndex}
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-5 w-5 fill-white"
              >
                <path d="M10 15.934l-6.18 3.25.24-6.989L0 7.466l6.964-1.01L10 0l3.036 6.456L20 7.466l-4.06 4.729.24 6.99z" />
              </svg>
            ))}
          </div>
          <div className="text-sm/6 text-gray-400">5.0</div>
        </div>
      </blockquote>
    </figure>
  )
}

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0">
          <Subheading>Testimonials</Subheading>
          <Heading as="h2">
            Trusted by thousands of customers worldwide
          </Heading>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:grid-cols-3">
          <TestimonialGroup
            testimonials={testimonialData}
            main={true}
            className="lg:col-span-2 lg:row-start-1"
          />
        </div>
      </Container>
    </section>
  )
}
