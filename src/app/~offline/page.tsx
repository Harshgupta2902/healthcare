"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-md dark:bg-black/40">
        <div className="mb-4 text-5xl">📡</div>
        <h1 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
          You&apos;re Offline
        </h1>
        <p className="mt-2 max-w-md text-gray-600 dark:text-gray-300">
          It looks like you&apos;ve lost your internet connection. Please check your
          network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-teal-600 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
