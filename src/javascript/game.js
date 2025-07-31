/**
 * ゲームエンジン
 * ゲームロジックとオブジェクト管理を担当
 */

class Game {
    constructor() {
        console.log('ゲームインスタンスを作成');

        // ゲーム設定
        this.config = {
            gameTime: 60, // ゲーム時間（秒）
            spawnInterval: 800, // オブジェクト生成間隔（ミリ秒）
            objectLifetime: 3000, // オブジェクトの生存時間（ミリ秒）
            minSize: 12, // 最小サイズ（px）
            maxSize: 120, // 最大サイズ（px）
            penaltyTime: 3000, // ペナルティ時間（ミリ秒）
            crosssellCursorSize: 64 // クロスセル時のカーソルサイズ
        };

        // ゲーム状態
        this.isPlaying = false;
        this.isPaused = false;
        this.timeLeft = this.config.gameTime;
        this.score = {
            kakariteCount: 0,
            iverCount: 0,
            medicastarCount: 0,
            symviewCount: 0,
            wakumyCount: 0,
            bossClickCount: 0
        };
        this.crosssellUsed = false;
        this.isInPenalty = false;

        // ゲームオブジェクト
        this.gameObjects = [];
        this.gameCanvas = document.getElementById('game-canvas');
        this.penaltyOverlay = document.getElementById('penalty-overlay');
        this.customCursor = document.getElementById('custom-cursor');

        // タイマーとインターバル
        this.gameTimer = null;
        this.spawnTimer = null;
        this.penaltyTimer = null;

        // 商材とボスの定義
        this.products = [
            { name: 'kakarite', image: 'src/assets/logo_kakarite_symbol_color.png', weight: 0.3 },
            { name: 'iver', image: 'src/assets/logo_iver_symbol_color.png', weight: 0.2 },
            { name: 'medicastar', image: 'src/assets/logo_medicastar_symbol_color.png', weight: 0.2 },
            { name: 'symview', image: 'src/assets/logo_symview_symbol_color.png', weight: 0.2 },
            { name: 'wakumy', image: 'src/assets/logo_wakumy_symbol_color.png', weight: 0.1 }
        ];

        this.bosses = [
            { name: 'ebashi', image: 'src/assets/ebashi.png' },
            { name: 'ito', image: 'src/assets/ito.png' },
            { name: 'kezuka', image: 'src/assets/kezuka.png' },
            { name: 'misumi', image: 'src/assets/misumi.png' }
        ];

        // イベントリスナーのバインド
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleRightClick = this.handleRightClick.bind(this);
    }

    /**
     * ゲーム開始
     */
    start() {
        console.log('ゲーム開始');

        this.isPlaying = true;
        this.timeLeft = this.config.gameTime;
        this.resetScore();
        this.crosssellUsed = false;
        this.isInPenalty = false;

        // UIの初期化
        this.updateUI();

        // イベントリスナーの追加
        this.gameCanvas.addEventListener('click', this.boundHandleClick);
        this.gameCanvas.addEventListener('contextmenu', this.boundHandleRightClick);

        // タイマー開始
        this.startGameTimer();
        this.startSpawnTimer();

        console.log('ゲームタイマーとスポーンタイマーを開始');
    }

    /**
     * ゲーム終了
     */
    end() {
        console.log('ゲーム終了');

        this.isPlaying = false;

        // タイマーの停止
        this.stopAllTimers();

        // イベントリスナーの削除
        this.gameCanvas.removeEventListener('click', this.boundHandleClick);
        this.gameCanvas.removeEventListener('contextmenu', this.boundHandleRightClick);

        // すべてのゲームオブジェクトを削除
        this.clearAllObjects();

        // ペナルティ状態をリセット
        this.clearPenalty();

        // カーソルをリセット
        this.resetCursor();

        // ゲーム結果をコールバック
        if (window.onGameComplete) {
            window.onGameComplete(this.score);
        }
    }

    /**
     * ゲーム破棄
     */
    destroy() {
        console.log('ゲームインスタンスを破棄');

        if (this.isPlaying) {
            this.end();
        }

        this.stopAllTimers();
        this.clearAllObjects();
    }

    /**
     * スコアリセット
     */
    resetScore() {
        this.score = {
            kakariteCount: 0,
            iverCount: 0,
            medicastarCount: 0,
            symviewCount: 0,
            wakumyCount: 0,
            bossClickCount: 0
        };
    }

    /**
     * ゲームタイマー開始
     */
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();

            if (this.timeLeft <= 0) {
                this.end();
            }
        }, 1000);
    }

    /**
     * オブジェクトスポーンタイマー開始
     */
    startSpawnTimer() {
        this.spawnTimer = setInterval(() => {
            if (this.isPlaying && !this.isPaused) {
                this.spawnObject();
            }
        }, this.config.spawnInterval);
    }

    /**
     * すべてのタイマーを停止
     */
    stopAllTimers() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }

        if (this.spawnTimer) {
            clearInterval(this.spawnTimer);
            this.spawnTimer = null;
        }

        if (this.penaltyTimer) {
            clearTimeout(this.penaltyTimer);
            this.penaltyTimer = null;
        }
    }

    /**
     * オブジェクト生成
     */
    spawnObject() {
        // 商材かボスかを決定（ボスは10%の確率）
        const isBoss = Math.random() < 0.1;

        let objectData;
        if (isBoss) {
            objectData = this.bosses[Math.floor(Math.random() * this.bosses.length)];
            objectData.type = 'boss';
        } else {
            // 重み付きランダムで商材を選択
            objectData = this.selectWeightedProduct();
            objectData.type = 'product';
        }

        // ランダムな初期位置（画面中央付近）
        const startX = (window.innerWidth * 0.3) + (Math.random() * window.innerWidth * 0.4);
        const startY = (window.innerHeight * 0.3) + (Math.random() * window.innerHeight * 0.4);

        // 終了位置（一点透視図法で外側に向かう）
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const direction = Math.atan2(startY - centerY, startX - centerX);
        const distance = 200; // 移動距離
        const endX = startX + Math.cos(direction) * distance;
        const endY = startY + Math.sin(direction) * distance;

        const gameObject = new GameObject(objectData, startX, startY, endX, endY, this.config);
        this.gameObjects.push(gameObject);

        // オブジェクトをDOMに追加
        this.gameCanvas.appendChild(gameObject.element);

        // アニメーション開始
        gameObject.startAnimation();

        // 生存時間後に削除
        setTimeout(() => {
            this.removeObject(gameObject);
        }, this.config.objectLifetime);
    }

    /**
     * 重み付きランダムで商材を選択
     */
    selectWeightedProduct() {
        const random = Math.random();
        let cumulative = 0;

        for (const product of this.products) {
            cumulative += product.weight;
            if (random <= cumulative) {
                return { ...product };
            }
        }

        // フォールバック
        return { ...this.products[0] };
    }

    /**
     * オブジェクトを削除
     */
    removeObject(gameObject) {
        const index = this.gameObjects.indexOf(gameObject);
        if (index > -1) {
            this.gameObjects.splice(index, 1);
            gameObject.destroy();
        }
    }

    /**
     * すべてのオブジェクトをクリア
     */
    clearAllObjects() {
        this.gameObjects.forEach(obj => obj.destroy());
        this.gameObjects = [];
    }

    /**
     * クリック処理
     */
    handleClick(event) {
        event.preventDefault();

        if (!this.isPlaying || this.isInPenalty) {
            return;
        }

        const clickX = event.clientX;
        const clickY = event.clientY;

        // カーソルサイズを考慮したクリック範囲
        const cursorSize = this.crosssellUsed ? this.config.crosssellCursorSize : 20;
        const clickRadius = cursorSize / 2;

        // 最前面のオブジェクトを検索（z-indexが最も高い）
        let targetObject = null;
        let highestZIndex = -1;

        for (const gameObject of this.gameObjects) {
            if (gameObject.isClickable(clickX, clickY, clickRadius)) {
                const zIndex = parseInt(gameObject.element.style.zIndex) || 0;
                if (zIndex > highestZIndex) {
                    highestZIndex = zIndex;
                    targetObject = gameObject;
                }
            }
        }

        if (targetObject) {
            this.handleObjectClick(targetObject);
        }
    }

    /**
     * 右クリック処理（クロスセル発動）
     */
    handleRightClick(event) {
        event.preventDefault();

        if (!this.isPlaying || this.crosssellUsed || this.isInPenalty) {
            return;
        }

        console.log('クロスセル状態を発動');
        this.crosssellUsed = true;
        this.customCursor.classList.add('crosssell');
        this.updateUI();
    }

    /**
     * オブジェクトクリック処理
     */
    handleObjectClick(gameObject) {
        console.log(`オブジェクトクリック: ${gameObject.data.name}`);

        if (gameObject.data.type === 'product') {
            // 商材の場合、スコア加算
            const productName = gameObject.data.name + 'Count';
            this.score[productName]++;

            // エフェクト表示
            this.showClickEffect(gameObject.element, '+1', '#28a745');

        } else if (gameObject.data.type === 'boss') {
            // ボスの場合、ペナルティ
            this.score.bossClickCount++;
            this.activatePenalty();

            // エフェクト表示
            this.showClickEffect(gameObject.element, 'ペナルティ！', '#dc3545');
        }

        // オブジェクトを削除
        this.removeObject(gameObject);

        // UI更新
        this.updateUI();
    }

    /**
     * ペナルティ発動
     */
    activatePenalty() {
        console.log('ペナルティを発動');

        this.isInPenalty = true;
        this.penaltyOverlay.classList.add('active');

        this.penaltyTimer = setTimeout(() => {
            this.clearPenalty();
        }, this.config.penaltyTime);
    }

    /**
     * ペナルティ解除
     */
    clearPenalty() {
        console.log('ペナルティを解除');

        this.isInPenalty = false;
        this.penaltyOverlay.classList.remove('active');

        if (this.penaltyTimer) {
            clearTimeout(this.penaltyTimer);
            this.penaltyTimer = null;
        }
    }

    /**
     * カーソルリセット
     */
    resetCursor() {
        this.customCursor.classList.remove('crosssell');
    }

    /**
     * クリックエフェクト表示
     */
    showClickEffect(element, text, color) {
        const effect = document.createElement('div');
        effect.textContent = text;
        effect.style.position = 'absolute';
        effect.style.left = element.style.left;
        effect.style.top = element.style.top;
        effect.style.color = color;
        effect.style.fontSize = '20px';
        effect.style.fontWeight = 'bold';
        effect.style.pointerEvents = 'none';
        effect.style.zIndex = '9999';
        effect.style.animation = 'fadeOutUp 1s ease-out forwards';

        this.gameCanvas.appendChild(effect);

        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 1000);
    }

    /**
     * UI更新
     */
    updateUI() {
        // タイマー更新
        const timerDisplay = document.getElementById('timer-display');
        if (timerDisplay) {
            timerDisplay.textContent = Math.max(0, this.timeLeft);
        }

        // スコア更新
        const kakariteCount = document.getElementById('kakarite-count');
        if (kakariteCount) {
            kakariteCount.textContent = this.score.kakariteCount;
        }

        // クロスセル状態更新
        const crosssellStatus = document.getElementById('crosssell-status');
        if (crosssellStatus) {
            if (this.crosssellUsed) {
                crosssellStatus.textContent = 'クロスセル: 使用済み';
                crosssellStatus.className = 'crosssell-status used';
            } else {
                crosssellStatus.textContent = 'クロスセル: 使用可能';
                crosssellStatus.className = 'crosssell-status available';
            }
        }
    }
}

/**
 * ゲームオブジェクトクラス
 */
class GameObject {
    constructor(data, startX, startY, endX, endY, config) {
        this.data = data;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.config = config;

        // DOM要素作成
        this.element = document.createElement('div');
        this.element.className = 'game-object';

        // 画像要素作成
        this.image = document.createElement('img');
        this.image.src = data.image;
        this.image.alt = data.name;
        this.element.appendChild(this.image);

        // 初期スタイル設定
        this.element.style.position = 'absolute';
        this.element.style.left = startX + 'px';
        this.element.style.top = startY + 'px';
        this.element.style.width = config.minSize + 'px';
        this.element.style.height = config.minSize + 'px';
        this.element.style.zIndex = '1';

        this.startTime = Date.now();
    }

    /**
     * アニメーション開始
     */
    startAnimation() {
        const animate = () => {
            if (!this.element.parentNode) {
                return; // 要素が削除されている場合は停止
            }

            const elapsed = Date.now() - this.startTime;
            const progress = Math.min(elapsed / this.config.objectLifetime, 1);

            // 位置の更新
            const currentX = this.startX + (this.endX - this.startX) * progress;
            const currentY = this.startY + (this.endY - this.startY) * progress;

            // サイズの更新（一点透視図法）
            const currentSize = this.config.minSize + (this.config.maxSize - this.config.minSize) * progress;

            // z-indexの更新（手前にあるものほど高い）
            const zIndex = Math.floor(progress * 100);

            this.element.style.left = (currentX - currentSize / 2) + 'px';
            this.element.style.top = (currentY - currentSize / 2) + 'px';
            this.element.style.width = currentSize + 'px';
            this.element.style.height = currentSize + 'px';
            this.element.style.zIndex = zIndex;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * クリック可能かどうかを判定
     */
    isClickable(clickX, clickY, clickRadius) {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // カーソル範囲内にオブジェクトの中心があるかチェック
        const distance = Math.sqrt(
            Math.pow(clickX - centerX, 2) + Math.pow(clickY - centerY, 2)
        );

        return distance <= (clickRadius + Math.min(rect.width, rect.height) / 2);
    }

    /**
     * オブジェクト破棄
     */
    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// CSS アニメーションの追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOutUp {
        0% {
            opacity: 1;
            transform: translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px);
        }
    }
`;
document.head.appendChild(style);
