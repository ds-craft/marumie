# DSクラフト まる見え運営資金

[![CI](https://github.com/ds-craft/marumie/actions/workflows/ci.yml/badge.svg)](https://github.com/ds-craft/marumie/actions/workflows/ci.yml)
[![Pages](https://github.com/ds-craft/marumie/actions/workflows/pages.yml/badge.svg)](https://github.com/ds-craft/marumie/actions/workflows/pages.yml)

Minecraft（Java版）のマルチプレイコミュニティ「3DS半分こするくらい仲良しクラフト」（DSクラフト）の運営資金を公開するサイトのソースコードです。
チームみらいの [みらいまる見え政治資金（team-mirai/marumie）](https://github.com/team-mirai/marumie) をフォークし、コミュニティの運営費の公開向けに改変しています。

- **公開 URL**：<https://marumie.ds2.uk/>
- **対象環境**：Node.js 26 / pnpm 10 / GitHub Pages（静的サイトとして書き出し）
- **主な特徴**：品目ごとの収支の可視化、黒塗りした証憑の公開、SHA-256 による証憑の照合、非公開台帳からの変換と公開前の検査

## 目次

- [概要](#概要)
- [本家からの主な変更](#本家からの主な変更)
- [主なページ](#主なページ)
- [データの流れ](#データの流れ)
- [ディレクトリ構成](#ディレクトリ構成)
- [開発](#開発)
  - [前提環境](#前提環境)
  - [ローカル実行](#ローカル実行)
  - [コマンド](#コマンド)
  - [変更の入れ方](#変更の入れ方)
- [運用](#運用)
  - [公開データの更新](#公開データの更新)
  - [公開の仕組み](#公開の仕組み)
- [ドキュメント](#ドキュメント)
- [ライセンス](#ライセンス)
- [免責事項](#免責事項)

## 概要

DSクラフトのサーバー機材・VPS（クラウドサーバー）・ドメインなど、運営にかかったお金を品目ごとに公開するサイトです。

本家は、政治家・政治団体がクラウド会計ソフトの会計データを公開し、政治資金の流れを分かりやすく見せるためのダッシュボード。このフォークでは、その可視化の仕組みをそのまま使い、データの入口を「非公開の台帳リポジトリ（ds-craft/ledger）」に置き換えています。

金額の根拠は、各行に証憑の確度（証憑あり／明細から／概算）として表示。証憑（領収書・請求書・利用明細など）は氏名・住所・アカウント ID などを黒塗りしたうえで公開し、台帳に記録した SHA-256 と照合できるようにしています。

## 本家からの主な変更

| 項目 | 本家（team-mirai/marumie） | このフォーク |
|---|---|---|
| 公開方法 | Vercel 上の Next.js アプリ＋Supabase | GitHub Pages の静的サイト（ビルド時だけ使い捨ての Postgres を使う） |
| データの入口 | admin 画面から会計ソフトの CSV を取り込み | 非公開の台帳を `pnpm ledger:convert` で変換し、`data/public/` に置いて PR でマージ |
| 証憑 | なし | 黒塗りした証憑と公開台帳 CSV を `/evidence/` で配布。取引一覧の各行からリンク |
| 機能 | 議員・調査研究費・政治資金収支報告書の作成・貸借対照表 | `shared/features.ts` で非表示（コードは残しており、切り替えで戻せる） |
| 表記 | チームみらい・政治資金向け | `shared/site-config.ts` で DSクラフト向けに差し替え |
| CI | デプロイ・codecov・E2E・AI エージェントのループ用ワークフロー | `pnpm verify` と同じ項目だけを実行 |

## 主なページ

| ページ | パス | 内容 |
|---|---|---|
| トップ | [`/`](https://marumie.ds2.uk/) | 既定の年の収支ページへ転送 |
| 年別の収支 | [`/o/ds-craft/{年}`](https://marumie.ds2.uk/o/ds-craft/2026) | 収入・支出の総額、区分タブつきの収支の流れ（サンキー図）、毎月の収支推移、出入金の一覧（先頭の数件） |
| 全ての出入金 | [`/o/ds-craft/{年}/transactions`](https://marumie.ds2.uk/o/ds-craft/2026/transactions) | その年の取引一覧（日付・金額での並べ替え、収入／支出・区分での絞り込み、CSV ダウンロード）。各行から証憑と公開台帳の行へリンク |
| 公開台帳と証憑 | [`/ledger/`](https://marumie.ds2.uk/ledger) | 台帳の全行、証憑の確度とハッシュ値、`sha256sum` による照合の方法、公開台帳 CSV |
| まる見え運営資金とは | [`/about/`](https://marumie.ds2.uk/about) | サイトの説明と「データについて」（対象期間・計上の決まり・電気代などの注記） |
| 利用規約・プライバシーポリシー | [`/terms/`](https://marumie.ds2.uk/terms)・[`/privacy/`](https://marumie.ds2.uk/privacy) | 公開データの利用条件、アクセスログの扱い |

## データの流れ

```
[ ds-craft/ledger（非公開） ]          [ 証憑の原本（運営者の PC） ]
  台帳 CSV・マスタ                        │ tools/redact_evidence.py で黒塗り
       │                                 ▼
       └──── pnpm ledger:convert ◀── 黒塗りした証憑
              │ 列の検査・非公開語の検査・ハッシュ値の照合
              ▼
[ data/public/（このリポジトリ） ]
  mf-journal.csv・ledger-public.csv・evidence/・organization.json
       │ main にマージ
       ▼
[ GitHub Actions（pages.yml） ]
  使い捨ての Postgres に取り込み（pnpm public:import）→ 静的に書き出し（pnpm build:site）
       │
       ▼
[ GitHub Pages ]  https://marumie.ds2.uk/
```

- 台帳の列のうち、公開してよい列だけを明示的に出力（`private_note` などは出力しない）
- 公開する列に非公開の語（地名・家族の名前など）が含まれていれば、変換はエラーで停止。語リストは個人情報のため、どちらのリポジトリにも入れていない
- 黒塗り版のハッシュ値が台帳と一致しない証憑があれば、変換とビルドはエラーで停止

## ディレクトリ構成

本家の構成をそのまま引き継いでいます。DSクラフト向けに追加・変更した主な場所は次のとおりです。

```
marumie/
├── webapp/                 # 公開サイト（Next.js App Router。静的に書き出す）
│   ├── src/app/            # ページ（/o/[slug]/[year]、/ledger、/about、/terms、/privacy など）
│   ├── src/client/         # クライアントコンポーネント
│   ├── src/server/contexts/public-finance/  # 収支データの集計・公開
│   └── public/             # ロゴ・OGP 画像など（evidence/ はビルド時に作り直す。Git 管理外）
├── admin/                  # 管理画面（本家のもの。このフォークでは公開せず、取り込み処理だけを使う）
│   └── scripts/import-public-data.ts   # data/public を DB に入れる（pnpm public:import）
├── shared/                 # webapp と admin の共通コード
│   ├── site-config.ts      # サイト名・リンク・著作権表示（DSクラフト用）
│   ├── features.ts         # 本家の機能の表示切り替え
│   ├── accounting/account-category.ts  # 収支の区分（台帳の小分類の正本）
│   └── public-ledger.ts    # 公開台帳 CSV の読み込みと証憑の確度の表示名
├── tools/ledger-convert/   # 台帳の変換（convert.ts）とサイトへの配置（stage.ts）。sample/ は架空の台帳
├── data/public/            # 公開データ（変換の出力。マージすると公開される）
├── prisma/                 # データベーススキーマ・マイグレーション
├── supabase/               # Supabase のローカル開発環境の設定
├── docs/                   # 本家のドキュメント（正本とスナップショットの分類は docs/README.md）
└── .github/workflows/      # ci.yml（検証）・pages.yml（公開）
```

## 開発

### 前提環境

- Node.js 26（CI と同じ版。nvm などで管理）
- pnpm 10（`packageManager` の版を corepack で使用）
- Docker（Supabase をローカルで動かす場合）
- WSL2（Windows の場合。`C:\` 上ではなく WSL 内のファイルシステムに置くと pnpm が速く、改行も LF にそろう）

### ローカル実行

公開データを使って公開サイトを確かめる手順です。

```bash
pnpm install
pnpm supabase:start                 # Supabase（Docker）を起動
pnpm db:reset                       # マイグレーションとシード
pnpm public:import                  # data/public を DB に入れる
pnpm public:stage                   # 公開台帳と証憑を webapp/public/evidence に置く
pnpm dev:webapp                     # http://localhost:3000/
```

本番と同じ静的ファイルを確かめる場合は、`pnpm public:import` のあとに `pnpm build:site` を実行し、`webapp/out` を確認します。
admin 画面を含めた本家の開発手順（環境変数・Supabase キーの設定など）は [開発環境セットアップガイド](docs/getting-started.md) を参照してください。

### コマンド

```bash
pnpm verify                         # test・typecheck・lint・knip・depcruise・usecase の形の検査（push 前にも自動で実行）
pnpm test:ds                        # 台帳の変換と公開台帳のテストだけ
pnpm ledger:convert --ledger ../ledger --check   # 台帳の検証だけ（ファイルは書かない）
pnpm build:site                     # 静的サイトを webapp/out に書き出す
```

### 変更の入れ方

- `main` には直接入れず、作業ブランチから PR を出してマージします。
- フォークからの PR は、既定では本家（team-mirai/marumie）宛てになります。`gh pr create --repo ds-craft/marumie` のように送り先を明示してください。
- コミット時に Biome の整形（pre-commit）、push 時に `pnpm verify`（pre-push）が自動で実行されます。未使用の export やファイルは knip で検出されるため、残さないようにします。

## 運用

### 公開データの更新

台帳（ds-craft/ledger）を正本とし、このリポジトリの `data/public/` は変換の出力として扱います。手で編集しません。

1. 証憑を保存し、台帳に行を追加して原本のハッシュ値を記入（手順は台帳リポジトリの README）
2. 黒塗りしたコピーを作って目で確認し、そのハッシュ値を記入。台帳をコミット・push
3. このリポジトリで変換

   ```bash
   export LEDGER_PRIVATE_DIR=<非公開の語リストのフォルダ>
   pnpm ledger:convert --ledger ../ledger --evidence <黒塗りした証憑のフォルダ> --out data/public
   ```

4. `data/public/` の変更を PR にしてマージ（マージすると公開される）

変換・取り込み・仕訳の作り方の詳細は [`tools/ledger-convert/README.md`](tools/ledger-convert/README.md) を参照してください。

### 公開の仕組み

- **main への push**：`pages.yml` がビルドして GitHub Pages に公開
- **PR**：静的に書き出せるかだけを確認（公開しない）
- **毎月 1 日 9:00（日本時間）**：作り直して公開（年をまたいでも既定の年が古いままにならないように）

## ドキュメント

| 文書 | 内容 |
|---|---|
| [`tools/ledger-convert/README.md`](tools/ledger-convert/README.md) | 台帳の変換・公開データの取り込み・仕訳の作り方・検証項目 |
| [`docs/README.md`](docs/README.md) | 本家のドキュメントの読み方（正本とスナップショットの分類） |
| [`docs/getting-started.md`](docs/getting-started.md) | 本家の開発環境セットアップガイド |
| [`docs/backend-architecture-guide.md`](docs/backend-architecture-guide.md) | webapp / admin のバックエンド実装ルール |
| [`CLAUDE.md`](CLAUDE.md) | リポジトリの作業ルール（AI エージェント向け） |

## ライセンス

本プロジェクトは **[GNU Affero General Public License v3.0（AGPL-3.0）](LICENSE)** のもとで公開されています。

```
Copyright (C) 2025-2026 チームみらい（元のソフトウェア team-mirai/marumie）
Copyright (C) 2026 3DS半分こするくらい仲良しクラフト中央委員会（DSクラフト向けの改変）
```

### 利用条件と特記事項

- **ネットワーク経由での利用（AGPL §13）**：本ソフトウェアを改変してネットワーク経由でサービス・機能として提供する場合、バイナリを直接配布していなくても、その利用者に対して改変後のソースコードを開示する義務があります。フォークを公開リポジトリ等に配置し、利用者へ案内してください。公開サイトのフッターから、このリポジトリと本家へのリンクを案内しています。
- **公開データの除外**：`data/public/` の公開データ（収支・公開台帳・黒塗りした証憑）は AGPL の対象外です。閲覧・照合のための保存と、著作権法で認められる引用を除き、転載・再配布・改変・他のサービスやデータセットへの取り込みはお断りしています（詳しくは[利用規約](https://marumie.ds2.uk/terms)）。
- **ロゴマークの除外**：DSクラフトのロゴ（`webapp/public/logos/ds-craft-logo.png`）と OGP 画像（`webapp/public/social/og_image.png`）は AGPL の対象外です。無断で使用することはできません。
- **本家へのコントリビューション**：本家（team-mirai/marumie）に変更を提案する場合は、本家の [コントリビューターライセンス契約（CLA）](CLA.md) への同意が必要です。手順は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。本家の脆弱性は [SECURITY.md](SECURITY.md) の窓口から報告してください。

## 免責事項

本プロジェクトは Minecraft 公式の製品・サービスではありません。Mojang または Microsoft から承認を受けておらず、それらとの関連性もありません。

「Minecraft」は Mojang Synergies AB の商標です。

本プロジェクトはチームみらいの公式のサービスではありません。チームみらいから承認を受けておらず、DSクラフトの運営資金の公開とは関係ありません。
