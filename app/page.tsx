'use client'

import { useState } from 'react'
import Head from 'next/head'
import { Toaster, toast } from 'react-hot-toast'
import styles from './Home.module.css'

// 必要なライブラリを直接インポート
import { createClient, MicroCMSContentId, MicroCMSDate } from 'microcms-js-sdk'
import JSZip from 'jszip'
import Papa from 'papaparse'

// 型定義
type KeyMapping = {
  id: number
  endpoint: string
  key: string
}
type Content = { id: string } & MicroCMSContentId &
  MicroCMSDate & { [key: string]: any }

export default function Home() {
  const [serviceId, setServiceId] = useState('')
  const [endpoints, setEndpoints] = useState<string[]>([])
  const [currentEndpoint, setCurrentEndpoint] = useState('')
  const [defaultApiKey, setDefaultApiKey] = useState('')
  const [showKeyOverrides, setShowKeyOverrides] = useState(false)
  const [keyMappings, setKeyMappings] = useState<KeyMapping[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDefaultKey, setShowDefaultKey] = useState(false) // Default key visibility
  const [showMappedKeys, setShowMappedKeys] = useState<Record<number, boolean>>(
    {}
  )

  // --- UI操作ハンドラ ---
  const handleAddEndpoint = () => {
    if (currentEndpoint && !endpoints.includes(currentEndpoint)) {
      setEndpoints([...endpoints, currentEndpoint])
      setCurrentEndpoint('')
    }
  }

  const handleRemoveEndpoint = (endpointToRemove: string) => {
    setEndpoints(endpoints.filter((endpoint) => endpoint !== endpointToRemove))
  }

  const addKeyMapping = () => {
    setKeyMappings([...keyMappings, { id: Date.now(), endpoint: '', key: '' }])
  }

  const removeKeyMapping = (id: number) => {
    setKeyMappings(keyMappings.filter((mapping) => mapping.id !== id))
  }

  const updateKeyMapping = (
    id: number,
    field: 'endpoint' | 'key',
    value: string
  ) => {
    setKeyMappings(
      keyMappings.map((mapping) =>
        mapping.id === id ? { ...mapping, [field]: value } : mapping
      )
    )
  }

  // --- メインのダウンロード処理 ---
  const handleDownload = async () => {
    if (!serviceId || endpoints.length === 0 || !defaultApiKey) {
      toast.error('サービスID、エンドポイント、デフォルトAPIキーは必須です。')
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading('コンテンツを取得・圧縮中です...')

    // 最低5秒待機するためのタイマーPromise
    const timerPromise = new Promise((resolve) => setTimeout(resolve, 5000))

    // 実際のダウンロード処理Promise
    // 成功した場合、{ blob, fileName } を返すように変更
    const downloadLogicPromise = (async () => {
      try {
        const zip = new JSZip()

        for (const endpoint of endpoints) {
          const apiKey =
            keyMappings.find((m) => m.endpoint === endpoint)?.key ||
            defaultApiKey
          if (!apiKey) {
            throw new Error(`${endpoint}用のAPIキーがありません。`)
          }
          const client = createClient({
            serviceDomain: serviceId,
            apiKey: apiKey,
          })
          const allContents = await client.getAllContents<Content>({ endpoint })
          if (allContents.length === 0) continue
          const contentsForCsv = allContents.map((content) => {
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
          contentsForCsv.forEach((item) => {
            Object.keys(item).forEach((key) => allKeys.add(key))
          })
          const header = Array.from(allKeys)
          const csv = Papa.unparse(contentsForCsv, { columns: header })
          zip.file(`${endpoint}.csv`, csv)
        }

        const zipContent = await zip.generateAsync({ type: 'blob' })
        if (zipContent.size === 0) {
          throw new Error('ダウンロード対象のコンテンツがありませんでした。')
        }

        // ファイル名とBlobを結果として返す
        return {
          blob: zipContent,
          fileName: `microcms-export_${
            new Date().toISOString().split('T')[0]
          }.zip`,
        }
      } catch (error) {
        // エラーはPromise.rejectで包んで、外のcatchブロックに渡す
        throw error
      }
    })()

    try {
      // 両方のPromiseが完了するのを待つ
      const [downloadResult] = await Promise.all([
        downloadLogicPromise,
        timerPromise,
      ])

      // ダウンロード処理が成功した場合のみトーストとダウンロードを実行
      if (downloadResult) {
        // 先に成功トーストを表示
        toast.success('ダウンロードが完了しました！', { id: loadingToastId })

        // トーストが表示されるのを待つため、少しだけ遅延させる
        setTimeout(() => {
          // ダウンロードリンクを生成してクリック
          const url = window.URL.createObjectURL(downloadResult.blob)
          const a = document.createElement('a')
          a.href = url
          a.download = downloadResult.fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
        }, 100) // 100ミリ秒の遅延
      }
    } catch (error: any) {
      console.error(error)
      const errorMessage = error.message || 'エラーが発生しました。'
      toast.error(errorMessage, { id: loadingToastId })
    } finally {
      setIsLoading(false)
    }
  }

  // --- JSX (UI部分) ---
  return (
    <>
      <Head>
        <title>microCSV</title>
      </Head>
      <Toaster position="top-right" />

      <main className={styles.main}>
        <h1>microCMS Exporter</h1>
        <p>
          複数のエンドポイントからコンテンツを一括で取得し、ZIP形式でダウンロードします。
        </p>

        {/* --- Service ID Input --- */}
        <div className={styles.formSection}>
          <label htmlFor="serviceId">サービスID:</label>
          <input
            id="serviceId"
            type="text"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={isLoading}
            className={styles.input}
            style={{ paddingRight: '10px' }} // This one doesn't need a button
          />
        </div>

        {/* --- Endpoints Input --- */}
        <div className={styles.formSection}>
          <label htmlFor="endpoints">APIエンドポイント (Enterで追加):</label>
          <div className={styles.tagContainer}>
            {endpoints.map((ep) => (
              <div key={ep} className={styles.tag}>
                {ep}
                <button
                  onClick={() => handleRemoveEndpoint(ep)}
                  className={styles.tagRemoveButton}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <input
            id="endpoints"
            type="text"
            value={currentEndpoint}
            onChange={(e) => setCurrentEndpoint(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && (e.preventDefault(), handleAddEndpoint())
            }
            disabled={isLoading}
            className={styles.input}
            style={{ paddingRight: '10px' }} // This one doesn't need a button
          />
        </div>

        {/* --- Default API Key Input with Toggle Button --- */}
        <div className={styles.formSection}>
          <label htmlFor="defaultApiKey">デフォルトAPIキー:</label>
          <div className={styles.inputWrapper}>
            <input
              id="defaultApiKey"
              type={showDefaultKey ? 'text' : 'password'}
              value={defaultApiKey}
              onChange={(e) => setDefaultApiKey(e.target.value)}
              disabled={isLoading}
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowDefaultKey(!showDefaultKey)}
              className={styles.keyToggleButton}
              aria-label="APIキーの表示を切り替える"
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>
                {showDefaultKey ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
        </div>

        <div className={styles.infoBox}>
          <h4>【ご確認ください】 APIキーの権限について</h4>
          <p>
            ダウンロードされるコンテンツは、使用するAPIキーの権限設定に依存します。
            <br />- <b>下書き</b>を含めたい場合:
            APIキーの設定で「下書きコンテンツの全取得」にチェックを入れてください。
            <br />- <b>公開終了</b>を含めたい場合:
            APIキーの設定で「公開終了コンテンツの全取得」にチェックを入れてください。
          </p>
        </div>

        {/* --- Individual Key Overrides Section --- */}
        <div className={styles.formSection}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={showKeyOverrides}
              onChange={(e) => setShowKeyOverrides(e.target.checked)}
            />
            特定のエンドポイントに別のキーを使う
          </label>

          {showKeyOverrides && (
            <div className={styles.overridesContainer}>
              {keyMappings.map((mapping) => (
                <div key={mapping.id} className={styles.mappingRow}>
                  <input
                    type="text"
                    placeholder="エンドポイント名"
                    value={mapping.endpoint}
                    onChange={(e) =>
                      updateKeyMapping(mapping.id, 'endpoint', e.target.value)
                    }
                    className={styles.input}
                    style={{ paddingRight: '10px' }}
                  />
                  {/* --- Mapped API Key Input with Toggle Button --- */}
                  <div className={styles.inputWrapper} style={{ flexGrow: 1 }}>
                    <input
                      type={showMappedKeys[mapping.id] ? 'text' : 'password'}
                      placeholder="対応するAPIキー"
                      value={mapping.key}
                      onChange={(e) =>
                        updateKeyMapping(mapping.id, 'key', e.target.value)
                      }
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowMappedKeys((prev) => ({
                          ...prev,
                          [mapping.id]: !prev[mapping.id],
                        }))
                      }
                      className={styles.keyToggleButton}
                      aria-label="APIキーの表示を切り替える"
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: '20px' }}
                      >
                        {showMappedKeys[mapping.id]
                          ? 'visibility'
                          : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => removeKeyMapping(mapping.id)}
                    className={styles.removeRowButton}
                  >
                    -
                  </button>
                </div>
              ))}
              <button onClick={addKeyMapping} className={styles.addRowButton}>
                + キー設定を追加
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          className={styles.downloadButton}
        >
          {isLoading ? '処理中です...' : 'ZIPダウンロード'}
        </button>
      </main>
    </>
  )
}
