import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { YtDlp } from 'ytdlp-nodejs'
import { TRPCError } from '@trpc/server'
import path from 'path'
import fs from 'fs'
import NodeCache from 'node-cache'

// Define a minimal interface for the expected video info structure
interface VideoFormat {
  format_id?: string
  url?: string
  ext?: string
  protocol?: string
  height?: number
  width?: number
  tbr?: number // Average bitrate
  vcodec?: string
  acodec?: string
  filesize?: number
  format_note?: string
  resolution?: string
  // Add other fields if needed based on yt-dlp output
}

interface VideoInfo {
  url?: string // Direct URL for some platforms
  ext?: string
  protocol?: string
  formats?: VideoFormat[] // Array of formats (common for YouTube)
  // Add other top-level fields returned by yt-dlp --dump-single-json if needed
  title?: string
  thumbnail?: string
  duration?: number
}

// Cache for 5 minutes, check every 10 minutes for expired items
const infoCache = new NodeCache({ stdTTL: 300, checkperiod: 600 })

let ytDlpBinaryPath: string | null = null // Store the path globally within the module

// Function to determine and validate the yt-dlp binary path ONCE
function initializeYtDlpPath(): string {
  if (ytDlpBinaryPath) return ytDlpBinaryPath // Return cached path if already determined

  const binaryName = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
  const relativePath = path.join('bin', binaryName)
  const potentialPath = path.join(process.cwd(), relativePath)

  if (fs.existsSync(potentialPath)) {
    console.log(`Using bundled yt-dlp binary found at: ${potentialPath}`)
    // Optional: Add back executability check/chmod if needed for deployment
    ytDlpBinaryPath = potentialPath
    return ytDlpBinaryPath
  } else {
    // If not found in bin, attempt to use 'yt-dlp' from PATH
    // This requires yt-dlp to be globally installed and in the PATH
    console.warn(
      `WARN: yt-dlp binary not found at ${potentialPath}. Attempting to use 'yt-dlp' from PATH.`
    )
    // We can't easily verify if 'yt-dlp' in PATH works here, the library will try
    ytDlpBinaryPath = 'yt-dlp'
    return ytDlpBinaryPath
    // NOTE: If 'yt-dlp' isn't in PATH either, the ytdlp library call will fail later.
  }
}

// Initialize the path when the module loads
const determinedYtDlpPath = initializeYtDlpPath()

// Initialize ytdlp-nodejs instance with the determined path
const ytdlp = new YtDlp({ binaryPath: determinedYtDlpPath })

// Fetches video info, using cache if available
async function getCachedVideoInfo(videoUrl: string): Promise<VideoInfo> {
  const cacheKey = `videoInfo:${videoUrl}`
  const cachedData = infoCache.get<VideoInfo>(cacheKey)

  if (cachedData) {
    console.log(`Cache HIT for: ${videoUrl}`)
    return cachedData
  }

  console.log(
    `Cache MISS for: ${videoUrl}. Fetching via ytdlp-nodejs (Path: ${determinedYtDlpPath})`
  )
  try {
    const info = await ytdlp.getInfoAsync(videoUrl)
    const videoInfo = info as VideoInfo
    // Store in cache before returning
    infoCache.set(cacheKey, videoInfo)
    console.log(`Successfully fetched and cached info for: ${videoUrl}`)
    return videoInfo
  } catch (error: unknown) {
    console.error('ytdlp-nodejs execution failed:', error)
    // Improved error handling (moved inside this function)
    let errorMessage = 'Failed to fetch video information.'
    const currentPath = determinedYtDlpPath
    if (error instanceof Error) {
      // Add more specific error checks if needed
      if (error.message.includes('Unsupported URL')) {
        errorMessage = 'The provided URL is not supported.'
      } else if (
        error.message.includes('Unable to extract video data') ||
        error.message.includes('JSON metadata')
      ) {
        errorMessage = 'Could not extract video data from the URL.'
      } else if (
        error.message.includes('private video') ||
        error.message.includes('Login required')
      ) {
        errorMessage =
          'This video is private or requires login. Cookie support is needed.' // Hint for future feature
      } else if (error.message.includes('HTTP Error 404')) {
        errorMessage = 'Video not found (404 error).'
      } else if (
        error.message.includes('net::ERR_NAME_NOT_RESOLVED') ||
        error.message.includes('Temporary failure in name resolution')
      ) {
        errorMessage =
          'Could not resolve the website address. Check the URL or your connection.'
      } else if (
        error.message.includes('No such file or directory') ||
        error.message.includes('Command failed') ||
        error.message.includes('ENOENT')
      ) {
        errorMessage = `Failed to execute the video downloader tool. Ensure yt-dlp is installed and accessible. (Checked Path: ${currentPath})`
      }
    }
    // Throw TRPCError directly from here
    throw new TRPCError({
      code: 'BAD_REQUEST', // Or adjust code based on error type
      message: errorMessage,
      cause: error,
    })
  }
}

// Function to select a suitable download URL from video info
function selectDownloadUrl(info: VideoInfo): string | null {
  console.log('Selecting download URL from info:', info?.title ?? 'No Title')
  // Prefer direct download URL if available
  if (info.url && (info.ext === 'mp4' || info.protocol?.includes('http'))) {
    console.log(`Found direct download URL: ${info.url}`)
    return info.url
  }

  // If formats array exists, find the best MP4 format
  if (Array.isArray(info.formats)) {
    console.log(`Found ${info.formats.length} formats. Searching for MP4...`)
    // Filter MP4 formats with video and audio, and a URL
    const mp4Formats = info.formats.filter(
      (f): f is VideoFormat & { url: string } =>
        f.ext === 'mp4' &&
        f.vcodec !== 'none' &&
        f.acodec !== 'none' &&
        typeof f.url === 'string'
    )

    if (mp4Formats.length > 0) {
      // Sort by quality (height, then bitrate)
      mp4Formats.sort(
        (a, b) =>
          (b.height ?? 0) - (a.height ?? 0) || (b.tbr ?? 0) - (a.tbr ?? 0)
      )
      const bestFormat = mp4Formats[0]
      // Already checked for url in filter, but optional chaining is safe
      if (bestFormat?.url) {
        console.log(
          `Selected best MP4 format: ${bestFormat.format_id ?? 'N/A'} (${bestFormat.height ?? 'N/A'}p)`
        )
        return bestFormat.url
      }
    }

    // Fallback: Find any MP4 format with a URL
    const anyMp4 = info.formats.find(
      (f): f is VideoFormat & { url: string } =>
        f.ext === 'mp4' && typeof f.url === 'string'
    )
    if (anyMp4?.url) {
      console.log(`Selected fallback MP4 format: ${anyMp4.format_id ?? 'N/A'}`)
      return anyMp4.url
    }
  }

  console.warn('Could not find a suitable MP4 download URL in the video info.')
  return null
}

export const videoRouter = createTRPCRouter({
  // Procedure to get available formats
  getVideoFormats: publicProcedure
    .input(z.object({ url: z.string().url('Invalid URL provided.') }))
    .query(async ({ input }) => {
      // Changed to query as it's fetching data
      try {
        const videoInfo = await getCachedVideoInfo(input.url)
        // Filter and map formats for frontend suitability
        const usableFormats = (videoInfo.formats ?? [])
          .filter(
            (f) =>
              f.url &&
              (f.ext === 'mp4' || f.ext === 'webm' || f.acodec !== 'none')
          ) // Basic filter for usable formats
          .map((f) => ({
            formatId: f.format_id,
            resolution: f.resolution ?? `${f.width}x${f.height}`,
            ext: f.ext,
            note: f.format_note,
            fileSize: f.filesize, // Approx filesize if available
            acodec: f.acodec,
            vcodec: f.vcodec,
            tbr: f.tbr,
            // Create a user-friendly label
            label: `${f.ext?.toUpperCase()} - ${f.resolution ?? f.format_note ?? f.format_id}${f.acodec !== 'none' && f.vcodec === 'none' ? ' (Audio Only)' : ''}`,
          }))

        if (usableFormats.length === 0 && videoInfo.url) {
          // Handle cases where there's only a direct URL (often not YouTube)
          console.log('No formats array, using direct URL info')
          usableFormats.push({
            formatId: 'direct',
            resolution: videoInfo.title ?? 'Direct Link',
            ext: videoInfo.ext ?? 'unknown',
            note: 'Direct Download Link',
            fileSize: undefined,
            acodec: undefined,
            vcodec: undefined,
            tbr: undefined,
            label: `${videoInfo.ext?.toUpperCase() ?? 'Direct'} - ${videoInfo.title ?? 'Direct Link'}`,
          })
        }

        return {
          title: videoInfo.title ?? 'Untitled Video',
          formats: usableFormats,
        }
      } catch (error) {
        // Catch errors from getCachedVideoInfo and re-throw
        if (error instanceof TRPCError) {
          throw error
        }
        console.error('Unexpected error in getVideoFormats query:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred while fetching video formats.',
        })
      }
    }),

  // Procedure to get the final download link for a specific format
  getDownloadLink: publicProcedure
    .input(
      z.object({
        url: z.string().url('Invalid URL provided.'),
        formatId: z.string().min(1, 'Format ID must be selected.'), // Make formatId required
      })
    )
    .mutation(async ({ input }) => {
      // Remains mutation as it might have side effects later
      try {
        const videoInfo = await getCachedVideoInfo(input.url) // Fetch (potentially cached) info again
        let downloadUrl: string | undefined

        if (input.formatId === 'direct' && videoInfo.url) {
          downloadUrl = videoInfo.url
          console.log(`Returning direct download URL: ${downloadUrl}`)
        } else {
          const selectedFormat = videoInfo.formats?.find(
            (f) => f.format_id === input.formatId
          )
          downloadUrl = selectedFormat?.url
          if (downloadUrl) {
            console.log(
              `Found URL for format ${input.formatId}: ${downloadUrl}`
            )
          } else {
            console.error(
              `Format ID ${input.formatId} not found or has no URL for URL: ${input.url}`
            )
          }
        }

        if (!downloadUrl) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Could not find a download link for the selected format (${input.formatId}). Try another format.`,
          })
        }

        return { downloadUrl }
      } catch (error) {
        // Catch errors from getCachedVideoInfo and re-throw
        if (error instanceof TRPCError) {
          throw error
        }
        console.error('Unexpected error in getDownloadLink mutation:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'An unexpected error occurred while getting the download link.',
          cause: error,
        })
      }
    }),
})
