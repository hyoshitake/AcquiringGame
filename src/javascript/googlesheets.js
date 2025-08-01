/**
 * Google Sheets API連携
 * ランキングデータの取得と送信を担当
 */

class GoogleSheetsAPI {
    constructor() {
        // Web App URL（Google Apps Scriptで作成）
        this.WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxXfdSyTq2b5qRIISonupV-xgHG9c-CiYCshcHbnTnzIj6LWX0Pt4aBuEgHKhr6lBD1_A/exec'; // Google Apps ScriptのWeb App URLを設定
    }

    /**
     * ランキングデータを取得
     * @returns {Promise<Array>} ランキングデータの配列
     */
    static async getRankings() {
        console.log('ランキングデータを取得中...');

        try {
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
            // 実際のGoogle Sheets APIを使用する場合
            const instance = new GoogleSheetsAPI();
            const response = await fetch(instance.WEB_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
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
