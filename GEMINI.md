# Apotheke Fragrance Site - プロジェクト概要

このドキュメントは、プロジェクトの主要な構成、使用技術、外部サービス、およびGeminiによる主な変更点をまとめたものです。次回作業を再開する際や、プロジェクトの全体像を把握する際にご活用ください。

## 1. プロジェクトの基本情報

*   **フレームワーク**: Next.js (App Router)
*   **言語**: TypeScript
*   **スタイリング**: Tailwind CSS
*   **デプロイ**: Vercel

## 2. 主要な機能と構成

*   **Eコマース機能**: 商品表示、カート管理、チェックアウト、注文処理
*   **ユーザー認証**: ログイン、サインアップ
*   **データベース**: Supabase (PostgreSQL)
*   **ファイルストレージ**: Supabase Storage
*   **メール送信**: Resend
*   **決済**: Stripe (Checkout, Webhooks)

### フォルダ構成の概要

*   `src/app/`: ページとAPIルートの定義 (ファイルベースルーティング)
    *   `src/app/api/`: APIエンドポイント (Stripe Webhook, Checkoutなど)
    *   `src/app/auth/`: 認証関連ページ
    *   `src/app/products/[id]/`: 商品詳細ページ (SSGでビルド時に生成)
*   `src/components/`: 再利用可能なUIコンポーネント
*   `src/context/`: React Context API (認証、カートなど)
*   `src/lib/`: ユーティリティ関数、外部サービス初期化 (Supabaseクライアントなど)
*   `public/`: 静的ファイル (画像、ロゴなど)

## 3. 外部サービスと環境変数

このプロジェクトでは以下の外部サービスを利用しており、それぞれのAPIキーやURLは環境変数で管理されています。

| 環境変数名                     | 説明                                                              | 用途                                                              |
| :----------------------------- | :---------------------------------------------------------------- | :---------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`          | サイトの公開URL (例: `https://your-site.vercel.app`)              | StripeリダイレクトURL、Supabaseクライアント初期化など             |
| `STRIPE_SECRET_KEY`            | StripeのシークレットAPIキー (`sk_live_...` または `sk_test_...`) | サーバーサイドでのStripe API呼び出し (Checkoutセッション作成など) |
| `STRIPE_WEBHOOK_SECRET`        | Stripe Webhookの署名シークレット (`wh_live_...` または `wh_test_...`) | StripeからのWebhookイベントの検証                                 |
| `NEXT_PUBLIC_SUPABASE_URL`     | SupabaseプロジェクトのURL                                         | Supabaseクライアント初期化 (公開可能)                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| SupabaseのAnonキー (公開可能)                                     | Supabaseクライアント初期化 (公開可能)                             |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabaseのサービスロールキー (秘密)                               | サーバーサイドでのSupabase Adminクライアント初期化 (Webhookなど)  |
| `RESEND_API_KEY`               | ResendのAPIキー                                                   | メール送信                                                        |

## 4. 開発・ビルドコマンド

*   `npm run dev`: 開発サーバーを起動
*   `npm run build`: プロダクションビルドを作成
*   `npm run start`: プロダクションビルドを起動

## 5. Geminiによる主な変更点 (変更履歴)

このセクションには、Geminiがこのプロジェクトに対して行った主要な変更が記録されます。

*   **2025年9月2日**:
    *   Stripe Webhook (`src/app/api/webhooks/stripe/route.ts`) の型エラーを修正。`fullSession.collected_information?.shipping_details` を使用するように変更。
    *   ビルド時の `TypeError: Invalid URL` を修正するため、`.env.local` に `NEXT_PUBLIC_APP_URL=http://localhost:3000` を追加。
    *   Stripe Taxの自動計算を有効化 (`src/app/api/checkout/route.ts`, `src/app/api/checkout/quick-buy/route.ts` に `automatic_tax: { enabled: true }` を追加)。
    *   `src/components/ProductDetails.tsx` から誤って追加された `priority={90}` を削除。
    *   ヘッダー (`src/components/Header.tsx`) のレイアウトを調整し、PC・モバイル両方で「MEGURID」タイトルが中央に表示されるように変更。

---

**[ここに、あなた自身で重要な変更点やメモを追記してください]**