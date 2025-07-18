'use client'

import { Toaster } from 'react-hot-toast'
import {
  Container,
  Stack,
  SimpleGrid,
  Button,
  Loader,
  Group,
  Text,
  Anchor,
} from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import { useMicroCMSDownloader } from './hooks/useMicroCMSDownloader'
import { Header } from './components/Header'
import { Instruction } from './components/Instruction'
import { Precautions } from './components/Precautions'
import { Settings } from './components/Settings'
import { EndpointInput } from './components/EndpointInput'
import { DownloadHistory } from './components/DownloadHistory'

export default function Home() {
  const {
    serviceId,
    setServiceId,
    defaultApiKey,
    setDefaultApiKey,
    listEndpoints,
    setListEndpoints,
    objectEndpoints,
    setObjectEndpoints,
    isLoading,
    handleDownload,
    history,
    restoreFromHistory,
    clearHistory,
  } = useMicroCMSDownloader()

  const isFormValid =
    serviceId.trim() !== '' &&
    defaultApiKey.trim() !== '' &&
    (listEndpoints.length > 0 || objectEndpoints.length > 0)

  return (
    <>
      <Toaster position="top-right" />

      <Container size="md" my="xl">
        <Stack gap="md">
          <Header />
          <Instruction />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="lg">
              <Settings
                serviceId={serviceId}
                setServiceId={setServiceId}
                defaultApiKey={defaultApiKey}
                setDefaultApiKey={setDefaultApiKey}
                isLoading={isLoading}
              />
            </Stack>

            <Stack gap="lg">
              <EndpointInput
                listEndpoints={listEndpoints}
                setListEndpoints={setListEndpoints}
                objectEndpoints={objectEndpoints}
                setObjectEndpoints={setObjectEndpoints}
                isLoading={isLoading}
              />
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

          <DownloadHistory
            history={history}
            onRestore={restoreFromHistory}
            onClear={clearHistory}
            isLoading={isLoading}
          />

          <Precautions />
          <Group justify="center" mt="xl">
            <Text size="sm" c="dimmed">
              <Anchor
                href="https://forms.gle/iSpp2zmcm4SiyXb39"
                target="_blank"
              >
                お問い合わせ
              </Anchor>
            </Text>
          </Group>
          <Group justify="center" mb="xl">
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
