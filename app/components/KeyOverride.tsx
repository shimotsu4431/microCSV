'use client'

import { useEffect, useState } from 'react'
import {
  Checkbox,
  Stack,
  Group,
  TextInput,
  PasswordInput,
  ActionIcon,
  Button,
} from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'

type KeyMapping = { id: number; endpoint: string; key: string }

interface KeyOverrideProps {
  keyMappings: KeyMapping[]
  setKeyMappings: React.Dispatch<React.SetStateAction<KeyMapping[]>>
  isLoading: boolean
}

export const KeyOverride = ({
  keyMappings,
  setKeyMappings,
  isLoading,
}: KeyOverrideProps) => {
  const [showKeyOverrides, setShowKeyOverrides] = useState(false)

  useEffect(() => {
    if (keyMappings.length === 0) {
      setShowKeyOverrides(false)
    }
  }, [keyMappings])

  const addKeyMapping = () =>
    setKeyMappings([...keyMappings, { id: Date.now(), endpoint: '', key: '' }])

  const removeKeyMapping = (id: number) => {
    setKeyMappings((prev) => prev.filter((m) => m.id !== id))
  }

  const updateKeyMapping = (
    id: number,
    field: 'endpoint' | 'key',
    value: string
  ) => {
    setKeyMappings(
      keyMappings.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
  }

  return (
    <>
      <Checkbox
        label="特定のエンドポイントに別のAPIキーを使う"
        checked={showKeyOverrides}
        onChange={(e) => setShowKeyOverrides(e.currentTarget.checked)}
        disabled={isLoading}
        styles={{
          label: {
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        }}
      />
      {showKeyOverrides && (
        <Stack>
          {keyMappings.map((mapping) => (
            <Group key={mapping.id} wrap="nowrap" gap="md">
              <TextInput
                style={{ flex: 1 }}
                placeholder="エンドポイント名"
                value={mapping.endpoint}
                onChange={(e) =>
                  updateKeyMapping(mapping.id, 'endpoint', e.target.value)
                }
              />
              <PasswordInput
                style={{ flex: 1 }}
                placeholder="対応するAPIキー"
                value={mapping.key}
                onChange={(e) =>
                  updateKeyMapping(mapping.id, 'key', e.target.value)
                }
              />
              <ActionIcon
                color="red"
                onClick={() => removeKeyMapping(mapping.id)}
                aria-label="このAPIキーを削除"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
          <Button
            onClick={addKeyMapping}
            leftSection={<IconPlus size={14} />}
            variant="outline"
          >
            APIキーを追加
          </Button>
        </Stack>
      )}
    </>
  )
}
