'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { createClient, MicroCMSContentId, MicroCMSDate } from 'microcms-js-sdk'
import JSZip from 'jszip'
import Papa from 'papaparse'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Content = any & Partial<MicroCMSContentId & MicroCMSDate>

export type KeyMapping = { id: number; endpoint: string; key: string }

export type DownloadHistoryEntry = {
  id: number
  serviceId: string
  defaultApiKey: string
  listEndpoints: string[]
  objectEndpoints: string[]
  keyMappings: KeyMapping[]
  createdAt: string
}

type EndpointInfo = {
  name: string
  type: 'list' | 'object'
}

type ProcessResult =
  | { status: 'fulfilled'; endpoint: string; csv: string }
  | { status: 'empty'; endpoint: string }
  | { status: 'rejected'; endpoint: string; reason: string }

const HISTORY_STORAGE_KEY = 'microcms-downloader-history'
const MAX_HISTORY_COUNT = 10
const MIN_LOADING_TIME = 2000 // 最低ローディング表示時間（ミリ秒）

const generateTimestamp = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}

const convertToCsv = (contents: Content[]): string => {
  if (contents.length === 0) {
    return ''
  }

  const contentsForCsv = contents.map((content) => {
    const newContent = { ...content }
    for (const key in newContent) {
      if (typeof newContent[key] === 'object' && newContent[key] !== null) {
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
  return Papa.unparse(contentsForCsv, { columns: header })
}

const triggerDownload = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export const useMicroCMSDownloader = () => {
  const [serviceId, setServiceId] = useState('')
  const [defaultApiKey, setDefaultApiKey] = useState('')
  const [listEndpoints, setListEndpoints] = useState<string[]>([])
  const [objectEndpoints, setObjectEndpoints] = useState<string[]>([])
  const [keyMappings, setKeyMappings] = useState<KeyMapping[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<DownloadHistoryEntry[]>([])

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory))
      }
    } catch (error) {
      console.error('Failed to load history from localStorage', error)
      toast.error('履歴の読み込みに失敗しました。')
    }
  }, [])

  const saveHistory = useCallback(() => {
    if (!serviceId || !defaultApiKey) return

    const newEntry: DownloadHistoryEntry = {
      id: Date.now(),
      serviceId,
      defaultApiKey,
      listEndpoints,
      objectEndpoints,
      keyMappings,
      createdAt: new Date().toISOString(),
    }

    try {
      const updatedHistory = [newEntry, ...history]
        .filter(
          (entry, index, self) =>
            index === self.findIndex((e) => e.serviceId === entry.serviceId)
        )
        .slice(0, MAX_HISTORY_COUNT)

      setHistory(updatedHistory)
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Failed to save history to localStorage', error)
      toast.error('履歴の保存に失敗しました。')
    }
  }, [
    serviceId,
    defaultApiKey,
    listEndpoints,
    objectEndpoints,
    keyMappings,
    history,
  ])

  const restoreFromHistory = useCallback((entry: DownloadHistoryEntry) => {
    setServiceId(entry.serviceId)
    setDefaultApiKey(entry.defaultApiKey)
    setListEndpoints(entry.listEndpoints)
    setObjectEndpoints(entry.objectEndpoints)
    setKeyMappings(entry.keyMappings)
    toast.success('履歴から設定を復元しました。')
  }, [])

  const clearHistory = useCallback(() => {
    try {
      setHistory([])
      localStorage.removeItem(HISTORY_STORAGE_KEY)
      toast.success('ダウンロード履歴を削除しました。')
    } catch (error) {
      console.error('Failed to clear history from localStorage', error)
      toast.error('履歴の削除に失敗しました。')
    }
  }, [])

  const validateInputs = useCallback(() => {
    const serviceIdRegex = /^[a-zA-Z0-9-]{3,32}$/
    if (!serviceIdRegex.test(serviceId)) {
      toast.error(
        'サービスIDは3文字以上32文字以下の半角英数字とハイフンのみ使用できます。'
      )
      return false
    }

    const apiKeyRegex = /^(?:[a-zA-Z0-9]{36}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/
    if (!apiKeyRegex.test(defaultApiKey)) {
      toast.error('APIキーの形式が正しくありません。')
      return false
    }

    if (listEndpoints.length === 0 && objectEndpoints.length === 0) {
      toast.error('最低1つのエンドポイントは必須です。')
      return false
    }
    return true
  }, [serviceId, defaultApiKey, listEndpoints, objectEndpoints])

  const processEndpoint = useCallback(
    async ({ name: endpoint, type }: EndpointInfo): Promise<ProcessResult> => {
      try {
        const apiKey =
          keyMappings.find((m) => m.endpoint === endpoint)?.key || defaultApiKey

        const client = createClient({ serviceDomain: serviceId, apiKey })

        let contents: Content[] = []
        if (type === 'list') {
          contents = await client.getAllContents<Content>({ endpoint })
        } else {
          const objectContent = await client.getObject<Content>({ endpoint })
          contents = objectContent ? [objectContent] : []
        }

        if (contents.length === 0) {
          return { status: 'empty', endpoint }
        }

        const csv = convertToCsv(contents)
        return { status: 'fulfilled', endpoint, csv }
      } catch (error) {
        let message =
          error instanceof Error ? error.message : '不明なエラーです。'
        if (message.includes('GET is forbidden')) {
          message =
            '指定されたAPIキーでGETリクエストが許可されていません。キーの権限を確認してください。'
        } else if (message.includes('404')) {
          message = 'エンドポイントが見つかりません。'
        } else if (
          message.includes('401') &&
          message.includes('X-MICROCMS-API-KEY header is invalid')
        ) {
          message = 'APIキーが正しくありません。'
        }
        return { status: 'rejected', endpoint, reason: message }
      }
    },
    [serviceId, defaultApiKey, keyMappings]
  )

  const handleDownload = async () => {
    if (!validateInputs()) return

    setIsLoading(true)
    const loadingToastId = toast.loading('コンテンツを取得・圧縮中です...')

    const timerPromise = new Promise((resolve) =>
      setTimeout(resolve, MIN_LOADING_TIME)
    )

    const downloadLogic = async () => {
      const allEndpoints: EndpointInfo[] = [
        ...listEndpoints.map((ep) => ({ name: ep, type: 'list' as const })),
        ...objectEndpoints.map((ep) => ({ name: ep, type: 'object' as const })),
      ]

      const results: ProcessResult[] = []
      for (const endpointInfo of allEndpoints) {
        const result = await processEndpoint(endpointInfo)
        results.push(result)
      }
      return results
    }

    const [processResults] = await Promise.all([downloadLogic(), timerPromise])

    const successfulResults = processResults.filter(
      (r): r is Extract<ProcessResult, { status: 'fulfilled' }> =>
        r.status === 'fulfilled'
    )
    const emptyEndpoints = processResults
      .filter((r) => r.status === 'empty')
      .map((r) => r.endpoint)
    const failedEndpoints = processResults.filter(
      (r): r is Extract<ProcessResult, { status: 'rejected' }> =>
        r.status === 'rejected'
    )

    // エラーハンドリング
    if (failedEndpoints.length > 0) {
      const errorGroups = new Map<string, string[]>()
      failedEndpoints.forEach((e) => {
        if (!errorGroups.has(e.reason)) {
          errorGroups.set(e.reason, [])
        }
        errorGroups.get(e.reason)!.push(e.endpoint)
      })

      const errorMessages = Array.from(errorGroups.entries())
        .map(([reason, endpoints]) => `[${endpoints.join(', ')}] ${reason}`)
        .join('\n')

      toast.error(`エラーが発生しました:\n${errorMessages}`, {
        id: loadingToastId,
        duration: 8000,
      })
      setIsLoading(false)
      return
    }

    if (successfulResults.length > 0) {
      const zip = new JSZip()
      successfulResults.forEach(({ endpoint, csv }) => {
        zip.file(`${endpoint}.csv`, csv)
      })

      const zipContent = await zip.generateAsync({ type: 'blob' })
      const fileName = `${serviceId}_exports_${generateTimestamp()}.zip`

      setTimeout(() => triggerDownload(zipContent, fileName), 100)

      saveHistory()

      let successMessage = `ダウンロードが完了しました (${successfulResults
        .map((r) => r.endpoint)
        .join(', ')})。`
      if (emptyEndpoints.length > 0) {
        successMessage += `\n${emptyEndpoints.join(
          ', '
        )} は0件のためスキップしました。`
      }
      toast.success(successMessage, { id: loadingToastId, duration: 6000 })
    } else {
      toast.error('指定されたAPIのコンテンツは全て0件でした。', {
        id: loadingToastId,
      })
    }

    setIsLoading(false)
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
    history,
    restoreFromHistory,
    clearHistory,
  }
}
