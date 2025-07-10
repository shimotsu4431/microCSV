'use client'

import { Paper, Stack, Title, Text, List, ThemeIcon } from '@mantine/core'
import { IconNumber1, IconNumber2, IconNumber3 } from '@tabler/icons-react'

export const Instruction = () => (
  <Paper withBorder p="xl" radius="md">
    <Stack>
      <Title order={2} size={22}>
        基本的な使い方
      </Title>
      <List
        spacing="xs"
        size="sm"
        center
        icon={null} // デフォルトのアイコンを削除
      >
        <List.Item
          icon={
            <ThemeIcon size={24} radius="xl" color="blue">
              <IconNumber1 style={{ width: 16, height: 16 }} />
            </ThemeIcon>
          }
        >
          <Text>
            <Text span fw={700}>
              共通設定
            </Text>
            に、microCMSのサービスIDとAPIキーを入力します。
          </Text>
        </List.Item>
        <List.Item
          icon={
            <ThemeIcon size={24} radius="xl" color="blue">
              <IconNumber2 style={{ width: 16, height: 16 }} />
            </ThemeIcon>
          }
        >
          <Text>
            <Text span fw={700}>
              エクスポートするAPI
            </Text>
            に、ダウンロードしたいAPIのエンドポイント名を入力します。
          </Text>
        </List.Item>
        <List.Item
          icon={
            <ThemeIcon size={24} radius="xl" color="blue">
              <IconNumber3 style={{ width: 16, height: 16 }} />
            </ThemeIcon>
          }
        >
          <Text>
            <Text span fw={700}>
              ［CSVファイルをダウンロード］
            </Text>
            ボタンをクリックすると、処理が開始されます。
          </Text>
        </List.Item>
      </List>
    </Stack>
  </Paper>
)
