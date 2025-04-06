# Googleカレンダーリマインダーbot

## Botについて
島村研究室のDiscordチャンネルに対してGoogleカレンダーに登録されている予定のリマインダーを送信します.

## 開発について

### 環境構築

パッケージマネジャーの`pnpm`をインストールしてください.

- linux(ubuntu)環境の場合

```bash
# curlがインストールされている場合
curl -fsSL https://get.pnpm.io/install.sh | sh -

# curlがインストールされていない場合
wget -qO- https://get.pnpm.io/install.sh | sh -
```

- Windowsの場合

```bash
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```

### 必要パッケージのインストール

```
pnpm install
```

### デプロイ

以下のコマンドを実行するだけでデプロイをすることができます.
※基本的にGithub Actions上でのデプロイを想定しているため, 手元でこちらのコマンドは実行しないようにお願いします.

```
npm run deploy
```
