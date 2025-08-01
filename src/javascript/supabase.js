/**
 * Supabase API連携
 * ランキングデータの取得と送信を担当
 */

class SupabaseAPI {
    constructor() {
        // Supabase設定
        // 注意: 実際の使用時は以下を設定してください
        // 1. SUPABASE_URLは https://[プロジェクトID].supabase.co の形式
        // 2. SUPABASE_ANON_KEYはSupabaseプロジェクトのSettings > API > anon publicから取得
        this.SUPABASE_URL = 'https://omyqjwnlnmqjeuwxqbva.supabase.co';
        this.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teXFqd25sbm1xamV1d3hxYnZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA0NTU3OSwiZXhwIjoyMDY5NjIxNTc5fQ.HmsYtGS_YA09-kD-H7GwGnX_TNQEJhXPxljhNQUQO50'; // 実際のキーに置き換えてください
        this.TABLE_NAME = 'scores';

        // リクエストヘッダー
        this.headers = {
            'apikey': this.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        };
    }

    /**
     * ランキングデータを取得
     * @returns {Promise<Array>} ランキングデータの配列
     */
    static async getRankings() {
        console.log('Supabaseからランキングデータを取得中...');

        try {
            const instance = new SupabaseAPI();
            const url = `${instance.SUPABASE_URL}/rest/v1/${instance.TABLE_NAME}?select=name,score,comment&order=score.desc&limit=20`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': instance.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${instance.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log('Supabaseからランキングデータを取得しました:', data);
            return data || [];

        } catch (error) {
            console.error('Supabaseランキングデータの取得に失敗:', error);

            // エラー時はダミーデータを返す
            return SupabaseAPI.getDummyRankings();
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
        console.log('Supabaseにスコアを送信中...', { name, score, comment });

        try {
            const instance = new SupabaseAPI();
            const url = `${instance.SUPABASE_URL}/rest/v1/${instance.TABLE_NAME}`;

            const payload = {
                name: name,
                score: score,
                comment: comment
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: instance.headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            console.log('Supabaseへのスコア送信が完了しました');
            return true;

        } catch (error) {
            console.error('Supabaseスコアの送信に失敗:', error);
            throw error;
        }
    }

    /**
     * ダミーランキングデータを生成（開発・エラー時用）
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
     * データベース接続テスト
     * @returns {Promise<boolean>} 接続成功かどうか
     */
    static async testConnection() {
        console.log('Supabase接続テストを実行中...');

        try {
            const instance = new SupabaseAPI();
            const url = `${instance.SUPABASE_URL}/rest/v1/${instance.TABLE_NAME}?select=count&limit=1`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': instance.SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${instance.SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                console.log('Supabase接続テスト成功');
                return true;
            } else {
                console.error('Supabase接続テスト失敗:', response.status);
                return false;
            }

        } catch (error) {
            console.error('Supabase接続テストエラー:', error);
            return false;
        }
    }
}

// 開発環境用：接続テストを実行
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // 開発環境では接続テストを実行
    document.addEventListener('DOMContentLoaded', () => {
        SupabaseAPI.testConnection();
    });
}
