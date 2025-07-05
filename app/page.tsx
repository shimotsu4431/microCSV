'use client'

import { useState } from 'react'
import Head from 'next/head'
import { Toaster, toast } from 'react-hot-toast'

export default function Home() {
  const [serviceId, setServiceId] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // handleDownload関数は変更なし

  // ... handleDownload
  const handleDownload = async () => {
    if (!serviceId || !endpoint || !apiKey) {
      toast.error('すべての必須項目を入力してください。')
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading('コンテンツを取得中です...')

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId, endpoint, apiKey }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'ダウンロードに失敗しました。')
      }

      // ファイルをBlobとして取得し、ダウンロードリンクを生成してクリック
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // ファイル名はサーバーサイドで設定済み
      a.download =
        res.headers
          .get('Content-Disposition')
          ?.split('filename=')[1]
          .replace(/"/g, '') || 'contents.csv'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success('ダウンロードが完了しました！', { id: loadingToastId })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message, { id: loadingToastId })
    } finally {
      setIsLoading(false)
    }
  }
  // ...

  return (
    <>
      <Head>
        <title>microCMS CSV Downloader</title>
        <meta
          name="description"
          content="Download contents from microCMS as CSV"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Toaster position="top-right" />

      {/* 👇 styleをCSS変数を使うように変更 */}
      <main
        style={{
          maxWidth: '600px',
          margin: '40px auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h1>microCMS CSV Exporter</h1>

        <p>
          サービスID、APIエンドポイント、APIキーを入力して、コンテンツをCSV形式でダウンロードします。
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="text"
            placeholder="サービスID (例: your-service-id)"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={isLoading}
            style={{
              padding: '10px',
              backgroundColor: 'var(--input-bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--input-border-color)',
              borderRadius: '5px',
            }}
          />
          <input
            type="text"
            placeholder="APIエンドポイント (例: blogs)"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            disabled={isLoading}
            style={{
              padding: '10px',
              backgroundColor: 'var(--input-bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--input-border-color)',
              borderRadius: '5px',
            }}
          />
          <input
            type="password"
            placeholder="APIキー (X-MICROCMS-API-KEY)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading}
            style={{
              padding: '10px',
              backgroundColor: 'var(--input-bg-color)',
              color: 'var(--text-color)',
              border: '1px solid var(--input-border-color)',
              borderRadius: '5px',
            }}
          />
        </div>

        <div
          style={{
            border: '1px solid var(--info-border-color)',
            padding: '15px',
            borderRadius: '5px',
            backgroundColor: 'var(--info-bg-color)',
          }}
        >
          <h4 style={{ marginTop: 0 }}>
            【ご確認ください】 取得できるコンテンツの範囲について
          </h4>
          <p
            style={{
              fontSize: '0.9em',
              margin: 0,
              color: 'var(--info-text-color)',
            }}
          >
            ダウンロードされるコンテンツは、入力するAPIキーの権限設定に依存します。
            <br />- <b>下書き</b>を含めたい場合:
            APIキーの設定で「下書きコンテンツの全取得」にチェックを入れてください。
            <br />- <b>公開終了</b>を含めたい場合:
            APIキーの設定で「公開終了コンテンツの全取得」にチェックを入れてください。
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isLoading}
          style={{
            padding: '12px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: isLoading
              ? 'var(--button-disabled-bg-color)'
              : 'var(--button-bg-color)',
            color: 'var(--button-text-color)',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          {isLoading ? '処理中です...' : 'CSVダウンロード'}
        </button>
      </main>
    </>
  )
}
