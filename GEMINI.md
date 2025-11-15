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
*   **アフィリエイト機能**: リンク生成、クリック計測、成果管理
*   **UGC（ユーザー作成コンテンツ）機能**: レビュー・画像投稿、管理者による審査
*   **データベース**: Supabase (PostgreSQL)
*   **ファイルストレージ**: Supabase Storage
*   **メール送信**: Resend
*   **決済**: Stripe (Checkout, Webhooks)

### フォルダ構成の概要

*   `src/app/`: ページとAPIルートの定義 (ファイルベースルーティング)
    *   `src/app/api/`: APIエンドポイント (Stripe Webhook, Checkoutなど)
    *   `src/app/admin/`: 管理者向けダッシュボード
    *   `src/app/products/[id]/`: 商品詳細ページ (SSGでビルド時に生成)
    *   `src/app/submit-review/`: UGC投稿ページ
    *   `src/app/gallery/`: UGCギャラリーページ
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

*   **2025年11月7日**:
    *   **アフィリエイト機能の実装**:
        *   DBスキーマ（紹介者、リンク、クリック、成果、支払）を作成。
        *   `middleware`にてアフィリエイトコード (`?aff=...`) を検知し、クリック計測とCookie保存を行うロジックを実装。
        *   StripeのCheckoutおよびWebhookと連携し、購入成果をアフィリエイトと紐付け、報酬を記録するバックエンド処理を実装。
        *   管理者画面に、紹介者の登録、一覧表示、詳細表示、リンクごとの成果（クリック、CV、報酬額）を確認できるUIを実装。
        *   （UI改善）発行済みリンクの完全なURLを自動生成し、ワンクリックでコピーできる機能を追加。
    *   **UGC（ユーザー作成コンテンツ）機能の実装**:
        *   DBスキーマ（投稿、画像）を作成。
        *   ユーザーがレビューと写真を投稿できるページ (`/submit-review`) を作成。画像はSupabase Storageにアップロード。
        *   管理者画面に、投稿されたUGCを承認・却下できる審査機能を追加。
        *   承認済みのUGCを、該当する商品詳細ページに一覧表示する機能を追加。
        *   承認済みUGCの画像のみをタイル表示するギャラリーページ (`/gallery`) を作成。
    *   **UI/UXの改善**:
        *   管理者画面、UGC投稿ページなどのUIを、プロジェクトで定義されたテーマカラー (`tailwind.config.ts`) に基づいて全面的に改修し、サイト全体でデザインを統一。
        *   商品詳細ページに「レビューを書く」リンクを常設し、投稿への導線を確保。
        *   商品詳細ページの画像カルーセルの表示速度を向上させるため、画像の先行読み込み（preload）を実装。
    *   **その他**:
        *   テスト用に「test」という名前の商品には送料がかからないようにする一時的な例外ルールをチェックアウト処理に追加。
        *   多数のビルドエラー（型エラー、構文エラー、実行時エラー）を修正。

*   **2025年10月24日**:
    *   **管理者機能の実装:**
        *   クライアントサイドで完結する管理者ページ (`/admin`) を実装。
        *   ログインフォーム、状態管理（ローディング、ログイン、ダッシュボード表示）を含む。
        *   Supabaseに事前登録された管理者のみがログイン可能。
    *   **注文履歴の表示:**
        *   管理者ダッシュボードに、`orders`テーブルから取得した注文履歴を一覧表示。
        *   日付、注文者、連絡先、住所、値段、購入品目、配送状況の各項目を表示。
        *   配送状況はクリックで更新可能なチェックボックスとして実装。
    *   **セキュリティ設定:**
        *   `orders`テーブルに対し、管理者のみがデータを読み取れるようにするRLS（行単位セキュリティ）ポリシーを設定。
        *   サイト全体を非公開にするためのBasic認証を`middleware.ts`で実装。ビルド時は認証をスキップするよう設定済み。
    *   **メール通知機能:**
        *   Stripe Webhookを更新し、購入完了時に管理者 (`info@megurid.com`) 宛に注文内容が記載された通知メールを送信する機能を追加。
    *   **ビルドエラー修正:**
        *   ホームページのビルド時に、画像がない商品が原因で発生していたエラーを修正。

*   **2025年9月2日**:
    *   Stripe Webhook (`src/app/api/webhooks/stripe/route.ts`) の型エラーを修正。`fullSession.collected_information?.shipping_details` を使用するように変更。
    *   ビルド時の `TypeError: Invalid URL` を修正するため、`.env.local` に `NEXT_PUBLIC_APP_URL=http://localhost:3000` を追加。
    *   Stripe Taxの自動計算を有効化 (`src/app/api/checkout/route.ts`, `src/app/api/checkout/quick-buy/route.ts` に `automatic_tax: { enabled: true }` を追加)。
    *   `src/components/ProductDetails.tsx` から誤って追加された `priority={90}` を削除。
    *   ヘッダー (`src/components/Header.tsx`) のレイアウトを調整し、PC・モバイル両方で「MEGURID」タイトルが中央に表示されるように変更。

---

**[ここに、あなた自身で重要な変更点やメモを追記してください]**