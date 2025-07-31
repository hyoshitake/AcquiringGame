/**
 * メインのJavaScriptファイル
 * 画面遷移とイベント管理を担当
 */

// DOM要素の取得
const screens = {
    start: document.getElementById('start-screen'),
    ranking: document.getElementById('ranking-screen'),
    rules: document.getElementById('rules-screen'),
    game: document.getElementById('game-screen'),
    completion: document.getElementById('completion-screen')
};

const buttons = {
    startGame: document.getElementById('start-game-btn'),
    ranking: document.getElementById('ranking-btn'),
    rules: document.getElementById('rules-btn'),
    closeRanking: document.getElementById('close-ranking-btn'),
    closeRules: document.getElementById('close-rules-btn'),
    playAgain: document.getElementById('play-again-btn'),
    backToTitle: document.getElementById('back-to-title-btn'),
    submitScore: document.getElementById('submit-score-btn')
};

// グローバル変数
let currentScreen = 'start';
let gameInstance = null;

/**
 * アプリケーションの初期化
 */
function initializeApp() {
    console.log('アプリケーションを初期化中...');

    // イベントリスナーの設定
    setupEventListeners();

    // カスタムカーソルの初期化
    setupCustomCursor();

    // 初期画面の表示
    showScreen('start');

    console.log('アプリケーションの初期化完了');
}

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    // スタート画面のボタン
    buttons.startGame.addEventListener('click', () => {
        console.log('ゲーム開始ボタンがクリックされました');
        startGame();
    });

    buttons.ranking.addEventListener('click', () => {
        console.log('ランキングボタンがクリックされました');
        showRanking();
    });

    buttons.rules.addEventListener('click', () => {
        console.log('ゲームルールボタンがクリックされました');
        showRules();
    });

    // モーダル画面の閉じるボタン
    buttons.closeRanking.addEventListener('click', () => {
        console.log('ランキングを閉じます');
        showScreen('start');
    });

    buttons.closeRules.addEventListener('click', () => {
        console.log('ゲームルールを閉じます');
        showScreen('start');
    });

    // ゲーム完了画面のボタン
    buttons.playAgain.addEventListener('click', () => {
        console.log('もう1回プレイします');
        startGame();
    });

    buttons.backToTitle.addEventListener('click', () => {
        console.log('タイトルに戻ります');
        showScreen('start');
    });

    buttons.submitScore.addEventListener('click', () => {
        console.log('スコアを送信します');
        submitScore();
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (currentScreen === 'ranking' || currentScreen === 'rules') {
                showScreen('start');
            }
        }
    });
}

/**
 * カスタムカーソルの設定
 */
function setupCustomCursor() {
    const cursor = document.getElementById('custom-cursor');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // デフォルトカーソルを非表示にする
    document.body.style.cursor = 'none';
}

/**
 * 画面切り替え
 * @param {string} screenName - 表示する画面名
 */
function showScreen(screenName) {
    console.log(`画面を切り替え: ${currentScreen} → ${screenName}`);

    // 現在の画面を非表示
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });

    // 指定された画面を表示
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
        currentScreen = screenName;
    } else {
        console.error(`不明な画面名: ${screenName}`);
    }
}

/**
 * ゲーム開始
 */
function startGame() {
    console.log('ゲームを開始します');
    showScreen('game');

    // 既存のゲームインスタンスがあれば破棄
    if (gameInstance) {
        gameInstance.destroy();
    }

    // 新しいゲームインスタンスを作成
    gameInstance = new Game();
    gameInstance.start();
}

/**
 * ランキング表示
 */
async function showRanking() {
    console.log('ランキングを表示します');
    showScreen('ranking');

    const rankingList = document.getElementById('ranking-list');
    rankingList.innerHTML = '<div class="loading">ランキングを読み込み中...</div>';

    try {
        // Google Sheetsからランキングデータを取得
        const rankings = await GoogleSheetsAPI.getRankings();
        displayRankings(rankings);
    } catch (error) {
        console.error('ランキングの取得に失敗しました:', error);
        rankingList.innerHTML = '<div class="loading">ランキングの読み込みに失敗しました</div>';
    }
}

/**
 * ランキングデータの表示
 * @param {Array} rankings - ランキングデータ
 */
function displayRankings(rankings) {
    const rankingList = document.getElementById('ranking-list');

    if (!rankings || rankings.length === 0) {
        rankingList.innerHTML = '<div class="loading">まだランキングデータがありません</div>';
        return;
    }

    const rankingHTML = rankings.map((player, index) => `
        <div class="ranking-item">
            <div class="rank">${index + 1}</div>
            <div class="player-info">
                <div class="player-name">${escapeHtml(player.name || '匿名')}</div>
                <div class="player-comment">${escapeHtml(player.comment || '')}</div>
            </div>
            <div class="player-score">${player.score}点</div>
        </div>
    `).join('');

    rankingList.innerHTML = rankingHTML;
}

/**
 * ゲームルール表示
 */
function showRules() {
    console.log('ゲームルールを表示します');
    showScreen('rules');
}

/**
 * ゲーム完了時の処理
 * @param {Object} gameResult - ゲーム結果
 */
function onGameComplete(gameResult) {
    console.log('ゲーム完了:', gameResult);

    // ゲーム完了画面に結果を表示
    displayGameResult(gameResult);

    // ゲーム完了画面を表示
    showScreen('completion');
}

/**
 * ゲーム結果の表示
 * @param {Object} result - ゲーム結果
 */
function displayGameResult(result) {
    const resultTitle = document.getElementById('game-result-title');
    const finalScore = document.getElementById('final-score');
    const scoreBreakdown = document.getElementById('score-breakdown');

    // 勝敗判定
    const isSuccess = result.kakariteCount >= Math.max(
        result.iverCount,
        result.medicastarCount,
        result.symviewCount,
        result.wakumyCount
    );

    if (isSuccess) {
        resultTitle.textContent = 'ゲームクリア！';
        resultTitle.className = 'success';
        finalScore.textContent = result.kakariteCount;
    } else {
        resultTitle.textContent = 'ゲームオーバー';
        resultTitle.className = 'failure';
        finalScore.textContent = '0';
    }

    // スコア詳細の表示
    scoreBreakdown.innerHTML = `
        <div>Kakarite: ${result.kakariteCount}件</div>
        <div>Iver: ${result.iverCount}件</div>
        <div>Medicastar: ${result.medicastarCount}件</div>
        <div>Symview: ${result.symviewCount}件</div>
        <div>Wakumy: ${result.wakumyCount}件</div>
        <div>本部長クリック: ${result.bossClickCount}回</div>
    `;
}

/**
 * スコア送信
 */
async function submitScore() {
    const playerName = document.getElementById('player-name').value.trim();
    const playerComment = document.getElementById('player-comment').value.trim();
    const finalScoreElement = document.getElementById('final-score');
    const score = parseInt(finalScoreElement.textContent);

    if (!playerName) {
        alert('お名前を入力してください');
        return;
    }

    if (!playerComment) {
        alert('コメントを入力してください');
        return;
    }

    try {
        console.log('スコアを送信中...', { playerName, score, playerComment });

        // Google Sheetsにスコアを送信
        await GoogleSheetsAPI.submitScore(playerName, score, playerComment);

        alert('スコアが正常に登録されました！');

        // フォームをリセット
        document.getElementById('player-name').value = '';
        document.getElementById('player-comment').value = '';

    } catch (error) {
        console.error('スコアの送信に失敗しました:', error);
        alert('スコアの送信に失敗しました。もう一度お試しください。');
    }
}

/**
 * HTMLエスケープ関数
 * @param {string} text - エスケープするテキスト
 * @returns {string} エスケープされたテキスト
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', initializeApp);

// ゲーム完了時のコールバックをグローバルに公開
window.onGameComplete = onGameComplete;
