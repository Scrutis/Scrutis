import React from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import Image from 'next/image'
import { TextEffect } from '@workspace/ui/components/text-effect'
import { AnimatedGroup } from '@workspace/ui/components/animated-group'
import { HeroHeader } from './header'
import TeamSection from './team'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    return (
      <>
        <HeroHeader />
        <main className="overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block"
          >
            <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
            <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
            <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
          </div>
          <section>
            <div className="relative">
            {/* <div className="relative pt-24 md:pt-36"> */}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
              />

              <div className="flex h-screen items-center mx-auto max-w-7xl px-6">
                <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                  <TextEffect
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    as="h1"
                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl font-bold max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]"
                  >
                    Unified Threat Analysis Api
                  </TextEffect>
                  <TextEffect
                    per="line"
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    delay={0.5}
                    as="p"
                    className="mx-auto mt-8 max-w-2xl text-balance text-2xl"
                  >
                    Scan, analyze, and secure files and URLs with a single,
                    developer-first security API. Get Started Free
                  </TextEffect>

                  <AnimatedGroup
                    variants={{
                      container: {
                        visible: {
                          transition: {
                            staggerChildren: 0.05,
                            delayChildren: 0.75,
                          },
                        },
                      },
                      ...transitionVariants,
                    }}
                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                  >
                    <div
                      key={1}
                      className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                    >
                      <Button
                        asChild
                        size="lg"
                        className="rounded-xl px-5 text-base"
                      >
                        <Link href="#link">
                          <span className="text-nowrap">Start now</span>
                        </Link>
                      </Button>
                    </div>
                    <Button
                      key={2}
                      asChild
                      size="lg"
                      variant="ghost"
                      className="h-10.5 rounded-xl px-5"
                    >
                      <Link href="#link">
                        <span className="text-nowrap">Read docs</span>
                      </Link>
                    </Button>
                  </AnimatedGroup>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
}
