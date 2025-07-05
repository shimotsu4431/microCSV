import { NextResponse } from 'next/server'
import Papa from 'papaparse'

// レートリミット対策で、リクエスト間に待機時間を入れる関数
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// microCMSの型定義（必要に応じてカスタマイズしてください）
type Content = {
  id: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  revisedAt: string
  [key: string]: any // 他のフィールド
}

type ListApiResponse = {
  contents: Content[]
  totalCount: number
  offset: number
  limit: number
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

    const allContents: Content[] = []
    const limit = 100 // microCMSのlimit最大値
    let offset = 0
    let totalCount = 0

    const headers = {
      'X-MICROCMS-API-KEY': apiKey,
    }

    // 最初にtotalCountを取得するための初回リクエスト
    const firstUrl = `https://${serviceId}.microcms.io/api/v1/${endpoint}?limit=${limit}&offset=${offset}`
    const firstRes = await fetch(firstUrl, { headers })

    if (!firstRes.ok) {
      return NextResponse.json(
        { message: `Failed to fetch: ${firstRes.statusText}` },
        { status: firstRes.status }
      )
    }

    const firstData: ListApiResponse = await firstRes.json()
    allContents.push(...firstData.contents)
    totalCount = firstData.totalCount
    offset += limit

    // totalCountを元に残りのコンテンツを並行で取得
    const promises = []
    while (offset < totalCount) {
      const url = `https://sot53t1p4c.microcms.io/api/v1/${endpoint}?limit=${limit}&offset=${offset}`
      promises.push(fetch(url, { headers }).then((res) => res.json()))
      offset += limit
      // レートリミット対策
      await sleep(50)
    }

    const responses = await Promise.all(promises)
    for (const data of responses) {
      allContents.push(...data.contents)
    }

    // JSONをCSVに変換
    const csv = Papa.unparse(allContents)

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
