# STARTUP DREAMER - 起業家育成ボードゲーム

起業のアイデアを考え、プレゼンし、投資を集めて成功を目指すボードゲームのWebアプリケーションです。

## 🚀 環境構築（Windows + WSL）

このプロジェクトは、Windows環境でWSL（Windows Subsystem for Linux）上で動作します。

### 1. WSL2のインストール

#### Windows 10/11の場合

1. **PowerShellを管理者権限で開く**
   - タスクバーの検索で「PowerShell」と入力
   - 「Windows PowerShell」を右クリック → 「管理者として実行」

2. **WSLをインストール**
   ```powershell
   wsl --install
   ```

3. **コンピューターを再起動**

4. **Ubuntuのセットアップ**
   - 再起動後、Ubuntuが自動的に起動します
   - ユーザー名とパスワードを設定してください

5. **WSLのバージョン確認**
   ```powershell
   wsl --list --verbose
   ```
   - `VERSION`列が`2`になっていることを確認

### 2. Node.jsのインストール（WSL内）

1. **WSL (Ubuntu) を起動**
   - スタートメニューから「Ubuntu」を検索して起動

2. **パッケージリストを更新**
   ```bash
   sudo apt update
   sudo apt upgrade -y
   ```

3. **nvmをインストール（Node.jsバージョン管理ツール）**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   ```

4. **ターミナルを再起動**
   ```bash
   source ~/.bashrc
   ```

5. **Node.jsをインストール**
   ```bash
   nvm install --lts
   nvm use --lts
   ```

6. **インストール確認**
   ```bash
   node --version
   npm --version
   ```
   - Node.js v20以上が推奨されます

### 3. VSCodeのインストールと設定

1. **VSCodeをインストール（Windows側）**
   - [VSCode公式サイト](https://code.visualstudio.com/)からダウンロード・インストール

2. **WSL拡張機能をインストール**
   - VSCodeを起動
   - 左側の拡張機能アイコンをクリック
   - 「WSL」と検索
   - 「WSL」（Microsoft製）をインストール

3. **WSLからVSCodeを開く**
   - WSL (Ubuntu) のターミナルで以下を実行
   ```bash
   cd ~
   code .
   ```
   - 初回は自動的にVSCode Serverがインストールされます

## 📦 プロジェクトのセットアップ

### 1. リポジトリのクローン（初回のみ）

WSLのターミナルで実行：

```bash
# ホームディレクトリに移動
cd ~

# リポジトリをクローン
git clone https://github.com/IncubationRoom-FLAT/stadri.git

# プロジェクトディレクトリに移動
cd stadri/stadri-next-app
```

### 2. 依存関係のインストール

```bash
npm install
```

このコマンドで、プロジェクトに必要なすべてのパッケージがインストールされます。

### 3. VSCodeでプロジェクトを開く

```bash
code .
```

## 🎮 アプリケーションの実行

### 開発サーバーの起動

```bash
npm run dev
```

起動後、以下のメッセージが表示されます：

```
> stadri-next-app@0.1.0 dev
> next dev

  ▲ Next.js 16.1.6
  - Local:        http://localhost:3000
  - Network:      http://xxx.xxx.xxx.xxx:3000

 ✓ Starting...
 ✓ Ready in xxxms
```

### ブラウザでアクセス

1. **Webブラウザを開く**（Windows側）
   - Google Chrome、Microsoft Edge、Firefoxなど

2. **以下のURLにアクセス**
   ```
   http://localhost:3000
   ```

3. **ゲームが表示されます！**
   - タイトル画面が表示されればセットアップ完了です

### サーバーの停止

ターミナルで `Ctrl + C` を押すと開発サーバーが停止します。

## 🛠️ その他のコマンド

### 本番用ビルド

```bash
npm run build
```

### 本番サーバーの起動

```bash
npm run start
```

※本番用は `npm run build` を実行した後に使用します

### コードチェック（ESLint）

```bash
npm run lint
```

## 📱 スマートフォンでアクセスする方法

同じWi-Fiネットワーク内の他のデバイス（スマホ・タブレット）からもアクセスできます。

1. **WSLのIPアドレスを確認**
   ```bash
   hostname -I
   ```
   - 最初に表示されるIPアドレスをメモ（例: 172.x.x.x）

2. **スマホのブラウザでアクセス**
   ```
   http://[WSLのIPアドレス]:3000
   ```
   - 例: `http://172.20.10.5:3000`

## 🎯 プロジェクト構造

```
stadri-next-app/
├── app/                    # Next.js Appディレクトリ
│   ├── components/        # 共通コンポーネント（Header, Footer）
│   ├── context/           # React Context（ゲーム状態管理）
│   ├── game/              # ゲーム画面
│   │   ├── confirm/       # お題確認画面
│   │   ├── thinking/      # シンキングタイム画面
│   │   ├── pitch/         # プレゼン画面
│   │   ├── invest/        # 投資画面
│   │   ├── gacha/         # ガチャ画面
│   │   └── rank/          # ランキング画面
│   ├── rule/              # ルール説明画面
│   ├── setup/             # ゲーム設定画面
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ（タイトル画面）
│   └── providers.tsx      # Contextプロバイダー
├── public/                # 静的ファイル（画像など）
├── package.json           # プロジェクト設定
└── README.md              # このファイル
```

## 🐛 トラブルシューティング

### ポート3000が既に使用されている

別のアプリケーションがポート3000を使用している場合：

```bash
# 別のポートで起動
PORT=3001 npm run dev
```

### WSLからWindows側のファイルにアクセスしたい

Windows側のCドライブは `/mnt/c/` からアクセスできます：

```bash
cd /mnt/c/Users/[ユーザー名]/
```

### npmコマンドが見つからない

Node.jsが正しくインストールされているか確認：

```bash
which node
which npm
```

何も表示されない場合は、Node.jsのインストール手順を再度実行してください。

### ページが真っ白になる

1. ブラウザのコンソールを開く（F12キー）
2. エラーメッセージを確認
3. 開発サーバーのターミナルもエラーを確認

よくある原因：
- 依存関係の不足 → `npm install` を再実行
- ビルドエラー → `Ctrl+C`でサーバー停止後、再度 `npm run dev`

### WSLとWindows間でファイルが同期されない

WSL上のファイルを編集する場合は、必ずWSL内のパス（`/home/ユーザー名/...`）で作業してください。
Windows側（`/mnt/c/...`）で作業すると、パフォーマンスが低下します。

## 📝 開発のヒント

### ホットリロード

開発サーバー（`npm run dev`）起動中は、ファイルを保存すると自動的にブラウザがリロードされます。

### VSCode推奨設定

`.vscode/settings.json`を作成して以下を設定すると便利です：

```json
{
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 🎓 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: React 19
- **スタイリング**: CSS Modules + カスタムCSS
- **状態管理**: React Context API

## 📄 ライセンス

© 2026 Shimane University. All Rights Reserved.

## 🤝 サポート

問題が発生した場合は、以下を確認してください：

1. Node.jsのバージョン（v20以上推奨）
2. 依存関係が最新か（`npm install`を再実行）
3. ポート3000が空いているか

それでも解決しない場合は、開発チームに連絡してください。

