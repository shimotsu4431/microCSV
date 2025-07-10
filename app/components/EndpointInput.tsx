'use client'

import { useState, useCallback } from 'react'
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
  Text,
} from '@mantine/core'
import { IconX } from '@tabler/icons-react'

// --- 型定義 ---

type EndpointType = 'list' | 'object'

// --- 定数 ---

const MAX_ENDPOINTS = 10
const ENDPOINT_REGEX = /^[a-z0-9_-]{3,32}$/

// --- サブコンポーネント ---

interface EndpointBadgeListProps {
  endpoints: string[]
  onRemove: (endpoint: string) => void
  isLoading: boolean
}

const EndpointBadgeList = ({
  endpoints,
  onRemove,
  isLoading,
}: EndpointBadgeListProps) => {
  if (endpoints.length === 0) return null

  return (
    <Group gap="xs">
      {endpoints.map((ep) => (
        <Badge
          key={ep}
          variant="outline"
          size="lg"
          pr={3}
          style={{ textTransform: 'none' }}
          rightSection={
            <ActionIcon
              size="xs"
              color="blue"
              radius="xl"
              variant="transparent"
              onClick={() => onRemove(ep)}
              disabled={isLoading}
              aria-label={`${ep}を削除`}
            >
              <IconX size={12} />
            </ActionIcon>
          }
        >
          {ep}
        </Badge>
      ))}
    </Group>
  )
}

interface EndpointFormProps {
  type: EndpointType
  onAdd: (endpoint: string) => void
  isLoading: boolean
}

const EndpointForm = ({ type, onAdd, isLoading }: EndpointFormProps) => {
  const [value, setValue] = useState('')

  const label = type === 'list' ? 'リスト形式API' : 'オブジェクト形式API'
  const placeholder = type === 'list' ? 'news' : 'settings'

  const handleAdd = () => {
    onAdd(value)
    setValue('')
  }

  return (
    <TextInput
      label={`${label}のエンドポイント`}
      description={
        <Text size="xs" component="span">
          最大{MAX_ENDPOINTS}個まで追加できます。（
          <Kbd>Enter</Kbd> キーで追加）
        </Text>
      }
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          handleAdd()
        }
      }}
      disabled={isLoading}
    />
  )
}

// --- メインコンポーネント ---

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
  const handleAddEndpoint = useCallback(
    (type: EndpointType, endpoint: string) => {
      const setter = type === 'list' ? setListEndpoints : setObjectEndpoints
      const existingEndpoints = type === 'list' ? listEndpoints : objectEndpoints

      if (!endpoint) return

      if (existingEndpoints.length >= MAX_ENDPOINTS) {
        toast.error(
          `${type === 'list' ? 'リスト' : 'オブジェクト'}形式APIは${MAX_ENDPOINTS}個までしか追加できません。`
        )
        return
      }

      if (!ENDPOINT_REGEX.test(endpoint)) {
        toast.error(
          'エンドポイント名は3〜32文字の半角小文字英数字、ハイフン、アンダースコアのみ使用できます。'
        )
        return
      }

      if (existingEndpoints.includes(endpoint)) {
        toast.error(`エンドポイント「${endpoint}」は既に追加されています。`)
        return
      }

      setter([...existingEndpoints, endpoint])
    },
    [listEndpoints, objectEndpoints, setListEndpoints, setObjectEndpoints]
  )

  const handleRemoveEndpoint = useCallback(
    (type: EndpointType, endpointToRemove: string) => {
      if (type === 'list') {
        setListEndpoints(listEndpoints.filter((ep) => ep !== endpointToRemove))
      } else {
        setObjectEndpoints(
          objectEndpoints.filter((ep) => ep !== endpointToRemove)
        )
      }
    },
    [listEndpoints, objectEndpoints, setListEndpoints, setObjectEndpoints]
  )

  return (
    <Paper withBorder p="xl" radius="md">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={2} size={22}>
            エクスポートするAPI
          </Title>
          <Text size="sm" c="dimmed">
            ダウンロードしたいAPIのエンドポイントを、形式ごとに分けて入力してください。
          </Text>
        </Stack>

        <Stack>
          <EndpointForm
            type="list"
            onAdd={(endpoint) => handleAddEndpoint('list', endpoint)}
            isLoading={isLoading}
          />
          <EndpointBadgeList
            endpoints={listEndpoints}
            onRemove={(endpoint) => handleRemoveEndpoint('list', endpoint)}
            isLoading={isLoading}
          />
        </Stack>

        <Stack>
          <EndpointForm
            type="object"
            onAdd={(endpoint) => handleAddEndpoint('object', endpoint)}
            isLoading={isLoading}
          />
          <EndpointBadgeList
            endpoints={objectEndpoints}
            onRemove={(endpoint) => handleRemoveEndpoint('object', endpoint)}
            isLoading={isLoading}
          />
        </Stack>
      </Stack>
    </Paper>
  )
}