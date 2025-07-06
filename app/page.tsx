'use client'

import { useState } from 'react'
import Head from 'next/head'
import { Toaster, toast } from 'react-hot-toast'
import styles from './Home.module.css'
import { createClient, MicroCMSContentId, MicroCMSDate } from 'microcms-js-sdk'
import JSZip from 'jszip'
import Papa from 'papaparse'

// --- 型定義 ---
type KeyMapping = { id: number; endpoint: string; key: string }
type Content = any

export default function Home() {
  // --- State管理 ---
  const [serviceId, setServiceId] = useState('')
  const [defaultApiKey, setDefaultApiKey] = useState('')
  const [showDefaultKey, setShowDefaultKey] = useState(false)

  // List-API states
  const [listEndpoints, setListEndpoints] = useState<string[]>([])
  const [currentListEndpoint, setCurrentListEndpoint] = useState('')

  // Object-API states
  const [objectEndpoints, setObjectEndpoints] = useState<string[]>([])
  const [currentObjectEndpoint, setCurrentObjectEndpoint] = useState('')

  const [showKeyOverrides, setShowKeyOverrides] = useState(false)
  const [keyMappings, setKeyMappings] = useState<KeyMapping[]>([])
  const [showMappedKeys, setShowMappedKeys] = useState<Record<number, boolean>>(
    {}
  )
  const [isLoading, setIsLoading] = useState(false)

  // --- UI操作ハンドラ ---
  const handleAddEndpoint = (type: 'list' | 'object') => {
    if (
      type === 'list' &&
      currentListEndpoint &&
      !listEndpoints.includes(currentListEndpoint)
    ) {
      setListEndpoints([...listEndpoints, currentListEndpoint])
      setCurrentListEndpoint('')
    } else if (
      type === 'object' &&
      currentObjectEndpoint &&
      !objectEndpoints.includes(currentObjectEndpoint)
    ) {
      setObjectEndpoints([...objectEndpoints, currentObjectEndpoint])
      setCurrentObjectEndpoint('')
    }
  }

  const handleRemoveEndpoint = (
    type: 'list' | 'object',
    endpointToRemove: string
  ) => {
    if (type === 'list') {
      setListEndpoints(listEndpoints.filter((ep) => ep !== endpointToRemove))
    } else {
      setObjectEndpoints(
        objectEndpoints.filter((ep) => ep !== endpointToRemove)
      )
    }
  }

  const addKeyMapping = () =>
    setKeyMappings([...keyMappings, { id: Date.now(), endpoint: '', key: '' }])
  const removeKeyMapping = (id: number) =>
    setKeyMappings(keyMappings.filter((m) => m.id !== id))
  const updateKeyMapping = (
    id: number,
    field: 'endpoint' | 'key',
    value: string
  ) => {
    setKeyMappings(
      keyMappings.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  // --- メインのダウンロード処理 ---
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
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'エラーが発生しました。', {
        id: loadingToastId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    serviceId.trim() !== '' &&
    defaultApiKey.trim() !== '' &&
    (listEndpoints.length > 0 || objectEndpoints.length > 0)

  // --- JSX (UI部分) ---
  return (
    <>
      <Head>
        <title>microCMS Exporter</title>
      </Head>
      <Toaster position="top-right" />

      <main className={styles.main}>
        <h1>microCMS Exporter</h1>
        <div className={styles.overview}>
          <p>
            このツールでは、microCMSのコンテンツデータを一括で取得し、CSV形式のファイルとしてZIPでダウンロードします。
            <br />
            <strong>
              APIキーなどの情報は外部に送信されず、すべての処理はあなたのブラウザ内で完結するため安全です。
            </strong>
          </p>
          <p>
            なお、本ツールはOSSとして公開されており、GitHubでソースコードを確認できます。
            <br />
            リポジトリ:{' '}
            <a
              href="https://github.com/shimotsu4431/microcms-downloader-tool"
              target="_blank"
            >
              https://github.com/shimotsu4431/microcms-downloader-tool
            </a>
          </p>
        </div>

        <div className={styles.usageList}>
          <h4>基本的な使い方</h4>
          <ol>
            <li>
              <b>共通設定</b>
              に、あなたのmicroCMSのサービスIDとAPIキーを入力します
            </li>
            <li>
              <b>エクスポートするAPI</b>
              に、ダウンロードしたいAPIのエンドポイント名を入力します（Enterで追加）
            </li>
            <li>
              ［CSVファイルをダウンロード］をクリックすると、処理が開始されます
            </li>
          </ol>
        </div>

        <div className={styles.exportSection}>
          <h2>共通設定</h2>
          <div className={styles.formSection}>
            <label htmlFor="serviceId">サービスID:</label>
            <input
              id="serviceId"
              type="text"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={isLoading}
              className={styles.input}
              style={{ paddingRight: '10px' }}
            />
          </div>
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
            <h3>💡APIキーの権限について</h3>
            <p>
              APIキーの<strong>「GET」権限</strong>を付与してご利用ください。
              <br />
              また、ダウンロードされるコンテンツは、使用する
              <a
                href="https://document.microcms.io/content-api/x-microcms-api-key"
                target="_blank"
              >
                APIキーの権限設定
              </a>
              に依存します。
            </p>
            <ul>
              <li>
                <b>「下書き」のコンテンツ</b>を含めたい場合:
                APIキーの設定で「下書きコンテンツの全取得」にチェックを入れてください。
              </li>
              <li>
                <b>「公開終了」のコンテンツ</b>を含めたい場合:
                APIキーの設定で「公開終了コンテンツの全取得」にチェックを入れてください。
              </li>
            </ul>
          </div>
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
                    <div
                      className={styles.inputWrapper}
                      style={{ flexGrow: 1 }}
                    >
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
                      aria-label="このキー設定を削除"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                ))}
                <button onClick={addKeyMapping} className={styles.addRowButton}>
                  + キー設定を追加
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.exportSection}>
          <h2>エクスポートするAPI</h2>
          <div className={styles.formSection}>
            <label htmlFor="list-endpoints">
              リスト形式APIのエンドポイント (Enterで追加):
            </label>
            {listEndpoints.length > 0 && (
              <div className={styles.tagContainer}>
                {listEndpoints.map((ep) => (
                  <div key={ep} className={styles.tag}>
                    {ep}
                    <button
                      onClick={() => handleRemoveEndpoint('list', ep)}
                      className={styles.tagRemoveButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              id="list-endpoints"
              type="text"
              value={currentListEndpoint}
              onChange={(e) => setCurrentListEndpoint(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                (e.preventDefault(), handleAddEndpoint('list'))
              }
              disabled={isLoading}
              className={styles.input}
              style={{ paddingRight: '10px' }}
            />
          </div>

          <div className={styles.formSection}>
            <label htmlFor="object-endpoints">
              オブジェクト形式APIのエンドポイント (Enterで追加):
            </label>
            {objectEndpoints.length > 0 && (
              <div className={styles.tagContainer}>
                {objectEndpoints.map((ep) => (
                  <div key={ep} className={styles.tag}>
                    {ep}
                    <button
                      onClick={() => handleRemoveEndpoint('object', ep)}
                      className={styles.tagRemoveButton}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              id="object-endpoints"
              type="text"
              value={currentObjectEndpoint}
              onChange={(e) => setCurrentObjectEndpoint(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                (e.preventDefault(), handleAddEndpoint('object'))
              }
              disabled={isLoading}
              className={styles.input}
              style={{ paddingRight: '10px' }}
            />
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading || !isFormValid}
          className={styles.downloadButton}
        >
          {isLoading ? '処理中です...' : 'CSVファイルをダウンロード'}
        </button>
        <div className={styles.makerInfo}>
          <p>
            作者:{' '}
            <a href="https://x.com/shimotsu_" target="blank_">
              @shimotsu_
            </a>
          </p>
        </div>
      </main>
    </>
  )
}
