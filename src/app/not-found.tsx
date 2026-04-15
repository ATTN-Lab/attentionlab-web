import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="max-w-xl text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold mb-4">
          404
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          Lost in the barrier.
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-10">
          This page did not cross over. The link may be broken, or the page
          may have moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-full bg-[#3E317D] text-white font-semibold hover:bg-[#2e245e] transition-colors"
        >
          Back to Attention Labs
        </Link>
      </div>
    </main>
  );
}
