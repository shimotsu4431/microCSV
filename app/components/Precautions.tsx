'use client'

import { Paper, Stack, Title, Anchor, Text } from '@mantine/core'

export const Precautions = () => (
  <Paper p="md" style={{ backgroundColor: '#faf6da' }}>
    <Stack>
      <Title order={4}>注意事項／免責</Title>
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        <li>
          <Text size="sm">
            本ツールは非公式です。ツールの利用によって生じた損害については、開発者は一切の責任を負いません。自己責任でご利用ください。
          </Text>
        </li>
        <li>
          <Text size="sm">
            APIリクエストには、各種制限があります。詳細は公式ドキュメントの
            <Anchor
              href="https://document.microcms.io/manual/limitations"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              制限事項／注意事項
            </Anchor>
            をご確認ください。
          </Text>
        </li>
        <li>
          <Text size="sm">
            APIキーの権限不足やエンドポイントの指定間違いなどによりエラーが発生する場合があります。エラー内容の詳細は公式ドキュメントの
            <Anchor
              href="https://document.microcms.io/content-api/api-error-response"
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              コンテンツAPIのエラーレスポンス
            </Anchor>
            をご確認ください。
          </Text>
        </li>
      </ul>
    </Stack>
  </Paper>
)
