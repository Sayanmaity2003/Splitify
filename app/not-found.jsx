import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900 text-white px-6 text-center">
      <h1 className="text-[120px] font-extrabold leading-none drop-shadow-lg animate-pulse">
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-semibold mb-4">
        Whoops! Page Not Found
      </h2>
      <p className="mb-6 text-violet-200 max-w-xl">
        The page you're looking for doesn't exist or has been moved. But don't worry, you can always head back home.
      </p>
      <Link
        href="/"
        className="bg-white text-violet-700 px-6 py-3 rounded-full font-medium shadow-lg hover:bg-violet-200 transition-colors duration-300"
      >
        ⬅️ Return Home
      </Link>
    </div>
  )
}