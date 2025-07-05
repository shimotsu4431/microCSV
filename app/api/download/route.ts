import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createClient } from 'microcms-js-sdk'

// microCMSの型定義（必要に応じてカスタマイズしてください）
type Content = {
  id: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  revisedAt: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any // 他のフィールド
}

// POSTリクエストを処理する関数をエクスポート
export async function POST(req: Request) {
  try {
    const { serviceId, endpoint, apiKey } = await req.json()

    if (!serviceId || !endpoint || !apiKey) {
      return NextResponse.json(
        { message: 'Missing required parameters.' },
        { status: 400 }
      )
    }

    const client = createClient({
      serviceDomain: serviceId,
      apiKey: apiKey,
    })

    // 最低でも3秒待機する
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const allContents = await client.getAllContents<Content>({ endpoint })

    // オブジェクトをJSON文字列に変換
    const contentsForCsv = allContents.map((content) => {
      const newContent = { ...content }
      for (const key in newContent) {
        if (typeof newContent[key] === 'object' && newContent[key] !== null) {
          newContent[key] = JSON.stringify(newContent[key])
        }
      }
      return newContent
    })

    // すべてのキーを収集してヘッダーを作成
    const allKeys = new Set<string>()
    contentsForCsv.forEach((item) => {
      Object.keys(item).forEach((key) => {
        allKeys.add(key)
      })
    })
    const header = Array.from(allKeys)

    // JSONをCSVに変換
    const csv = Papa.unparse(contentsForCsv, { columns: header })

    // CSVをレスポンスとして返す
    const responseHeaders = new Headers()
    responseHeaders.set('Content-Type', 'text/csv')
    responseHeaders.set(
      'Content-Disposition',
      `attachment; filename="${endpoint}_${
        new Date().toISOString().split('T')[0]
      }.csv"`
    )

    return new Response(csv, { headers: responseHeaders })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    )
  }
}