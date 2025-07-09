'use client'

import {
  Paper,
  Title,
  Stack,
  Text,
  Button,
  Group,
  Badge,
  Box,
  ScrollArea,
} from '@mantine/core'
import {
  IconTrash,
  IconList,
  IconBlockquote,
  IconKey,
} from '@tabler/icons-react'
import { DownloadHistoryEntry } from '../hooks/useMicroCMSDownloader'

interface DownloadHistoryProps {
  history: DownloadHistoryEntry[]
  onRestore: (entry: DownloadHistoryEntry) => void
  onClear: () => void
  isLoading: boolean
}

export const DownloadHistory = ({
  history,
  onRestore,
  onClear,
  isLoading,
}: DownloadHistoryProps) => {
  if (history.length === 0) {
    return null
  }

  return (
    <Paper withBorder p="xl" radius="md">
      <Stack>
        <Group justify="space-between">
          <Group>
            <Title order={2} size={22}>
              ダウンロード履歴
            </Title>
          </Group>
          <Button
            variant="outline"
            color="red"
            onClick={onClear}
            disabled={isLoading}
            leftSection={<IconTrash size={14} />}
          >
            履歴を削除
          </Button>
        </Group>
        <ScrollArea style={{ height: 300 }}>
          <Stack gap="md">
            {history.map((entry) => (
              <Paper key={entry.id} withBorder p="md" radius="sm">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      {new Date(entry.createdAt).toLocaleString('ja-JP')}
                    </Text>
                    <Button
                      variant="light"
                      size="xs"
                      onClick={() => onRestore(entry)}
                      disabled={isLoading}
                    >
                      この設定を復元
                    </Button>
                  </Group>
                  <Text size="sm">
                    <Text span fw={700}>
                      サービスID:
                    </Text>{' '}
                    {entry.serviceId}
                  </Text>
                  <Box>
                    <Group gap="xs">
                      <IconList size={16} />
                      <Text size="sm" fw={500}>
                        リスト形式API ({entry.listEndpoints.length})
                      </Text>
                    </Group>
                    {entry.listEndpoints.length > 0 && (
                      <Group gap="xs" pl="lg" pt="xs">
                        {entry.listEndpoints.map((ep) => (
                          <Badge
                            key={ep}
                            variant="light"
                            style={{ textTransform: 'none' }}
                          >
                            {ep}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Box>
                  <Box>
                    <Group gap="xs">
                      <IconBlockquote size={16} />
                      <Text size="sm" fw={500}>
                        オブジェクト形式API ({entry.objectEndpoints.length})
                      </Text>
                    </Group>
                    {entry.objectEndpoints.length > 0 && (
                      <Group gap="xs" pl="lg" pt="xs">
                        {entry.objectEndpoints.map((ep) => (
                          <Badge
                            key={ep}
                            variant="light"
                            style={{ textTransform: 'none' }}
                          >
                            {ep}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </Box>
                  {entry.keyMappings.length > 0 && (
                    <Box>
                      <Group gap="xs">
                        <IconKey size={16} />
                        <Text size="sm" fw={500}>
                          個別APIキー ({entry.keyMappings.length})
                        </Text>
                      </Group>
                      <Stack gap="xs" pl="lg" pt="xs">
                        {entry.keyMappings.map((km) => (
                          <Text key={km.id} size="xs">
                            {km.endpoint}: {km.key.slice(0, 8)}...
                          </Text>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  )
}
