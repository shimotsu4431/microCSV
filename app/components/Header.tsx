'use client'

import { Title, Text, Anchor, Stack } from '@mantine/core'

export const Header = () => (
  <Stack gap="md">
    <Title order={1} size={36}>
      microCSV
    </Title>
    <Text>
      microCMSのコンテンツを一括で取得し、CSV形式でダウンロードするツールです。
      <br />
      すべての処理はブラウザ内で完結するため、APIキーなどの情報が外部のサーバに送信されることはありません。
    </Text>
    <Text size="sm" c="dimmed">
      本ツールはOSSとして、
      <Anchor
        href="https://github.com/shimotsu4431/microcms-downloader-tool"
        target="_blank"
        rel="noopener noreferrer"
        mx={4}
      >
        GitHub
      </Anchor>
      でソースコードを公開しています。
    </Text>
  </Stack>
)
