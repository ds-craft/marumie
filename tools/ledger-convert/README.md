# ledger-convert（DSクラフト台帳の変換）

非公開の台帳リポジトリ（ds-craft/ledger）を検証し、公開用のファイルに変換する。

```bash
pnpm ledger:convert --ledger ../ledger --out data/public   # 変換
pnpm ledger:convert --ledger ../ledger --check             # 検証だけ
pnpm test:ds                                                # テスト
```

出力:

| ファイル | 用途 |
|---|---|
| `mf-journal.csv` | MF仕訳帳形式。`pnpm public:import` で DB に入れる（admin の「CSVアップロード」でも取り込める） |
| `ledger-public.csv` | 公開してよい列だけの台帳（証憑ID・ハッシュ値・確度・時期つき） |

## DB への取り込み

```bash
pnpm public:import                 # data/public の organization.json と mf-journal.csv を DB に入れる
pnpm public:import --dir <dir>     # 別のディレクトリから
```

- `organization.json` の団体を slug で作成・更新し、その団体の取引を `mf-journal.csv` の内容で入れ替える。台帳から消した行は DB からも消える
- 取り込めない行が 1 行でもあれば、何も書き込まずに止まる（admin の画面と違い、無効な行を飛ばして保存しない）
- 接続先は `DATABASE_URL`。静的サイトのビルドで空の DB にデータを入れるために使う

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
- 小分類が `shared/accounting/account-category.ts` にあるか、収入・支出の向きが合っているか
- 支払元・時期がマスタにあるか、証憑の形式（receipt なら証憑ID 必須、ハッシュ値がなければ警告）
- 公開される列に `private_words.txt` の語（地名・家族など）が含まれていないか

公開用台帳は `PUBLIC_COLUMNS` に挙げた列だけを出力する。`private_note` などは出力されない。

架空のサンプル台帳は [sample/](sample/) にある。
