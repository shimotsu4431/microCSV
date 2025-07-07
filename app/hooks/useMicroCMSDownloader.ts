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

    const successfulEndpoints: string[] = []
    const emptyEndpoints: string[] = []

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 3000))

    const downloadLogicPromise = (async () => {
      const zip = new JSZip()
      const allEndpoints = [
        ...listEndpoints.map((ep) => ({ name: ep, type: 'list' as const })),
        ...objectEndpoints.map((ep) => ({ name: ep, type: 'object' as const })),
      ]

      for (const { name: endpoint, type } of allEndpoints) {
        try {
          const apiKey =
            keyMappings.find((m) => m.endpoint === endpoint)?.key ||
            defaultApiKey
          if (!apiKey) throw new Error(`用のAPIキーがありません。`)

          const client = createClient({
            serviceDomain: serviceId,
            apiKey: apiKey,
          })
          let contents: Content[] = []

          if (type === 'list') {
            contents = await client.getAllContents<Content>({ endpoint })
          } else {
            const objectContent = await client.getObject<Content>({ endpoint })
            contents = [objectContent]
          }

          if (contents.length === 0) {
            emptyEndpoints.push(endpoint)
            continue
          }

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
          successfulEndpoints.push(endpoint)
        } catch (error) {
          const message =
            error instanceof Error ? error.message : '不明なエラーです。'
          throw new Error(`[${endpoint}] ${message}`)
        }
      }

      if (successfulEndpoints.length === 0) {
        return null
      }

      const zipContent = await zip.generateAsync({ type: 'blob' })

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
        let successMessage = `ダウンロードが完了しました (${successfulEndpoints.join(
          ', '
        )})。`
        if (emptyEndpoints.length > 0) {
          successMessage += `\n${emptyEndpoints.join(
            ', '
          )} は0件のためスキップしました。`
        }
        toast.success(successMessage, { id: loadingToastId, duration: 6000 })

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
      } else {
        if (emptyEndpoints.length > 0) {
          toast.error('指定されたAPIのコンテンツは全て0件でした。', {
            id: loadingToastId,
          })
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      let errorMessage = 'エラーが発生しました。'
      if (error instanceof Error) {
        errorMessage = error.message
        if (!errorMessage.includes('404')) {
          console.error(error)
        }
      } else {
        console.error(error)
      }
      toast.error(errorMessage, {
        id: loadingToastId,
        duration: 6000,
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
