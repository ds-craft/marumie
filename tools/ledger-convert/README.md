# ledger-convert（DSクラフト台帳の変換）

非公開の台帳リポジトリ（ds-craft/ledger）を検証し、公開用のファイルに変換する。

```bash
pnpm ledger:convert --ledger ../ledger --evidence <黒塗りした証憑のフォルダ> --out data/public   # 変換
pnpm ledger:convert --ledger ../ledger --check                                                 # 検証だけ
pnpm test:ds                                                # テスト
```

`private_words.txt`（公開してはいけない語）は語そのものが個人情報なので、台帳リポジトリの外に置き、
`--private-dir <フォルダ>` か環境変数 `LEDGER_PRIVATE_DIR` で場所を渡す。
どちらも無ければ台帳の `masters/private_words.txt` を使う（サンプル台帳用）。
見つからないとき、出力するならエラーで止まり、`--check` なら警告を出して検査を飛ばす。

黒塗りした証憑のフォルダ（台帳リポジトリの `tools/redact_evidence.py` の出力先）は `--evidence <フォルダ>` か環境変数 `LEDGER_EVIDENCE_DIR` で渡す。
黒塗り版のハッシュ値（`evidence_redacted_sha256`）がある行ごとに、フォルダから「証憑ID_….拡張子」のファイルを探してハッシュ値を照合し、
一致したものを `evidence/{証憑ID}.{拡張子}` として書き出す（日付・取引先はファイル名に出さない）。
ファイルが無い・複数ある・ハッシュ値が違うとエラーで止まる。フォルダを渡さないとき、出力するならエラー、`--check` なら警告を出して照合を飛ばす。

出力:

| ファイル | 用途 |
|---|---|
| `mf-journal.csv` | MF仕訳帳形式。`pnpm public:import` で DB に入れる（admin の「CSVアップロード」でも取り込める） |
| `ledger-public.csv` | 公開してよい列だけの台帳（証憑ID・原本と黒塗り版のハッシュ値・公開している証憑のファイル名・確度・時期つき） |
| `evidence/R-YYYY-NNN.pdf` など | 黒塗りした証憑。ハッシュ値は台帳の `evidence_redacted_sha256` と一致する |

## サイトへの配置

```bash
pnpm public:stage                        # data/public の ledger-public.csv と evidence/ を webapp/public/evidence に置く
PUBLIC_DATA_DIR=<dir> pnpm public:stage  # 別のディレクトリから
```

- `pnpm build:site` が毎回呼ぶので、ビルドするときは不要。`pnpm dev` で確かめるときだけ先に実行する
- サイトでは `/evidence/ledger-public.csv`・`/evidence/R-YYYY-NNN.pdf` として配られる。取引一覧の各行から証憑と公開台帳の行（`/ledger/`）にリンクする
- `webapp/public/evidence/` は毎回作り直し、Git には入れない。公開台帳にある証憑ファイルが無い・ハッシュ値が違うとエラーで止まる

## DB への取り込み

```bash
pnpm public:import                 # data/public の organization.json と mf-journal.csv を DB に入れる
pnpm public:import --dir <dir>     # 別のディレクトリから
```

- `organization.json` の団体を slug で作成・更新し、その団体の取引を `mf-journal.csv` の内容で入れ替える。台帳から消した行は DB からも消える
- 取り込めない行が 1 行でもあれば、何も書き込まずに止まる（admin の画面と違い、無効な行を飛ばして保存しない）
- 接続先は `DATABASE_URL`。静的サイトのビルドで空の DB にデータを入れるために使う

## 公開

`main` に push すると、GitHub Actions（`.github/workflows/pages.yml`）が使い捨ての DB に `data/public` を取り込み、
webapp を静的に書き出して GitHub Pages（https://marumie.ds2.uk）に公開する。

1. `LEDGER_PRIVATE_DIR=<語リストのフォルダ> pnpm ledger:convert --ledger ../ledger --evidence <黒塗りした証憑のフォルダ> --out data/public`（`private_words.txt` の検査・証憑の照合もここで行われる）
2. 手元で確かめる：`pnpm public:import` → `pnpm public:stage` → `pnpm dev`（または `pnpm build:site` で `webapp/out` に書き出す）
3. `data/public/` の変更をコミットして PR → マージすると公開される

`data/public/mf-journal.csv` がまだないうちは、サンプル台帳でビルドだけして公開しない。

## 仕訳の作り方

marumie の取り込み処理は「現金類 ↔ 収入・支出科目」の組み合わせしか収支として扱わない。
そのため、運営者や家族が払った支出 1 件は 2 行の仕訳にする。

| 取引No | 借方 | 貸方 | タグ |
|---|---|---|---|
| `{id}-1` | 現金 | 運営者拠出（収入） | 運営者拠出 |
| `{id}-2` | PC本体（支出） | 現金 | 品目（例: サーバー用PC 1台目） |

同じ日・同じ額なので現金残高は 0 のまま。`type=income` の行（寄付など）は `現金 / 小分類` の 1 行。
タグが空だと admin の取り込みで無効になるため、拠出側にも公開名を入れている。

## 検証すること

- 列の過不足、id（`YYYY-NNN`）の形式と重複、日付の形式、ファイルの年と支払日の年の一致
- 対象期間（periods.yaml の最初の開始日）より前の日付
- periods.yaml の開始日の形式と重複
- 小分類が `shared/accounting/account-category.ts` にあるか、収入・支出の向きが合っているか
- 支払元がマスタにあるか、証憑の形式（receipt なら証憑ID 必須、ハッシュ値がなければ警告。黒塗り版のハッシュ値は証憑ID とセット）

時期（`period`・`period_name`）は台帳に書かず、支払日から決める。periods.yaml の `start` が支払日以前で最も新しい時期になる
（終わりは次の時期の `start` の前日）。
- 公開される列に `private_words.txt` の語（地名・家族など）が含まれていないか

公開用台帳は `PUBLIC_COLUMNS` に挙げた列だけを出力する。`private_note` などは出力されない。

架空のサンプル台帳は [sample/](sample/) にある。
