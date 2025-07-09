'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  TextInput,
  Group,
  Badge,
  ActionIcon,
  Stack,
  Paper,
  Title,
  Kbd,
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'

interface EndpointInputProps {
  listEndpoints: string[]
  setListEndpoints: (endpoints: string[]) => void
  objectEndpoints: string[]
  setObjectEndpoints: (endpoints: string[]) => void
  isLoading: boolean
}

export const EndpointInput = ({
  listEndpoints,
  setListEndpoints,
  objectEndpoints,
  setObjectEndpoints,
  isLoading,
}: EndpointInputProps) => {
  const [currentListEndpoint, setCurrentListEndpoint] = useState('')
  const [currentObjectEndpoint, setCurrentObjectEndpoint] = useState('')

  const handleAddEndpoint = (type: 'list' | 'object') => {
    const endpoint =
      type === 'list' ? currentListEndpoint : currentObjectEndpoint
    const existingEndpoints = type === 'list' ? listEndpoints : objectEndpoints

    if (!endpoint) return

    if (type === 'list' && listEndpoints.length >= 10) {
      toast.error('リスト形式APIは10個までしか追加できません。')
      return
    }

    if (type === 'object' && objectEndpoints.length >= 10) {
      toast.error('オブジェクト形式APIは10個までしか追加できません。')
      return
    }

    const endpointRegex = /^[a-z0-9_-]{3,32}$/
    if (!endpointRegex.test(endpoint)) {
      toast.error(
        'エンドポイント名は3文字以上32文字以下の半角小文字英数字、ハイフン(-)、アンダースコア(_)のみ使用できます。'
      )
      return
    }

    if (existingEndpoints.includes(endpoint)) {
      toast.error(`エンドポイント「${endpoint}」は既に追加されています。`)
      return
    }

    if (type === 'list') {
      setListEndpoints([...listEndpoints, endpoint])
      setCurrentListEndpoint('')
    } else {
      setObjectEndpoints([...objectEndpoints, endpoint])
      setCurrentObjectEndpoint('')
    }
  }

  const handleRemoveEndpoint = (
    type: 'list' | 'object',
    endpointToRemove: string
  ) => {
    if (type === 'list') {
      setListEndpoints(listEndpoints.filter((ep) => ep !== endpointToRemove))
    } else {
      setObjectEndpoints(
        objectEndpoints.filter((ep) => ep !== endpointToRemove)
      )
    }
  }

  return (
    <Paper withBorder p="xl" radius="md">
      <Stack>
        <Title order={2} size={22}>
          エクスポートするAPI
        </Title>
        <Stack>
          <TextInput
            label="リスト形式APIのエンドポイント（最大10個）"
            description={
              <>
                {' '}
                <Kbd>Enter</Kbd>で追加
              </>
            }
            placeholder="news"
            value={currentListEndpoint}
            onChange={(e) => setCurrentListEndpoint(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              (e.preventDefault(), handleAddEndpoint('list'))
            }
            disabled={isLoading}
          />
          {listEndpoints.length > 0 && (
            <Group gap="xs">
              {listEndpoints.map((ep) => (
                <Badge
                  key={ep}
                  variant="outline"
                  style={{
                    textTransform: 'none',
                    transition: 'all .2s ease',
                    cursor: 'pointer',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: '#e7f5ff',
                        color: '#1971c2',
                      },
                    },
                  }}
                  size="lg"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="blue"
                      radius="xl"
                      variant="transparent"
                      onClick={() => handleRemoveEndpoint('list', ep)}
                      disabled={isLoading}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  }
                >
                  {ep}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
        <Stack>
          <TextInput
            label="オブジェクト形式APIのエンドポイント（最大10個）"
            description={
              <>
                {' '}
                <Kbd>Enter</Kbd>で追加
              </>
            }
            placeholder="settings"
            value={currentObjectEndpoint}
            onChange={(e) => setCurrentObjectEndpoint(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              (e.preventDefault(), handleAddEndpoint('object'))
            }
            disabled={isLoading}
          />
          {objectEndpoints.length > 0 && (
            <Group gap="xs">
              {objectEndpoints.map((ep) => (
                <Badge
                  key={ep}
                  variant="outline"
                  style={{
                    textTransform: 'none',
                    transition: 'all .2s ease',
                    cursor: 'pointer',
                  }}
                  styles={{
                    root: {
                      '&:hover': {
                        backgroundColor: '#e7f5ff',
                        color: '#1971c2',
                      },
                    },
                  }}
                  size="lg"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="blue"
                      radius="xl"
                      variant="transparent"
                      onClick={() => handleRemoveEndpoint('object', ep)}
                      disabled={isLoading}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  }
                >
                  {ep}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
