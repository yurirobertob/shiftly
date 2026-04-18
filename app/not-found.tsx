import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFB]">
      <h1 className="text-7xl font-bold text-[#1B6545]">404</h1>
      <p className="text-lg text-gray-500 mt-4">Page not found</p>
      <p className="text-sm text-gray-400 mt-1">The page you're looking for doesn't exist or has been moved.</p>
      <Link
        href="/dashboard"
        className="mt-8 inline-flex items-center gap-1 text-[#1B6545] font-medium hover:underline transition"
      >
        Go to dashboard →
      </Link>
    </div>
  );
}
