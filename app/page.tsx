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
import { Settings } from './components/Settings'
import { EndpointInput } from './components/EndpointInput'

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
    keyMappings,
    setKeyMappings,
    isLoading,
    handleDownload,
  } = useMicroCMSDownloader()

  const isFormValid =
    serviceId.trim() !== '' &&
    defaultApiKey.trim() !== '' &&
    (listEndpoints.length > 0 || objectEndpoints.length > 0)

  return (
    <>
      <Toaster position="top-right" />

      <Container size="md" my="xl">
        <Stack gap="xl">
          <Header />
          <Instruction />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Stack gap="lg">
              <Settings
                serviceId={serviceId}
                setServiceId={setServiceId}
                defaultApiKey={defaultApiKey}
                setDefaultApiKey={setDefaultApiKey}
                keyMappings={keyMappings}
                setKeyMappings={setKeyMappings}
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