'use client'

import {
  TextInput,
  PasswordInput,
  Alert,
  Text,
  Anchor,
  Stack,
  Title,
  Paper,
  List,
} from '@mantine/core'

interface SettingsProps {
  serviceId: string
  setServiceId: (id: string) => void
  defaultApiKey: string
  setDefaultApiKey: (key: string) => void
  isLoading: boolean
}

export const Settings = ({
  serviceId,
  setServiceId,
  defaultApiKey,
  setDefaultApiKey,
  isLoading,
}: SettingsProps) => (
  <Paper withBorder p="xl" radius="md">
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2} size={22}>
          共通設定
        </Title>
        <Text size="sm" c="dimmed">
          すべてのAPIで共通して使用する情報を設定します。
        </Text>
      </Stack>

      <TextInput
        label="サービスID"
        description="https://xxxx.microcms.io の xxxx の部分です。"
        placeholder="your-service-id"
        value={serviceId}
        onChange={(e) => setServiceId(e.currentTarget.value)}
        disabled={isLoading}
        required
      />
      <PasswordInput
        label="APIキー（デフォルト）"
        description="コンテンツを取得するためのAPIキーです。個別設定がない場合はこのキーが使われます。"
        placeholder="Your API Key"
        value={defaultApiKey}
        onChange={(e) => setDefaultApiKey(e.currentTarget.value)}
        disabled={isLoading}
        required
      />
      <Alert variant="light" color="blue" title="APIキーの権限について">
        <Stack gap="sm">
          <Text size="sm">
            APIキーに
            <Text span fw={700} mx={4}>
              「GET権限」
            </Text>
            を付与してご利用ください。ダウンロードされるコンテンツは、使用する
            <Anchor
              href="https://document.microcms.io/content-api/x-microcms-api-key"
              target="_blank"
              rel="noopener noreferrer"
              mx={4}
            >
              APIキーの権限設定
            </Anchor>
            に依存します。
          </Text>
          <List spacing="xs" size="sm" center>
            <List.Item style={{ lineHeight: 1.4 }}>
              <Text span fw={700} size="sm">
                「下書き中」
              </Text>
              のコンテンツを含めるには、APIキー設定で「下書き状態のコンテンツも取得する」にチェックを入れてください。
            </List.Item>
            <List.Item style={{ lineHeight: 1.4 }}>
              <Text span fw={700} size="sm">
                「公開終了」
              </Text>
              のコンテンツを含めるには、APIキー設定で「公開終了状態のコンテンツも取得する」にチェックを入れてください。
            </List.Item>
          </List>
        </Stack>
      </Alert>
    </Stack>
  </Paper>
)
