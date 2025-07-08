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
} from '@mantine/core'
import { KeyOverride } from './KeyOverride'

type KeyMapping = { id: number; endpoint: string; key: string }

interface SettingsProps {
  serviceId: string
  setServiceId: (id: string) => void
  defaultApiKey: string
  setDefaultApiKey: (key: string) => void
  keyMappings: KeyMapping[]
  setKeyMappings: React.Dispatch<React.SetStateAction<KeyMapping[]>>
  isLoading: boolean
}

export const Settings = ({
  serviceId,
  setServiceId,
  defaultApiKey,
  setDefaultApiKey,
  keyMappings,
  setKeyMappings,
  isLoading,
}: SettingsProps) => (
  <Paper withBorder p="xl" radius="md">
    <Stack>
      <Title order={2} size={22}>
        共通設定
      </Title>
      <TextInput
        label="サービスID"
        description="https://xxxx.microcms.io の xxxxの部分"
        placeholder="your-service-id"
        value={serviceId}
        onChange={(e) => setServiceId(e.target.value)}
        disabled={isLoading}
        required
      />
      <PasswordInput
        label="デフォルトAPIキー"
        placeholder="Your API Key"
        value={defaultApiKey}
        onChange={(e) => setDefaultApiKey(e.target.value)}
        disabled={isLoading}
        required
      />
      <Alert variant="light" color="blue" title="APIキーの権限について">
        <Text size="sm">
          APIキーの<b>「GET」権限</b>を付与してご利用ください。
          <br />
          また、ダウンロードされるコンテンツは、使用する{' '}
          <Anchor
            href="https://document.microcms.io/content-api/x-microcms-api-key"
            target="_blank"
          >
            APIキーの権限設定
          </Anchor>
          に依存します。
        </Text>
        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
          <li>
            <Text size="xs">
              <b>「下書き」のコンテンツ</b>を含めたい場合:
              <br />
              APIキーの設定で「下書きコンテンツの全取得」にチェックを入れてください。
            </Text>
          </li>
          <li>
            <Text size="xs">
              <b>「公開終了」のコンテンツ</b>を含めたい場合:
              <br />
              APIキーの設定で「公開終了コンテンツの全取得」にチェックを入れてください。
            </Text>
          </li>
        </ul>
      </Alert>
      <KeyOverride
        keyMappings={keyMappings}
        setKeyMappings={setKeyMappings}
        isLoading={isLoading}
      />
    </Stack>
  </Paper>
)
