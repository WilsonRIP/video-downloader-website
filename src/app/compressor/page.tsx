'use client'

import React, { useState, useCallback } from 'react'
import pako from 'pako'

export default function CompressorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [compressedData, setCompressedData] = useState<Blob | null>(null)
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setOriginalSize(file.size)
      setCompressedData(null) // Reset compressed data if a new file is selected
      setCompressedSize(0)
      setError(null)
    } else {
      setSelectedFile(null)
      setOriginalSize(0)
      setError('No file selected.')
    }
  }

  const handleCompress = useCallback(async () => {
    if (!selectedFile) {
      setError('Please select a file first.')
      return
    }

    setIsLoading(true)
    setError(null)
    setCompressedData(null)
    setCompressedSize(0)

    console.log('Compression started for:', selectedFile.name)

    try {
      const reader = new FileReader()

      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            const fileData = new Uint8Array(event.target.result as ArrayBuffer)
            // Perform compression
            const compressed = pako.gzip(fileData)
            const blob = new Blob([compressed], { type: 'application/gzip' })

            setCompressedData(blob)
            setCompressedSize(blob.size)
            setIsLoading(false)
            console.log('Compression successful!')
          } catch (compressError) {
            console.error('Compression error:', compressError)
            const message = compressError instanceof Error ? compressError.message : 'Unknown compression error'
            setError(`Compression failed: ${message}`)
            setIsLoading(false)
          }
        } else {
          setError('Failed to read file.')
          setIsLoading(false)
        }
      }

      reader.onerror = (error) => {
        console.error('File reading error:', error)
        setError('Failed to read file.')
        setIsLoading(false)
      }

      // Read the file as ArrayBuffer
      reader.readAsArrayBuffer(selectedFile)

    } catch (error) {
      console.error('Error setting up file reader:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      setError(`An unexpected error occurred: ${message}`)
      setIsLoading(false)
    }

  }, [selectedFile])

  const handleDownload = () => {
    if (!compressedData || !selectedFile) return

    const url = URL.createObjectURL(compressedData)
    const link = document.createElement('a')
    link.href = url
    // Suggest a filename like originalname.gz
    link.download = `${selectedFile.name}.gz`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const compressionRatio = originalSize > 0 && compressedSize > 0
    ? (((originalSize - compressedSize) / originalSize) * 100).toFixed(2)
    : '0'

  return (
    <div className="min-h-screen text-gray-900 dark:text-white dark:bg-gradient-to-b dark:from-[#2e026d] dark:to-[#15162c]">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">File Compressor (Gzip)</h1>

        <div className="max-w-xl mx-auto bg-white/90 dark:bg-gray-800/70 rounded-lg shadow-xl backdrop-blur-sm p-8">
          <div className="mb-6">
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 w-full"
            >
              {selectedFile ? 'Change File' : 'Select File'}
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileChange}
            />
          </div>

          {selectedFile && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected File:</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Size: {formatBytes(originalSize)}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md">
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={handleCompress}
            disabled={!selectedFile || isLoading}
            className="w-full px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Compressing...
              </div>
            ) : (
              'Compress File'
            )}
          </button>

          {compressedData && compressedSize > 0 && (
            <div className="mt-8 p-4 border border-green-200 dark:border-green-700 rounded-md bg-green-50 dark:bg-green-900/50">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Compression Complete!</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">Original Size: {formatBytes(originalSize)}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">Compressed Size: <span className="font-bold">{formatBytes(compressedSize)}</span></p>
              <p className="text-sm text-green-600 dark:text-green-400">Reduced by: {compressionRatio}%</p>
              <button
                onClick={handleDownload}
                className="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                Download Compressed File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 