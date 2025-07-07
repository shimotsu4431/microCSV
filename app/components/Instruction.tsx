'use client'

import { Paper, Stack, Title, Text } from '@mantine/core'

export const Instruction = () => (
  <Paper withBorder p="md">
    <Stack>
      <Title order={4}>基本的な使い方</Title>
      <ol style={{ margin: 0, paddingLeft: '20px' }}>
        <li>
          <Text size="sm">
            <b>共通設定</b>
            に、あなたのmicroCMSのサービスIDとAPIキーを入力します
          </Text>
        </li>
        <li>
          <Text size="sm">
            <b>エクスポートするAPI</b>
            に、ダウンロードしたいAPIのエンドポイント名を入力します
          </Text>
        </li>
        <li>
          <Text size="sm">
            ［CSVファイルをダウンロード］をクリックすると、処理が開始されます
          </Text>
        </li>
      </ol>
    </Stack>
  </Paper>
)
