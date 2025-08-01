# レイヤード案件獲得ゲーム

このプロジェクトは案件獲得を模したシューティングゲームです。ブラウザ上で動作します。

## 概要
- 画面上にランダムに表示される商材のアイコンをクリックして案件を獲得するゲームです
- Kakariteを最も多く受注することが目標です
- ゲーム時間は1分間です
- Google Sheetにランキングデータを保存します

## 技術スタック
- **言語**: JavaScript、HTML、CSS
- **DB**: Supabase (PostgreSQL)
- **インフラ**: Render（静的サイトホスティング）

## ゲーム画面構成
1. **スタート画面**: タイトルと「ゲームスタート」「ランキング」「ゲームルール」ボタン
2. **ランキング画面**: 全ユーザの得点を高い順に表示
3. **ゲームルール画面**: ゲームの操作方法とルールを表示
4. **ゲーム画面**: メインのゲームプレイ画面
5. **ゲーム完了画面**: 得点表示とコメント登録機能

## ゲームルール
- 案件が飛んでくるので、クリックして受注しましょう
- Kakariteを最も多く受注してください。ゲーム終了時に他の商材を多く受注した場合はゲームオーバーとなります
- クロスセル状態を1回だけ使えます（右クリック）。クロスセル状態になるとマウスが広くなります
- 本部長が飛んできますが回避してください。怒りを買ってしまいます
- ゲーム終了するとコメントを登録できます。500アカウント突破のお祝いコメントを書きましょう

## ゲーム詳細
- 商材は奥から手前に飛んできます（12×12px → 120×120px）
- 表示されて消えるまでの時間は3秒
- クリックできるのは一番手前に表示されている商材のみ
- 一点透視図法の軌道で大きくなります
- 本部長アイコンをクリックすると3秒間クリック無効（画面が赤く点滅）
- 右クリックで「クロスセル状態」（128×128pxのカーソル範囲、5秒間限定、1回限り）

## アイコン種類
### 商材
- Kakarite: `/src/assets/logo_kakarite_symbol_color.png`
- Iver: `/src/assets/logo_iver_symbol_color.png`
- Medicastar: `/src/assets/logo_medicastar_symbol_color.png`
- Symview: `/src/assets/logo_symview_symbol_color.png`
- Wakumy: `/src/assets/logo_wakumy_symbol_color.png`

### 本部長陣
- 江橋さん: `/src/assets/ebashi.png`
- 伊藤さん: `/src/assets/ito.png`
- 毛塚さん: `/src/assets/kezuka.png`
- 三角さん: `/src/assets/misumi.png`

## DB構成
Supabaseに以下のテーブルでデータを保存：

### テーブル名: `scores`
- **id**: int8 (主キー、自動生成)
- **created_at**: timestamp (作成日時、自動生成)
- **name**: varchar (プレイヤー名)
- **score**: int4 (得点)
- **comment**: text (コメント)

## Supabase設定手順
1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. SQL Editorで以下のテーブルを作成:
```sql
CREATE TABLE scores (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR NOT NULL,
  score INTEGER NOT NULL,
  comment TEXT
);
```
3. `src/javascript/supabase.js`の以下を更新:
   - `SUPABASE_URL`: プロジェクトURL
   - `SUPABASE_ANON_KEY`: プロジェクトのAnon Key

## ディレクトリ構成
```
├── index.html          # ルートHTML
├── README.md          # このファイル
└── src/
    ├── assets/        # 画像等の素材
    ├── css/          # CSSファイル
    ├── html/         # HTMLファイル
    └── javascript/   # JavaScriptファイル
        ├── game.js           # ゲームエンジン
        ├── main.js           # メイン制御
        ├── supabase.js       # Supabase API連携
        └── googlesheets.js   # Google Sheets API連携（後方互換用）
```

## デザイン仕様
- **背景色**: #F4F1ED
- **見出しやタイトル色**: #FF6358
- **文字色**: #252625

## 開発・デプロイ
1. **ローカル開発**: `index.html`をブラウザで開く
2. **データベース**: Supabaseの設定が必要（上記参照）
3. **デプロイ**: Renderの静的サイト機能を使用

## 使用方法
1. Supabaseプロジェクトをセットアップ
2. `src/javascript/supabase.js`の設定を更新
3. `index.html`をブラウザで開く
4. 「ゲームスタート」をクリックしてゲーム開始
5. 飛んでくる商材をクリックして案件獲得
6. Kakariteを最も多く獲得することを目指す
