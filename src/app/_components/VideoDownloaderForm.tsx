'use client'

import { useState, useEffect } from 'react'
import { api } from '~/trpc/react' // Import the tRPC API client

// Define type for format options received from backend
interface FormatOption {
  formatId: string | undefined
  label: string | undefined
  // Add other fields if needed for display
}

export default function VideoDownloaderForm() {
  const [url, setUrl] = useState('')
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null)
  const [selectedFormatId, setSelectedFormatId] = useState<string | null>(null)

  // Get tRPC context/utils to access query client
  const utils = api.useUtils()

  // Use the tRPC mutation hook
  const downloadMutation = api.video.getDownloadLink.useMutation()

  // Query to get formats (runs when submittedUrl changes and is valid)
  const formatsQuery = api.video.getVideoFormats.useQuery(
    { url: submittedUrl! }, // Assert non-null because `enabled` checks it
    {
      enabled: !!submittedUrl && submittedUrl.length > 5, // Only run when submittedUrl is set and looks like a URL
      retry: false, // Don't retry on format fetch failure
      refetchOnWindowFocus: false, // Don't refetch formats on window focus
      staleTime: 5 * 60 * 1000, // Consider formats data fresh for 5 mins
    }
  )

  // --- State derived from hooks ---
  const isLoadingFormats = formatsQuery.isFetching
  const formatsError = formatsQuery.error?.message ?? null
  const videoTitle = formatsQuery.data?.title
  const availableFormats: FormatOption[] = formatsQuery.data?.formats ?? []

  const isLoadingLink = downloadMutation.isPending
  const linkError = downloadMutation.error?.message ?? null
  const downloadLink = downloadMutation.data?.downloadUrl ?? null

  // --- Effects ---
  // Reset states when URL changes
  useEffect(() => {
    setSubmittedUrl(null)
    setSelectedFormatId(null)
    // Use queryClient to reset the specific query state
    void utils.video.getVideoFormats.reset()
    void downloadMutation.reset() // Mark promise as intentionally ignored
  }, [url]) // Only depend on url

  // Auto-select the first format when formats load
  useEffect(() => {
    if (availableFormats.length > 0 && !selectedFormatId) {
      // Default to the first format (often 'direct' or highest quality)
      setSelectedFormatId(availableFormats[0]?.formatId ?? null)
    }
    // Reset selected format if the available formats change and the current selection is no longer valid
    else if (
      availableFormats.length > 0 &&
      selectedFormatId &&
      !availableFormats.some((f) => f.formatId === selectedFormatId)
    ) {
      setSelectedFormatId(availableFormats[0]?.formatId ?? null)
    }
    // If no formats are available, ensure nothing is selected
    else if (availableFormats.length === 0) {
      setSelectedFormatId(null)
    }
  }, [availableFormats])

  // --- Handlers ---
  // Trigger fetching formats
  const handleFetchFormats = (e: React.FormEvent) => {
    e.preventDefault()
    if (url) {
      // Clear previous results before fetching new ones
      setSelectedFormatId(null)
      downloadMutation.reset()
      // Setting submittedUrl triggers the formatsQuery
      setSubmittedUrl(url)
    }
  }

  // Trigger fetching the download link for the selected format
  const handleGetDownloadLink = () => {
    if (submittedUrl && selectedFormatId) {
      downloadMutation.mutate({ url: submittedUrl, formatId: selectedFormatId })
    }
  }

  // Combined loading state
  const isProcessing = isLoadingFormats || isLoadingLink

  return (
    <div className="w-full max-w-xl space-y-6">
      {/* URL Input Form */}
      <form onSubmit={handleFetchFormats} className="space-y-4">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            // Optionally reset mutation state on input change
            if (downloadMutation.status !== 'idle') {
              downloadMutation.reset()
            }
          }}
          placeholder="Enter video URL (Instagram, TikTok, YouTube, Threads)"
          required
          className="w-full rounded-md border border-gray-300 bg-white/[0.1] px-4 py-2 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none"
          disabled={isProcessing}
        />
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isProcessing || !url || submittedUrl === url} // Disable if already submitted this URL
        >
          {isLoadingFormats ? 'Fetching Formats...' : 'Fetch Available Formats'}
        </button>
      </form>

      {/* Display Format Fetching Error */}
      {formatsError && (
        <p className="text-center text-red-500">
          Error fetching formats: {formatsError}
        </p>
      )}

      {/* Format Selection and Download Button (shown after formats are loaded) */}
      {submittedUrl &&
        !isLoadingFormats &&
        !formatsError &&
        availableFormats.length > 0 && (
          <div className="space-y-4 rounded-md bg-white/5 p-6">
            <h3 className="text-center text-lg font-semibold text-gray-200">
              {videoTitle}
            </h3>
            <select
              value={selectedFormatId ?? ''}
              onChange={(e) => {
                setSelectedFormatId(e.target.value)
                downloadMutation.reset() // Reset link state if format changes
              }}
              className="w-full rounded-md border border-gray-300 bg-white/[0.1] px-4 py-2 text-white focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none"
              disabled={isProcessing}
            >
              <option value="" disabled>
                -- Select a format --
              </option>
              {availableFormats.map((format) => (
                <option
                  key={format.formatId ?? 'direct'}
                  value={format.formatId ?? 'direct'}
                >
                  {format.label ?? format.formatId}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleGetDownloadLink}
              className="w-full rounded-md bg-purple-600 px-4 py-2 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isProcessing || !selectedFormatId}
            >
              {isLoadingLink ? 'Processing Link...' : 'Get Download Link'}
            </button>
          </div>
        )}

      {/* Display Download Link Error */}
      {linkError && (
        <p className="text-center text-red-500">
          Error getting link: {linkError}
        </p>
      )}

      {/* Display Download Link */}
      {downloadLink && !isLoadingLink && !linkError && (
        <div className="mt-6 text-center">
          <p className="mb-2">Your download is ready:</p>
          <a
            href={downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            download // Suggests the browser download the linked file
            className="inline-block rounded-md bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Download Video
          </a>
          {/* Add a note about placeholder */}
          <p className="mt-4 text-sm text-gray-400">
            (Note: This is a placeholder link. Backend download logic needs
            implementation.)
          </p>
        </div>
      )}

      {/* Display general notes if no results yet */}
      {!submittedUrl && (
        <p className="mt-8 text-center text-xs text-gray-500">
          Enter a video URL and click &quot;Fetch Available Formats&quot; to
          begin.
        </p>
      )}
      {submittedUrl &&
        !isProcessing &&
        !formatsError &&
        availableFormats.length === 0 && (
          <p className="mt-8 text-center text-yellow-400">
            No downloadable formats found for this URL.
          </p>
        )}
    </div>
  )
}
