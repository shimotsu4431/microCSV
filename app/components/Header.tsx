'use client'

import { Title, Text, Anchor, Stack } from '@mantine/core'

export const Header = () => (
  <Stack gap="xs">
    <Title order={1} mt={16} mb={16} size={24}>
      microCSV
    </Title>
    <Text>
      microCMSのコンテンツを一括で取得し、CSV形式でダウンロードするツールです。
      <br />
      APIキーなどの情報は、microCMS以外の外部のサーバに送信されず、すべての処理はブラウザ内で完結するため安全です。
    </Text>
    <Text size="sm">
      本ツールはOSSとして公開しており、GitHubで
      <Anchor
        href="https://github.com/shimotsu4431/microcms-downloader-tool"
        target="_blank"
      >
        ソースコード
      </Anchor>
      を確認できます。
    </Text>
  </Stack>
)
