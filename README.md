# microCSV

microCSV は、ヘッドレス CMS である microCMS に保存されたコンテンツを、手軽に CSV ファイルとしてエクスポートできる Web ツールです。複数の API から同時にデータを取得し、zip 形式でまとめてダウンロードできるツールです。

API キーなどの入力された情報は、microCMS の API サーバーへの通信にのみ利用されます。外部のサーバーに情報が送信されることはなく、すべての処理はブラウザ内で完結するため、安全にご利用いただけます。

## 使い方

1. https://micro-csv.vercel.app にアクセスします

2. 共通設定として、対象となるサービス ID と API キーをそれぞれ入力します

3. （任意）エンドポイントごとに API キーを使い分ける場合は、「特定のエンドポイントに別の API キーを使う」にチェックを入れ、個別に入力します

4. ［CSV ファイルをダウンロード］ボタンを押して、ダウンロードを実行します

5. 処理が完了すると、`microcms-export_{日付}.zip` という名前の zip ファイルがダウンロードされます。

## 注意事項／免責

- 本ツールは非公式のツールです。ツールの利用によって生じたいかなる損害についても、開発者は一切の責任を負いません。自己責任でご利用ください。

- microCMS の API には各種利用制限があります。大量のコンテンツを取得する際にはご注意ください。詳細は[公式ドキュメントの制限事項](https://document.microcms.io/manual/limitations)をご確認ください。

- API キーの権限不足やエンドポイントの指定間違いによりエラーが発生することがあります。エラー内容の詳細は[公式ドキュメントのエラーレスポンスまとめ](https://document.microcms.io/content-api/api-error-response)をご確認ください。

## お問い合わせ

[こちらのフォーム](https://docs.google.com/forms/d/e/1FAIpQLSdihgA7okkIaqCD6jnwSUV-DUBALMEqewaU-zvnJ01AiIcqhQ/viewform)からご連絡ください。
