// import Link from 'next/link' // Removed unused import

// import { LatestPost } from '~/app/_components/post' // Removed unused import
import { auth } from '~/server/auth'
import { api, HydrateClient } from '~/trpc/server'
import VideoDownloaderForm from '~/app/_components/VideoDownloaderForm'

export default async function Home() {
  // const hello = await api.post.hello({ text: 'from tRPC' }) // Removed unused variable
  const session = await auth()

  if (session?.user) {
    void api.post.getLatest.prefetch()
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight text-black sm:text-[5rem] dark:text-white">
            Video Downloader
          </h1>
          <VideoDownloaderForm />
        </div>
      </main>
    </HydrateClient>
  )
}
