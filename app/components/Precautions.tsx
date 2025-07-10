'use client'

import { Paper, Stack, Title, Anchor, Text, List } from '@mantine/core'

export const Precautions = () => (
  <Paper withBorder p="xl" radius="md" bg="yellow.0">
    <Stack>
      <Title order={2} size={22}>
        注意事項／免責
      </Title>
      <List spacing="xs" size="sm" center>
        <List.Item>
          <Text>
            本ツールは非公式です。ツールの利用によって生じた損害については、開発者は一切の責任を負いません。自己責任でご利用ください。
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            APIリクエストには各種制限があります。詳細は公式ドキュメントの
            <Anchor
              href="https://document.microcms.io/manual/limitations"
              target="_blank"
              rel="noopener noreferrer"
              mx={4}
            >
              制限事項／注意事項
            </Anchor>
            をご確認ください。
          </Text>
        </List.Item>
        <List.Item>
          <Text>
            APIキーの権限不足やエンドポイントの指定間違いなどによりエラーが発生する場合があります。詳細は公式ドキュメントの
            <Anchor
              href="https://document.microcms.io/content-api/api-error-response"
              target="_blank"
              rel="noopener noreferrer"
              mx={4}
            >
              コンテンツAPIのエラーレスポンス
            </Anchor>
            をご確認ください。
          </Text>
        </List.Item>
      </List>
    </Stack>
  </Paper>
)
