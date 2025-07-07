'use client'

import { Title, Text, Anchor, Stack } from '@mantine/core'

export const Header = () => (
  <Stack gap="xs" align="center">
    <Title order={1} mt={30} mb={30} size={32}>
      microCSV
    </Title>
    <Text ta="center">
      microCSVは、microCMSのコンテンツデータを一括で取得し、CSV形式のファイルとしてZIPでダウンロードするツールです。
    </Text>
    <Text ta="center">
      APIキーなどの情報は、microCMS以外の外部のサーバに送信されず、すべての処理はブラウザ内で完結するため安全です。
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
