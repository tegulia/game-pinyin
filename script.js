// 简单的汉字和拼音数据
const characters = [
    { character: '一', pinyin: 'yi', meaning: '数字一' },
    { character: '二', pinyin: 'er', meaning: '数字二' },
    { character: '三', pinyin: 'san', meaning: '数字三' },
    { character: '人', pinyin: 'ren', meaning: '人' },
    { character: '大', pinyin: 'da', meaning: '大的' },
    { character: '小', pinyin: 'xiao', meaning: '小的' },
    { character: '上', pinyin: 'shang', meaning: '上面' },
    { character: '下', pinyin: 'xia', meaning: '下面' },
    { character: '中', pinyin: 'zhong', meaning: '中间' },
    { character: '口', pinyin: 'kou', meaning: '嘴巴' },
    { character: '手', pinyin: 'shou', meaning: '手' },
    { character: '目', pinyin: 'mu', meaning: '眼睛' },
    { character: '耳', pinyin: 'er', meaning: '耳朵' },
    { character: '日', pinyin: 'ri', meaning: '太阳' },
    { character: '月', pinyin: 'yue', meaning: '月亮' },
    { character: '水', pinyin: 'shui', meaning: '水' },
    { character: '火', pinyin: 'huo', meaning: '火' },
    { character: '木', pinyin: 'mu', meaning: '木头' },
    { character: '土', pinyin: 'tu', meaning: '土' },
    { character: '山', pinyin: 'shan', meaning: '山' }
];

// 游戏状态
let gameState = {
    currentCharacter: null,
    score: 0,
    round: 1,
    totalRounds: 10,
    timeLeft: 20,
    timer: null,
    isPlaying: false,
    usedCharacters: []
};

// DOM 元素
const elements = {
    currentCharacter: document.getElementById('current-character'),
    characterHint: document.getElementById('character-hint'),
    pinyinInput: document.getElementById('pinyin-input'),
    submitBtn: document.getElementById('submit-btn'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    scoreDisplay: document.getElementById('score'),
    roundDisplay: document.getElementById('round'),
    timerDisplay: document.getElementById('timer'),
    progressBar: document.getElementById('progress'),
    feedback: document.getElementById('feedback'),
    flowerReward: document.getElementById('flower-reward'),
    finalScore: document.getElementById('final-score')
};

// 语音合成
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    }
}

// 随机选择一个未使用的字符
function getRandomCharacter() {
    const availableCharacters = characters.filter(char =>
        !gameState.usedCharacters.includes(char.character)
    );

    if (availableCharacters.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * availableCharacters.length);
    return availableCharacters[randomIndex];
}

// 开始新回合
function startNewRound() {
    if (gameState.round > gameState.totalRounds) {
        endGame();
        return;
    }

    gameState.currentCharacter = getRandomCharacter();
    if (!gameState.currentCharacter) {
        endGame();
        return;
    }

    gameState.usedCharacters.push(gameState.currentCharacter.character);
    gameState.timeLeft = 20;

    // 更新显示
    elements.currentCharacter.textContent = gameState.currentCharacter.character;
    elements.characterHint.textContent = gameState.currentCharacter.meaning;
    elements.roundDisplay.textContent = gameState.round;
    elements.pinyinInput.value = '';
    elements.feedback.textContent = '';
    elements.feedback.className = 'feedback';

    // 开始倒计时
    startTimer();

    // 朗读汉字
    speak(gameState.currentCharacter.character);

    // 聚焦输入框
    elements.pinyinInput.focus();
}

// 开始倒计时
function startTimer() {
    clearInterval(gameState.timer);
    updateTimerDisplay();

    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        updateTimerDisplay();

        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            timeUp();
        }
    }, 1000);
}

// 更新倒计时显示
function updateTimerDisplay() {
    elements.timerDisplay.textContent = gameState.timeLeft;
    const percentage = (gameState.timeLeft / 20) * 100;
    elements.progressBar.style.width = percentage + '%';

    // 时间快用完时变红
    if (gameState.timeLeft <= 5) {
        elements.progressBar.style.background = 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
    } else {
        elements.progressBar.style.background = 'linear-gradient(90deg, #56ab2f 0%, #a8e063 100%)';
    }
}

// 时间到了
function timeUp() {
    showFeedback(false);
    speak('时间到了');

    setTimeout(() => {
        gameState.round++;
        startNewRound();
    }, 2000);
}

// 检查答案
function checkAnswer() {
    if (!gameState.isPlaying || !gameState.currentCharacter) return;

    const userAnswer = elements.pinyinInput.value.trim().toLowerCase();
    const correctAnswer = gameState.currentCharacter.pinyin;

    clearInterval(gameState.timer);

    if (userAnswer === correctAnswer) {
        gameState.score += 10;
        elements.scoreDisplay.textContent = gameState.score;
        showFeedback(true);
        speak('正确！');

        setTimeout(() => {
            gameState.round++;
            startNewRound();
        }, 1500);
    } else {
        showFeedback(false);
        speak('再试试');

        setTimeout(() => {
            gameState.round++;
            startNewRound();
        }, 2000);
    }
}

// 显示反馈
function showFeedback(isCorrect) {
    if (isCorrect) {
        elements.feedback.textContent = '✓ 正确！';
        elements.feedback.className = 'feedback correct';
    } else {
        elements.feedback.textContent = `✗ 正确答案是: ${gameState.currentCharacter.pinyin}`;
        elements.feedback.className = 'feedback incorrect';
    }
}

// 开始游戏
function startGame() {
    gameState = {
        currentCharacter: null,
        score: 0,
        round: 1,
        totalRounds: 10,
        timeLeft: 20,
        timer: null,
        isPlaying: true,
        usedCharacters: []
    };

    elements.scoreDisplay.textContent = '0';
    elements.startBtn.style.display = 'none';
    elements.restartBtn.style.display = 'none';
    elements.flowerReward.style.display = 'none';

    speak('游戏开始');
    startNewRound();
}

// 结束游戏
function endGame() {
    clearInterval(gameState.timer);
    gameState.isPlaying = false;

    // 显示大红花奖励
    elements.finalScore.textContent = gameState.score;
    elements.flowerReward.style.display = 'flex';

    // 语音播报最终得分
    if (gameState.score === gameState.totalRounds * 10) {
        speak('太棒了！你全部答对了！');
    } else {
        speak(`游戏结束，你的得分是${gameState.score}分`);
    }

    elements.restartBtn.style.display = 'inline-block';
}

// 重新开始游戏
function restartGame() {
    elements.flowerReward.style.display = 'none';
    startGame();
}

// 事件监听器
elements.startBtn.addEventListener('click', startGame);
elements.restartBtn.addEventListener('click', restartGame);
elements.submitBtn.addEventListener('click', checkAnswer);

elements.pinyinInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// 点击大红花奖励区域关闭
elements.flowerReward.addEventListener('click', () => {
    elements.flowerReward.style.display = 'none';
});

// 页面加载完成后聚焦开始按钮
window.addEventListener('load', () => {
    elements.startBtn.focus();
});