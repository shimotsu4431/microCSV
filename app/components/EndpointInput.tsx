'use client'

import { useState } from 'react'
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
    if (
      type === 'list' &&
      currentListEndpoint &&
      !listEndpoints.includes(currentListEndpoint)
    ) {
      setListEndpoints([...listEndpoints, currentListEndpoint])
      setCurrentListEndpoint('')
    } else if (
      type === 'object' &&
      currentObjectEndpoint &&
      !objectEndpoints.includes(currentObjectEndpoint)
    ) {
      setObjectEndpoints([...objectEndpoints, currentObjectEndpoint])
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
        <Title order={2} size={24}>
          エクスポートするAPI
        </Title>
        <Stack>
          <TextInput
            label="リスト形式APIのエンドポイント"
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
              e.key === 'Enter' && (e.preventDefault(), handleAddEndpoint('list'))
            }
            disabled={isLoading}
          />
          {listEndpoints.length > 0 && (
            <Group gap="xs">
              {listEndpoints.map((ep) => (
                <Badge
                  key={ep}
                  variant="outline"
                  style={{ textTransform: 'none' }}
                  size="lg"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="blue"
                      radius="xl"
                      variant="transparent"
                      onClick={() => handleRemoveEndpoint('list', ep)}
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
            label="オブジェクト形式APIのエンドポイント"
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
                  style={{ textTransform: 'none' }}
                  size="lg"
                  rightSection={
                    <ActionIcon
                      size="xs"
                      color="blue"
                      radius="xl"
                      variant="transparent"
                      onClick={() => handleRemoveEndpoint('object', ep)}
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
