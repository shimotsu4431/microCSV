'use client'

import { useCallback } from 'react'
import {
  Stack,
  Group,
  TextInput,
  PasswordInput,
  ActionIcon,
  Button,
  Paper,
  Title,
  Text,
} from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'

// --- 型定義 ---

export type KeyMapping = { id: number; endpoint: string; key: string }

interface KeyOverrideProps {
  keyMappings: KeyMapping[]
  setKeyMappings: React.Dispatch<React.SetStateAction<KeyMapping[]>>
  isLoading: boolean
}

// --- メインコンポーネント ---

export const KeyOverride = ({
  keyMappings,
  setKeyMappings,
  isLoading,
}: KeyOverrideProps) => {
  const addKeyMapping = useCallback(() => {
    setKeyMappings((prev) => [...prev, { id: Date.now(), endpoint: '', key: '' }])
  }, [setKeyMappings])

  const removeKeyMapping = useCallback(
    (id: number) => {
      setKeyMappings((prev) => prev.filter((m) => m.id !== id))
    },
    [setKeyMappings]
  )

  const updateKeyMapping = useCallback(
    (id: number, field: 'endpoint' | 'key', value: string) => {
      setKeyMappings((prev) =>
        prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
      )
    },
    [setKeyMappings]
  )

  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2} size={22}>
            個別APIキー設定（任意）
          </Title>
          <Text size="sm" c="dimmed">
            特定のエンドポイントにデフォルトとは異なるAPIキーを使用したい場合に設定します。
          </Text>
        </Stack>

        <Stack>
          {keyMappings.map((mapping, index) => (
            <Group key={mapping.id} wrap="nowrap" gap="md">
              <TextInput
                style={{ flex: 1 }}
                placeholder={`エンドポイント ${index + 1}`}
                value={mapping.endpoint}
                onChange={(e) =>
                  updateKeyMapping(mapping.id, 'endpoint', e.currentTarget.value)
                }
                disabled={isLoading}
                aria-label={`エンドポイント ${index + 1}`}
              />
              <PasswordInput
                style={{ flex: 1 }}
                placeholder={`対応するAPIキー ${index + 1}`}
                value={mapping.key}
                onChange={(e) =>
                  updateKeyMapping(mapping.id, 'key', e.currentTarget.value)
                }
                disabled={isLoading}
                aria-label={`APIキー ${index + 1}`}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => removeKeyMapping(mapping.id)}
                disabled={isLoading}
                aria-label={`設定 ${index + 1} を削除`}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          ))}

          <Button
            onClick={addKeyMapping}
            leftSection={<IconPlus size={14} />}
            variant="outline"
            disabled={isLoading}
            fullWidth
            mt="md"
          >
            個別キー設定を追加
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}