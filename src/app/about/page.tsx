export default async function AboutPage() {
  return (
    <main className="min-h-screen py-12 px-4 text-gray-900 dark:text-white dark:bg-gradient-to-b dark:from-[#2e026d] dark:to-[#15162c]">
      <div className="container mx-auto max-w-3xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 dark:text-white">
          About This Video Downloader
        </h1>

        <div className="space-y-10 rounded-lg bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/70">
          {/* About Section */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Our Mission
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              This tool provides a simple and efficient way to download videos
              from various popular platforms like Instagram, TikTok, YouTube,
              Threads, and more, directly to your device.
            </p>
          </section>

          {/* How It Works Section */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              How It Works
            </h2>
            <ol className="list-inside list-decimal space-y-2 text-gray-700 dark:text-gray-300">
              <li>Find the video you want to download on its respective platform.</li>
              <li>Copy the URL (link) of the video.</li>
              <li>Paste the URL into the input field on our homepage.</li>
              <li>Click the &apos;Download&apos; button.</li>
              <li>Select the desired format or quality (if available) and save the video.</li>
            </ol>
          </section>

          {/* Features Section */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Features
            </h2>
            <ul className="list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
              <li>Supports multiple platforms (Instagram, TikTok, YouTube, etc.).</li>
              <li>Easy-to-use interface: just copy and paste the URL.</li>
              <li>Fast download speeds.</li>
              <li>No registration required.</li>
              <li>Works on desktop and mobile browsers.</li>
            </ul>
          </section>
        </div>

        {/* Footer Credit */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Made by WilsonRIP w/ help from Sean
          </p>
        </div>
      </div>
    </main>
  )
}
