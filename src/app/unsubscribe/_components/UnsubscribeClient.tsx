'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
    MailX,
    Home,
    CheckCircle2,
    Loader2,
    Sparkles,
    Info,
    AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { unsubscribeNewsletter } from '@/features/client/actions'

type View = 'confirm' | 'already-unsubscribed' | 'not-found' | 'just-unsubscribed'

interface Props {
    email: string
    token: string
    initialStatus: 'active' | 'unsubscribed' | 'not_found' | 'invalid_token'
}

function deriveInitialView(initialStatus: Props['initialStatus']): View {
    if (initialStatus === 'unsubscribed') return 'already-unsubscribed'
    if (initialStatus === 'not_found') return 'not-found'
    return 'confirm'
}

export default function UnsubscribeClient({ email, token, initialStatus }: Props) {
    const [view, setView] = useState<View>(deriveInitialView(initialStatus))
    const [isPending, startTransition] = useTransition()

    const handleUnsubscribe = () => {
        startTransition(async () => {
            const result = await unsubscribeNewsletter(token)
            if (result.success) {
                setView('just-unsubscribed')
                toast.success('You have been unsubscribed.')
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <AnimatePresence mode="wait">
            {view === 'confirm' && (
                <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-6"
                    >
                        <MailX className="w-10 h-10" />
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        Sorry to see you go
                    </h1>
                    <p className="text-muted-foreground font-medium mb-2 max-w-md mx-auto">
                        You are about to unsubscribe
                    </p>
                    <p className="text-lg font-bold mb-8 break-all">{email}</p>

                    <div className="rounded-2xl backdrop-blur-md bg-white/40 dark:bg-white/5 border border-border p-6 mb-8 text-left">
                        <p className="text-sm text-muted-foreground">
                            You will stop receiving our newsletter and product updates.
                            You can subscribe again anytime from the footer of our site.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                            size="lg"
                            onClick={handleUnsubscribe}
                            disabled={isPending}
                            className="rounded-2xl h-14 px-8 font-bold w-full sm:w-auto shadow-lg shadow-primary/20"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Unsubscribing...
                                </>
                            ) : (
                                <>
                                    <MailX className="w-4 h-4 mr-2" />
                                    Confirm Unsubscribe
                                </>
                            )}
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-2xl h-14 px-8 font-bold w-full sm:w-auto backdrop-blur-md bg-white/40 dark:bg-white/5"
                        >
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Keep me subscribed
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {view === 'already-unsubscribed' && (
                <motion.div
                    key="already-unsubscribed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary mb-6"
                    >
                        <Info className="w-10 h-10" />
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        You&apos;re already unsubscribed
                    </h1>
                    <p className="text-muted-foreground font-medium mb-2 max-w-md mx-auto">
                        We&apos;re no longer sending newsletter emails to
                    </p>
                    <p className="text-lg font-bold mb-8 break-all">{email}</p>
                    <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
                        No further action needed. If you change your mind, you can
                        subscribe again from the footer of our site.
                    </p>

                    <Button
                        asChild
                        size="lg"
                        className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                </motion.div>
            )}

            {view === 'not-found' && (
                <motion.div
                    key="not-found"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-destructive/10 text-destructive mb-6"
                    >
                        <AlertTriangle className="w-10 h-10" />
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        We couldn&apos;t find that subscription
                    </h1>
                    <p className="text-muted-foreground font-medium mb-2 max-w-md mx-auto">
                        This email isn&apos;t on our subscriber list:
                    </p>
                    <p className="text-lg font-bold mb-8 break-all">{email}</p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button asChild size="lg" className="rounded-2xl h-14 px-8 font-bold w-full sm:w-auto">
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Back to Home
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-2xl h-14 px-8 font-bold w-full sm:w-auto backdrop-blur-md bg-white/40 dark:bg-white/5"
                        >
                            <Link href="/contact">Contact Support</Link>
                        </Button>
                    </div>
                </motion.div>
            )}

            {view === 'just-unsubscribed' && (
                <motion.div
                    key="just-unsubscribed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring' }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/30 mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10" />
                    </motion.div>

                    <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                        You&apos;ve been unsubscribed
                    </h1>
                    <p className="text-muted-foreground font-medium mb-2 max-w-md mx-auto">
                        We&apos;ve removed
                    </p>
                    <p className="text-lg font-bold mb-8 break-all">{email}</p>
                    <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
                        Thanks for being with us. You&apos;ll no longer receive newsletter emails from HealthHere.
                    </p>

                    <Button
                        asChild
                        size="lg"
                        className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20"
                    >
                        <Link href="/">
                            <Home className="w-4 h-4 mr-2" />
                            Back to Home
                        </Link>
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
