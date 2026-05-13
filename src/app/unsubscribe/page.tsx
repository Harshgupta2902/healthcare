import type { Metadata } from "next";
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home } from 'lucide-react'
import { verifyUnsubscribeToken } from '@/lib/newsletter-token'
import { getNewsletterStatusByToken } from '@/features/client/actions'
import UnsubscribeClient from './_components/UnsubscribeClient'
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo/page-metadata'

export const metadata: Metadata = buildPageMetadata({
    title: 'Newsletter unsubscribe',
    description: 'Confirm your preferences for HealthHere email updates.',
    pathname: '/unsubscribe',
    robots: ROBOTS_NOINDEX,
})

interface PageProps {
    searchParams: Promise<{ t?: string }>
}

export default async function UnsubscribePage({ searchParams }: PageProps) {
    const { t } = await searchParams
    const token = (t ?? '').trim()

    const verified = verifyUnsubscribeToken(token)

    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-background overflow-hidden flex items-center justify-center px-4 py-20 selection:bg-primary selection:text-primary-foreground">
            {/* Subtle texture overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.015] bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />

            {/* Atmospheric glows */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-xl mx-auto">
                {verified.ok ? (
                    <UnsubscribeClient
                        email={verified.email}
                        token={token}
                        initialStatus={(await getNewsletterStatusByToken(token)).status}
                    />
                ) : (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 text-destructive mb-6">
                            <AlertTriangle className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                            Invalid unsubscribe link
                        </h1>
                        <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
                            {verified.error ||
                                'This unsubscribe link looks broken or has been tampered with. If you keep seeing this, please contact support.'}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Button asChild size="lg" className="rounded-2xl h-12 px-8 font-bold w-full sm:w-auto">
                                <Link href="/">
                                    <Home className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="rounded-2xl h-12 px-8 font-bold w-full sm:w-auto">
                                <Link href="/contact">Contact Support</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
