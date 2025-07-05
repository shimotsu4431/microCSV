'use client'

import { useState } from 'react'
import Head from 'next/head'
import { Toaster, toast } from 'react-hot-toast'
import styles from './Home.module.css' // CSSモジュールをインポート

// 型定義
type KeyMapping = {
  id: number
  endpoint: string
  key: string
}

export default function Home() {
  // State管理とハンドラ関数は変更なし
  const [serviceId, setServiceId] = useState('')
  const [endpoints, setEndpoints] = useState<string[]>([])
  const [currentEndpoint, setCurrentEndpoint] = useState('')
  const [defaultApiKey, setDefaultApiKey] = useState('')
  const [showKeyOverrides, setShowKeyOverrides] = useState(false)
  const [keyMappings, setKeyMappings] = useState<KeyMapping[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const handleDownload = async () => {
    if (!serviceId || endpoints.length === 0 || !defaultApiKey) {
      toast.error('サービスID、エンドポイント、デフォルトAPIキーは必須です。')
      return
    }
    setIsLoading(true)
    const loadingToastId = toast.loading('コンテンツを取得・圧縮中です...')
    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          endpoints,
          defaultApiKey,
          keyMappings: keyMappings.map(({ id, ...rest }) => rest),
        }),
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'ダウンロードに失敗しました。')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download =
        res.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          .replace(/"/g, '') || 'export.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success('ダウンロードが完了しました！', { id: loadingToastId })
    } catch (error: any) {
      toast.error(error.message, { id: loadingToastId })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>microCSV</title>
      </Head>
      <Toaster position="top-right" />

      <main className={styles.main}>
        <h1>microCSV</h1>
        <p>
          microCMSから、複数のエンドポイントを対象にコンテンツを一括で取得し（CSV）、ZIP形式でダウンロードするツールです。
        </p>

        {/* --- 入力フォーム --- */}
        <div className={styles.formSection}>
          <label htmlFor="serviceId">サービスID:</label>
          <input
            id="serviceId"
            type="text"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={isLoading}
            className={styles.input}
          />
        </div>

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
          />
        </div>

        <div className={styles.formSection}>
          <label htmlFor="defaultApiKey">デフォルトAPIキー:</label>
          <input
            id="defaultApiKey"
            type="password"
            value={defaultApiKey}
            onChange={(e) => setDefaultApiKey(e.target.value)}
            disabled={isLoading}
            className={styles.input}
          />
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

        {/* --- 個別キー設定 --- */}
        <div className={styles.formSection}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                  />
                  <input
                    type="password"
                    placeholder="対応するAPIキー"
                    value={mapping.key}
                    onChange={(e) =>
                      updateKeyMapping(mapping.id, 'key', e.target.value)
                    }
                    className={styles.input}
                    style={{ flexGrow: 1 }}
                  />
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

        {/* --- ダウンロードボタン --- */}
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
