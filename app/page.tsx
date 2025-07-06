'use client'

import { useState } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { createClient } from 'microcms-js-sdk'
import JSZip from 'jszip'
import Papa from 'papaparse'
import {
  Container,
  Title,
  Text,
  TextInput,
  Button,
  Stack,
  Group,
  PasswordInput,
  Checkbox,
  ActionIcon,
  Paper,
  Alert,
  Anchor,
  Loader,
  SimpleGrid,
  Badge,
  Kbd,
} from '@mantine/core'
import {
  IconInfoCircle,
  IconTrash,
  IconPlus,
  IconDownload,
  IconX,
} from '@tabler/icons-react'

// --- 型定義 ---
type KeyMapping = { id: number; endpoint: string; key: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Content = any

export default function Home() {
  // --- State管理 ---
  const [serviceId, setServiceId] = useState('')
  const [defaultApiKey, setDefaultApiKey] = useState('')

  // List-API states
  const [listEndpoints, setListEndpoints] = useState<string[]>([])
  const [currentListEndpoint, setCurrentListEndpoint] = useState('')

  // Object-API states
  const [objectEndpoints, setObjectEndpoints] = useState<string[]>([])
  const [currentObjectEndpoint, setCurrentObjectEndpoint] = useState('')

  const [showKeyOverrides, setShowKeyOverrides] = useState(false)
  const [keyMappings, setKeyMappings] = useState<KeyMapping[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // --- UI操作ハンドラ ---
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

  const addKeyMapping = () =>
    setKeyMappings([...keyMappings, { id: Date.now(), endpoint: '', key: '' }])
  const removeKeyMapping = (id: number) => {
    setKeyMappings((prev) => {
      const newKeyMappings = prev.filter((m) => m.id !== id)
      if (newKeyMappings.length === 0) {
        setShowKeyOverrides(false)
      }
      return newKeyMappings
    })
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

  // --- メインのダウンロード処理 ---
  const handleDownload = async () => {
    if (
      !serviceId ||
      (listEndpoints.length === 0 && objectEndpoints.length === 0) ||
      !defaultApiKey
    ) {
      toast.error(
        'サービスID、デフォルトAPIキー、最低1つのエンドポイントは必須です。'
      )
      return
    }

    setIsLoading(true)
    const loadingToastId = toast.loading('コンテンツを取得・圧縮中です...')

    const timerPromise = new Promise((resolve) => setTimeout(resolve, 5000))

    const downloadLogicPromise = (async () => {
      const zip = new JSZip()

      const processEndpoint = async (
        endpoint: string,
        type: 'list' | 'object'
      ) => {
        const apiKey =
          keyMappings.find((m) => m.endpoint === endpoint)?.key || defaultApiKey
        if (!apiKey) throw new Error(`${endpoint}用のAPIキーがありません。`)

        const client = createClient({
          serviceDomain: serviceId,
          apiKey: apiKey,
        })
        let contents: Content[] = []

        if (type === 'list') {
          contents = await client.getAllContents<Content>({
            endpoint,
          })
        } else {
          const objectContent = await client.getObject<Content>({ endpoint })
          contents = [objectContent]
        }

        if (contents.length === 0) return

        const contentsForCsv = contents.map((content) => {
          const newContent = { ...content }
          for (const key in newContent) {
            if (
              typeof newContent[key] === 'object' &&
              newContent[key] !== null
            ) {
              newContent[key] = JSON.stringify(newContent[key])
            }
          }
          return newContent
        })

        const allKeys = new Set<string>()
        contentsForCsv.forEach((item) =>
          Object.keys(item).forEach((key) => allKeys.add(key))
        )
        const header = Array.from(allKeys)
        const csv = Papa.unparse(contentsForCsv, { columns: header })
        zip.file(`${endpoint}.csv`, csv)
      }

      try {
        for (const endpoint of listEndpoints) {
          await processEndpoint(endpoint, 'list')
        }
        for (const endpoint of objectEndpoints) {
          await processEndpoint(endpoint, 'object')
        }
      } catch (error) {
        throw error
      }

      const zipContent = await zip.generateAsync({ type: 'blob' })
      if (zipContent.size === 0) {
        throw new Error('ダウンロード対象のコンテンツがありませんでした。')
      }

      return {
        blob: zipContent,
        fileName: `microcms-export_${
          new Date().toISOString().split('T')[0]
        }.zip`,
      }
    })()

    try {
      const result = await Promise.all([downloadLogicPromise, timerPromise])
      const downloadResult = result[0]

      if (downloadResult) {
        toast.success('ダウンロードが完了しました！', { id: loadingToastId })
        setTimeout(() => {
          const url = window.URL.createObjectURL(downloadResult.blob)
          const a = document.createElement('a')
          a.href = url
          a.download = downloadResult.fileName
          document.body.appendChild(a)
          a.click()
          a.remove()
          window.URL.revokeObjectURL(url)
        }, 100)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'エラーが発生しました。', {
        id: loadingToastId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    serviceId.trim() !== '' &&
    defaultApiKey.trim() !== '' &&
    (listEndpoints.length > 0 || objectEndpoints.length > 0)

  // --- JSX (UI部分) ---
  return (
    <>
      <Toaster position="top-right" />

      <Container size="md" my="xl">
        <Stack gap="xl">
          <Stack gap="xs" align="center">
            <Title order={1}>microCMS Exporter</Title>
            <Text ta="center">
              このツールでは、microCMSのコンテンツデータを一括で取得し、CSV形式のファイルとしてZIPでダウンロードします。
              <br />
              <Text span fw={700}>
                APIキーなどの情報は外部に送信されず、すべての処理はあなたのブラウザ内で完結するため安全です。
              </Text>
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

          <Paper withBorder p="md">
            <Stack>
              <Title order={4}>基本的な使い方</Title>
              <ol style={{ margin: 0, paddingLeft: '20px' }}>
                <li>
                  <Text size="sm">
                    <b>共通設定</b>
                    に、あなたのmicroCMSのサービスIDとAPIキーを入力します
                  </Text>
                </li>
                <li>
                  <Text size="sm">
                    <b>エクスポートするAPI</b>
                    に、ダウンロードしたいAPIのエンドポイント名を入力します
                  </Text>
                </li>
                <li>
                  <Text size="sm">
                    ［CSVファイルをダウンロード］をクリックすると、処理が開始されます
                  </Text>
                </li>
              </ol>
            </Stack>
          </Paper>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="lg">
              <Paper withBorder p="xl" radius="md">
                <Stack>
                  <Title order={2} size={24}>
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
                    label="APIキー"
                    placeholder="Your API Key"
                    value={defaultApiKey}
                    onChange={(e) => setDefaultApiKey(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Alert
                    variant="light"
                    color="blue"
                    title="APIキーの権限について"
                    icon={<IconInfoCircle />}
                  >
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
                  <Checkbox
                    label="特定のエンドポイントに別のAPIキーを使う"
                    checked={showKeyOverrides}
                    onChange={(e) =>
                      setShowKeyOverrides(e.currentTarget.checked)
                    }
                    disabled={isLoading}
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
                              updateKeyMapping(
                                mapping.id,
                                'endpoint',
                                e.target.value
                              )
                            }
                          />
                          <PasswordInput
                            style={{ flex: 1 }}
                            placeholder="対応するAPIキー"
                            value={mapping.key}
                            onChange={(e) =>
                              updateKeyMapping(
                                mapping.id,
                                'key',
                                e.target.value
                              )
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
                </Stack>
              </Paper>
            </Stack>

            <Stack gap="lg">
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
                                onClick={() =>
                                  handleRemoveEndpoint('object', ep)
                                }
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
              <Button
                onClick={handleDownload}
                disabled={isLoading || !isFormValid}
                size="lg"
                leftSection={
                  isLoading ? <Loader size="sm" /> : <IconDownload size={20} />
                }
              >
                {isLoading ? '処理中です...' : 'CSVファイルをダウンロード'}
              </Button>
            </Stack>
          </SimpleGrid>

          <Group justify="center">
            <Text size="sm" c="dimmed">
              作者:{' '}
              <Anchor href="https://x.com/shimotsu_" target="_blank">
                @shimotsu_
              </Anchor>
            </Text>
          </Group>
        </Stack>
      </Container>
    </>
  )
}
