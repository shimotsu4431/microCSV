'use client'

import { Title, Text, Anchor, Stack } from '@mantine/core'

export const Header = () => (
  <Stack gap="xs" align="center">
    <Title order={1} mt={30} mb={30} size={36}>
      microCSV
    </Title>
    <Text ta="center">
      このツールでは、microCMSのコンテンツデータを一括で取得し、CSV形式のファイルとしてZIPでダウンロードします。
      <br />
      <Text span fw={700}>
        APIキーなどの情報は外部に送信されず、すべての処理はあなたのブラウザ内で完結するため安全です。
      </Text>
    </Text>
    <Text>
      なお、本ツールはOSSとして公開しており、GitHubでソースコードを確認できます。
      <br />
      リポジトリ:{' '}
      <Anchor
        href="https://github.com/shimotsu4431/microcms-downloader-tool"
        target="_blank"
      >
        https://github.com/shimotsu4431/microcms-downloader-tool
      </Anchor>
    </Text>
  </Stack>
)
