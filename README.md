# Googleカレンダーリマインダーbot

## Botについて
島村研究室のDiscordチャンネルに対してGoogleカレンダーに登録されている予定のリマインダーを送信します.

## 開発について

### 環境構築

google-calender-reminder-botディレクトリ直下にて以下のコマンドを実行することで自動で環境構築されます.

```bash
make build_environment
```

### サーバーの起動

```bash
pnpm dev
```

### デプロイ

以下のコマンドを実行するだけでデプロイをすることができます.
※基本的にGithub Actions上でのデプロイを想定しているため, 手元でこちらのコマンドは実行しないようにお願いします.

```bash
pnpm run deploy
```
