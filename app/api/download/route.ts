import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createClient } from 'microcms-js-sdk'
import JSZip from 'jszip'

// 型定義
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Content = { id: string; [key: string]: any }
type KeyMapping = { endpoint: string; key: string }

export async function POST(req: Request) {
  try {
    // フロントエンドから送信されるデータ構造
    const {
      serviceId,
      endpoints,
      defaultApiKey,
      keyMappings,
    }: {
      serviceId: string
      endpoints: string[]
      defaultApiKey: string
      keyMappings: KeyMapping[]
    } = await req.json()

    // バリデーション
    if (!serviceId || !endpoints || !endpoints.length || !defaultApiKey) {
      return NextResponse.json(
        { message: '必須項目が不足しています。' },
        { status: 400 }
      )
    }

    const zip = new JSZip()

    // エンドポイントごとにループ処理
    for (const endpoint of endpoints) {
      // 1. 使用するAPIキーを決定
      const apiKey =
        keyMappings.find((m) => m.endpoint === endpoint)?.key || defaultApiKey

      // 2. microCMSクライアントを作成
      const client = createClient({
        serviceDomain: serviceId,
        apiKey: apiKey,
      })

      // 3. 全コンテンツを取得
      const allContents = await client.getAllContents<Content>({ endpoint })

      if (allContents.length === 0) continue // コンテンツがなければスキップ

      // 4. ネストされたオブジェクトをJSON文字列に変換
      const contentsForCsv = allContents.map((content) => {
        const newContent = { ...content }
        for (const key in newContent) {
          if (typeof newContent[key] === 'object' && newContent[key] !== null) {
            newContent[key] = JSON.stringify(newContent[key])
          }
        }
        return newContent
      })

      // 5. CSVヘッダーを動的に作成
      const allKeys = new Set<string>()
      contentsForCsv.forEach((item) => {
        Object.keys(item).forEach((key) => allKeys.add(key))
      })
      const header = Array.from(allKeys)

      // 6. JSONをCSVに変換
      const csv = Papa.unparse(contentsForCsv, { columns: header })

      // 7. CSVをZIPファイルに追加
      zip.file(`${endpoint}.csv`, csv)
    }

    // ZIPファイルを生成
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })

    // ZIPファイルをレスポンスとして返す
    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', 'application/zip')
    responseHeaders.set(
      'Content-Disposition',
      `attachment; filename="microcms-export_${
        new Date().toISOString().split('T')[0]
      }.zip"`
    )

    return new Response(zipContent, { headers: responseHeaders })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error)
    // エラーメッセージをより具体的に返す
    const errorMessage = error.message || 'An internal server error occurred.'
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
