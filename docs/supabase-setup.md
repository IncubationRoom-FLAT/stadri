# Supabase データベース接続・設定ガイド

Vercel へのデプロイ完了後、Supabase の PostgreSQL データベースと接続するための手順です。

---

## 1. Supabase プロジェクトの作成

1. [https://supabase.com](https://supabase.com) にアクセスし、アカウントを作成・ログイン
2. 「New project」をクリック
3. 以下を設定して「Create new project」をクリック
   - **Organization**: 任意
   - **Name**: `stadri`（任意）
   - **Database Password**: 強力なパスワードを設定（後で使用するので控えておく）
   - **Region**: `Northeast Asia (Tokyo)` 推奨

プロジェクトの作成には1〜2分かかります。

---

## 2. テーブルの作成

Supabase ダッシュボードの左メニューから **「SQL Editor」** を開き、以下の SQL を実行してください。

```sql
CREATE TABLE rooms (
    id   TEXT PRIMARY KEY,
    state JSONB NOT NULL
);
```

**実行手順:**
1. SQL Editor 画面で「New query」をクリック
2. 上記の SQL を貼り付け
3. 「Run」ボタン（または `Ctrl+Enter`）をクリック
4. 「Success」と表示されれば完了

---

## 3. 接続情報の取得

### Transaction Pooler の接続文字列を使用する（Vercel 推奨）

Vercel のサーバーレス環境では、コネクションを使い捨てにする **Transaction Pooler**（ポート 6543）の使用を推奨します。

1. Supabase ダッシュボード左メニューの **「Project Settings」→「Database」** を開く
2. **「Connection string」** セクションの **「Transaction」** タブを選択
3. 表示される URI をコピーする（形式は以下の通り）

```
postgresql://postgres.[project-ref]:[your-password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

> **注意**: `[your-password]` の部分は、プロジェクト作成時に設定したパスワードに置き換えてください。

---

## 4. Vercel に環境変数を設定

1. [Vercel ダッシュボード](https://vercel.com/dashboard) にアクセス
2. 該当プロジェクトを選択
3. 「Settings」→「Environment Variables」を開く
4. 以下の変数を追加する

| Name | Value |
|------|-------|
| `DB_HOST` | `aws-0-ap-northeast-1.pooler.supabase.com` |
| `DB_PORT` | `6543` |
| `DB_NAME` | `postgres` |
| `DB_USER` | `postgres.[project-ref]` |
| `DB_PASS` | `プロジェクト作成時のパスワード` |
| `DB_SSL`  | `true` |

> `[project-ref]` は Supabase ダッシュボードの Project Settings → General に表示されている「Reference ID」です。

5. 各変数の「Environment」は **Production / Preview / Development** すべてにチェックを入れる
6. 「Save」をクリック

---

## 5. `lib/db.ts` の SSL 対応

Supabase（および多くのクラウド PostgreSQL サービス）は SSL 接続が必須です。  
現在の `lib/db.ts` を以下のように更新してください。

```typescript
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mydb',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASS || '',
    ssl: process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
    // Vercel のサーバーレス環境ではコネクション数を抑える
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
});

export default pool;
```

> `max: 1` にしているのは、Vercel のサーバーレス関数は短命で大量に起動されるため、  
> コネクションプールを 1 に絞ることで Supabase 側の接続上限エラーを防ぐためです。

---

## 6. 再デプロイ

環境変数と `db.ts` の変更を反映するために再デプロイが必要です。

```bash
# ローカルで変更をコミット・プッシュ
git add stadri-next-app/lib/db.ts
git commit -m "feat: Supabase SSL対応とサーバーレス向けPool設定"
git push origin main
```

Vercel は `main` ブランチへのプッシュを検知して自動的に再デプロイします。

---

## 7. 動作確認

デプロイ完了後、以下の手順で接続を確認します。

1. Vercel のデプロイページで「Visit」から本番 URL を開く
2. マルチプレイの「部屋を作成」を実行
3. Supabase ダッシュボードの **「Table Editor」→「rooms」** テーブルを開く
4. 作成したルームのレコードが表示されれば接続成功

---

## トラブルシューティング

### `SSL SYSCALL error` / `Connection refused`

- `DB_SSL=true` が正しく設定されているか確認
- `DB_PORT` が `6543`（Transaction Pooler）になっているか確認

### `too many connections`

- `lib/db.ts` の `max: 1` が設定されているか確認
- Supabase の無料プランは最大 60 コネクションまで

### `password authentication failed`

- Supabase ダッシュボードの Project Settings → Database → **「Reset database password」** でパスワードをリセットし、Vercel の `DB_PASS` を更新

### Vercel の Functions ログを確認

Vercel ダッシュボード → 「Deployments」→ 最新のデプロイ → 「Functions」タブで、  
各 API ルートのエラーログをリアルタイムで確認できます。
