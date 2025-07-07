'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { createClient } from 'microcms-js-sdk'
import JSZip from 'jszip'
import Papa from 'papaparse'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Content = any
type KeyMapping = { id: number; endpoint: string; key: string }

export const useMicroCMSDownloader = () => {
  const [serviceId, setServiceId] = useState('')
  const [defaultApiKey, setDefaultApiKey] = useState('')
  const [listEndpoints, setListEndpoints] = useState<string[]>([])
  const [objectEndpoints, setObjectEndpoints] = useState<string[]>([])
  const [keyMappings, setKeyMappings] = useState<KeyMapping[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleDownload = async () => {
    if (
      !serviceId ||
      (listEndpoints.length === 0 && objectEndpoints.length === 0) ||
      !defaultApiKey
    ) {
      toast.error(
        'サービスID、デフォルトAPIキー、最低1つのエンドポイントは必須です。'
      )
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading('コンテンツを取得・圧縮中です...')

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 5000))

    const downloadLogicPromise = (async () => {
      const zip = new JSZip()

      const processEndpoint = async (
        endpoint: string,
        type: 'list' | 'object'
      ) => {
        const apiKey =
          keyMappings.find((m) => m.endpoint === endpoint)?.key || defaultApiKey
        if (!apiKey) throw new Error(`${endpoint}用のAPIキーがありません。`)

        const client = createClient({
          serviceDomain: serviceId,
          apiKey: apiKey,
        })
        let contents: Content[] = []

        if (type === 'list') {
          contents = await client.getAllContents<Content>({
            endpoint,
          })
        } else {
          const objectContent = await client.getObject<Content>({ endpoint })
          contents = [objectContent]
        }

        if (contents.length === 0) return

        const contentsForCsv = contents.map((content) => {
          const newContent = { ...content }
          for (const key in newContent) {
            if (
              typeof newContent[key] === 'object' &&
              newContent[key] !== null
            ) {
              newContent[key] = JSON.stringify(newContent[key])
            }
          }
          return newContent
        })

        const allKeys = new Set<string>()
        contentsForCsv.forEach((item) =>
          Object.keys(item).forEach((key) => allKeys.add(key))
        )
        const header = Array.from(allKeys)
        const csv = Papa.unparse(contentsForCsv, { columns: header })
        zip.file(`${endpoint}.csv`, csv)
      }

      try {
        for (const endpoint of listEndpoints) {
          await processEndpoint(endpoint, 'list')
        }
        for (const endpoint of objectEndpoints) {
          await processEndpoint(endpoint, 'object')
        }
      } catch (error) {
        throw error
      }

      const zipContent = await zip.generateAsync({ type: 'blob' })
      if (zipContent.size === 0) {
        throw new Error('ダウンロード対象のコンテンツがありませんでした。')
      }

      return {
        blob: zipContent,
        fileName: `microcms-export_${
          new Date().toISOString().split('T')[0]
        }.zip`,
      }
    })()

    try {
      const result = await Promise.all([downloadLogicPromise, timerPromise])
      const downloadResult = result[0]

      if (downloadResult) {
        toast.success('ダウンロードが完了しました！', { id: loadingToastId })
        setTimeout(() => {
          const url = window.URL.createObjectURL(downloadResult.blob)
          const a = document.createElement('a')
          a.href = url
          a.download = downloadResult.fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
        }, 100)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'エラーが発生しました。', {
        id: loadingToastId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return {
    serviceId,
    setServiceId,
    defaultApiKey,
    setDefaultApiKey,
    listEndpoints,
    setListEndpoints,
    objectEndpoints,
    setObjectEndpoints,
    keyMappings,
    setKeyMappings,
    isLoading,
    handleDownload,
  }
}
