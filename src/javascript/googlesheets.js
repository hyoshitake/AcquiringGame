/**
 * Google Sheets API連携
 * ランキングデータの取得と送信を担当
 */

class GoogleSheetsAPI {
    constructor() {
        // Google Sheets設定（実際の使用時に設定してください）
        this.SHEET_ID = 'YOUR_SHEET_ID'; // Google SheetsのIDを設定
        this.API_KEY = 'YOUR_API_KEY'; // Google Sheets APIキーを設定
        this.SHEET_NAME = 'rankings'; // シート名

        // Web App URL（Google Apps Scriptで作成）
        this.WEB_APP_URL = 'YOUR_WEB_APP_URL'; // Google Apps ScriptのWeb App URLを設定
    }

    /**
     * ランキングデータを取得
     * @returns {Promise<Array>} ランキングデータの配列
     */
    static async getRankings() {
        console.log('ランキングデータを取得中...');

        try {
            // 開発環境ではダミーデータを返す
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return GoogleSheetsAPI.getDummyRankings();
            }

            // 実際のGoogle Sheets APIを使用する場合
            const instance = new GoogleSheetsAPI();
            const response = await fetch(`${instance.WEB_APP_URL}?action=getRankings`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            console.log('ランキングデータを取得しました:', data.rankings);
            return data.rankings || [];

        } catch (error) {
            console.error('ランキングデータの取得に失敗:', error);
            // エラー時はダミーデータを返す
            return GoogleSheetsAPI.getDummyRankings();
        }
    }

    /**
     * スコアを送信
     * @param {string} name - プレイヤー名
     * @param {number} score - スコア
     * @param {string} comment - コメント
     * @returns {Promise<boolean>} 送信成功かどうか
     */
    static async submitScore(name, score, comment) {
        console.log('スコアを送信中...', { name, score, comment });

        try {
            // 開発環境では成功をシミュレート
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                return GoogleSheetsAPI.simulateSubmitScore(name, score, comment);
            }

            // 実際のGoogle Sheets APIを使用する場合
            const instance = new GoogleSheetsAPI();
            const response = await fetch(instance.WEB_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'submitScore',
                    name: name,
                    score: score,
                    comment: comment,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            console.log('スコアの送信が完了しました');
            return true;

        } catch (error) {
            console.error('スコアの送信に失敗:', error);
            throw error;
        }
    }

    /**
     * ダミーランキングデータを生成（開発用）
     * @returns {Array} ダミーランキングデータ
     */
    static getDummyRankings() {
        console.log('ダミーランキングデータを生成');

        const dummyData = [
            {
                name: '田中太郎',
                score: 25,
                comment: '500アカウント突破おめでとうございます！頑張りました！'
            },
            {
                name: '佐藤花子',
                score: 22,
                comment: 'みんなでお祝いしましょう！素晴らしい成果ですね。'
            },
            {
                name: '山田次郎',
                score: 20,
                comment: '500アカウント達成、本当にすごいです！'
            },
            {
                name: '鈴木美咲',
                score: 18,
                comment: 'チーム一丸となって達成した成果ですね！'
            },
            {
                name: '高橋健太',
                score: 15,
                comment: '500アカウント突破、おめでとうございます！'
            },
            {
                name: '伊藤さくら',
                score: 12,
                comment: 'みんなの努力の結果ですね。素晴らしい！'
            },
            {
                name: '渡辺大輔',
                score: 10,
                comment: 'お疲れさまでした！記念すべき瞬間です。'
            },
            {
                name: '中村あき',
                score: 8,
                comment: '500アカウント達成、本当にお疲れさまでした！'
            }
        ];

        // スコア順にソート
        return dummyData.sort((a, b) => b.score - a.score);
    }

    /**
     * スコア送信をシミュレート（開発用）
     * @param {string} name - プレイヤー名
     * @param {number} score - スコア
     * @param {string} comment - コメント
     * @returns {Promise<boolean>} 常にtrueを返す
     */
    static async simulateSubmitScore(name, score, comment) {
        console.log('スコア送信をシミュレート:', { name, score, comment });

        // ローカルストレージに保存（開発用）
        try {
            const existingData = JSON.parse(localStorage.getItem('gameRankings') || '[]');
            existingData.push({
                name: name,
                score: score,
                comment: comment,
                timestamp: new Date().toISOString()
            });

            // スコア順にソート（上位20件のみ保持）
            existingData.sort((a, b) => b.score - a.score);
            const topRankings = existingData.slice(0, 20);

            localStorage.setItem('gameRankings', JSON.stringify(topRankings));

            console.log('ローカルストレージにスコアを保存しました');
        } catch (error) {
            console.error('ローカルストレージへの保存に失敗:', error);
        }

        // 送信成功をシミュレート（1秒の遅延）
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 1000);
        });
    }

    /**
     * ローカルストレージからランキングを取得（開発用）
     * @returns {Array} ローカルランキングデータ
     */
    static getLocalRankings() {
        try {
            const localData = JSON.parse(localStorage.getItem('gameRankings') || '[]');
            if (localData.length > 0) {
                console.log('ローカルストレージからランキングを取得:', localData);
                return localData;
            }
        } catch (error) {
            console.error('ローカルストレージからの読み込みに失敗:', error);
        }

        // ローカルデータがない場合はダミーデータを返す
        return GoogleSheetsAPI.getDummyRankings();
    }
}

/**
 * Google Apps Script側のコード例
 * 以下のコードをGoogle Apps Scriptに配置してWeb Appとして公開してください
 */

/*
function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getRankings') {
    return getRankings();
  }

  return ContentService
    .createTextOutput(JSON.stringify({error: 'Invalid action'}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'submitScore') {
      return submitScore(data.name, data.score, data.comment, data.timestamp);
    }

    return ContentService
      .createTextOutput(JSON.stringify({error: 'Invalid action'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getRankings() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rankings');
    const data = sheet.getDataRange().getValues();

    // ヘッダー行をスキップ
    const rankings = data.slice(1).map(row => ({
      name: row[0],
      score: row[1],
      comment: row[2]
    }));

    // スコア順にソート
    rankings.sort((a, b) => b.score - a.score);

    return ContentService
      .createTextOutput(JSON.stringify({rankings: rankings}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function submitScore(name, score, comment, timestamp) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('rankings');
    sheet.appendRow([name, score, comment, timestamp]);

    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
