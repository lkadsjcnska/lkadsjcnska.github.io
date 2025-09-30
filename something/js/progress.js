// 进度管理通用功能
class ProgressManager {
    constructor() {
        this.progress = this.loadProgress();
    }
    
    // 加载进度
    loadProgress() {
        const saved = localStorage.getItem('keyboardTrainingProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        
        return {
            maxSpeed: 0,
            avgAccuracy: 0,
            completedLevels: [],
            levelScores: {}
        };
    }
    
    // 保存进度
    saveProgress() {
        localStorage.setItem('keyboardTrainingProgress', JSON.stringify(this.progress));
    }
    
    // 更新关卡完成状态
    completeLevel(level, score) {
        if (!this.progress.completedLevels.includes(level)) {
            this.progress.completedLevels.push(level);
            this.progress.completedLevels.sort((a, b) => a - b);
        }
        
        // 更新关卡分数
        this.progress.levelScores[level] = score;
        
        // 更新最高速度
        if (score.speed > this.progress.maxSpeed) {
            this.progress.maxSpeed = score.speed;
        }
        
        // 重新计算平均准确率
        this.calculateAverageAccuracy();
        
        this.saveProgress();
    }
    
    // 计算平均准确率
    calculateAverageAccuracy() {
        const levels = Object.keys(this.progress.levelScores);
        if (levels.length === 0) {
            this.progress.avgAccuracy = 0;
            return;
        }
        
        const totalAccuracy = levels.reduce((sum, level) => {
            return sum + this.progress.levelScores[level].accuracy;
        }, 0);
        
        this.progress.avgAccuracy = Math.round(totalAccuracy / levels.length);
    }
    
    // 获取关卡状态
    getLevelStatus(level) {
        if (this.progress.completedLevels.includes(level)) {
            return 'completed';
        } else if (level === 1 || this.progress.completedLevels.includes(level - 1)) {
            return 'unlocked';
        } else {
            return 'locked';
        }
    }
    
    // 重置所有进度
    resetProgress() {
        this.progress = {
            maxSpeed: 0,
            avgAccuracy: 0,
            completedLevels: [],
            levelScores: {}
        };
        this.saveProgress();
    }
}

// 键盘训练关卡功能
class KeyboardTraining {
    constructor(level) {
        this.level = level;
        this.progressManager = new ProgressManager();
        this.currentText = '';
        this.userInput = '';
        this.startTime = null;
        this.endTime = null;
        this.errors = 0;
        this.isCompleted = false;
        
        this.initialize();
    }
    
    initialize() {
        this.loadTextForLevel();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    // 根据关卡加载文本
    loadTextForLevel() {
        const texts = {
            1: "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            2: "the quick brown fox jumps over the lazy dog 1234567890",
            3: "Hello World! Programming @ 2024. #Code (123) abc-DEF_456",
            4: "组合键练习",
            5: "系统快捷键练习"
        };
        
        this.currentText = texts[this.level] || texts[1];
    }
    
    setupEventListeners() {
        const inputElement = document.getElementById('typing-input');
        const restartBtn = document.getElementById('restart-btn');
        
        if (inputElement) {
            inputElement.addEventListener('input', (e) => {
                this.handleInput(e.target.value);
            });
            
            inputElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && this.isCompleted) {
                    this.nextLevel();
                }
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restart();
            });
        }
        
        // 开始计时（在第一次输入时真正开始）
        this.startTime = new Date();
    }
    
    handleInput(input) {
        this.userInput = input;
        
        // 如果是第一次输入，开始计时
        if (input.length === 1 && !this.startTime) {
            this.startTime = new Date();
        }
        
        this.updateDisplay();
        this.checkCompletion();
    }
    
    updateDisplay() {
        const textDisplay = document.getElementById('text-display');
        const statsElement = document.getElementById('typing-stats');
        
        if (!textDisplay) return;
        
        let displayHTML = '';
        for (let i = 0; i < this.currentText.length; i++) {
            let charClass = '';
            
            if (i < this.userInput.length) {
                if (this.userInput[i] === this.currentText[i]) {
                    charClass = 'correct';
                } else {
                    charClass = 'incorrect';
                }
            } else if (i === this.userInput.length) {
                charClass = 'current-char';
            }
            
            displayHTML += `<span class="${charClass}">${this.currentText[i]}</span>`;
        }
        
        textDisplay.innerHTML = displayHTML;
        
        // 更新统计信息
        if (statsElement) {
            const stats = this.calculateStats();
            const progress = this.calculateProgress();
            statsElement.innerHTML = `
                <div>速度: ${stats.speed} CPM</div>
                <div>准确率: ${stats.accuracy}%</div>
                <div>进度: ${progress}%</div>
            `;
        }
    }
    
    calculateStats() {
        if (!this.startTime) return { speed: 0, accuracy: 0 };
        
        const currentTime = new Date();
        const timeElapsed = (currentTime - this.startTime) / 1000 / 60; // 转换为分钟
        
        const charsTyped = this.userInput.length;
        const correctChars = Array.from(this.userInput).reduce((count, char, index) => {
            return count + (char === this.currentText[index] ? 1 : 0);
        }, 0);
        
        const speed = Math.round(charsTyped / timeElapsed);
        const accuracy = charsTyped > 0 ? Math.round((correctChars / charsTyped) * 100) : 0;
        
        return { speed, accuracy };
    }
    
    calculateProgress() {
        return this.currentText.length > 0 ? Math.round((this.userInput.length / this.currentText.length) * 100) : 0;
    }
    
    checkCompletion() {
        if (this.userInput === this.currentText) {
            this.endTime = new Date();
            this.isCompleted = true;
            this.showCompletionScreen();
        }
    }
    
    showCompletionScreen() {
        const stats = this.calculateStats();
        const completionScreen = document.getElementById('completion-screen');
        const inputElement = document.getElementById('typing-input');
        
        if (completionScreen) {
            completionScreen.style.display = 'block';
            completionScreen.innerHTML = `
                <h2>恭喜！关卡 ${this.level} 完成</h2>
                <div class="stats">
                    <div>速度: ${stats.speed} CPM</div>
                    <div>准确率: ${stats.accuracy}%</div>
                    <div>用时: ${Math.round((this.endTime - this.startTime) / 1000)} 秒</div>
                </div>
                <button id="completion-restart-btn" class="btn">重新开始</button>
                <button id="next-level-btn" class="btn">下一关卡</button>
            `;
            
            document.getElementById('completion-restart-btn').addEventListener('click', () => {
                this.restart();
            });
            
            document.getElementById('next-level-btn').addEventListener('click', () => {
                this.nextLevel();
            });
        }
        
        if (inputElement) {
            inputElement.disabled = true;
        }
        
        // 保存进度
        this.progressManager.completeLevel(this.level, {
            speed: stats.speed,
            accuracy: stats.accuracy,
            time: Math.round((this.endTime - this.startTime) / 1000)
        });
    }
    
    restart() {
        this.userInput = '';
        this.startTime = new Date();
        this.endTime = null;
        this.errors = 0;
        this.isCompleted = false;
        
        const inputElement = document.getElementById('typing-input');
        const completionScreen = document.getElementById('completion-screen');
        
        if (inputElement) {
            inputElement.value = '';
            inputElement.disabled = false;
            inputElement.focus();
        }
        
        if (completionScreen) {
            completionScreen.style.display = 'none';
        }
        
        this.updateDisplay();
    }
    
    nextLevel() {
        const nextLevel = this.level + 1;
        if (nextLevel <= 5) {
            window.location.href = `keyboard_level${nextLevel}.html`;
        } else {
            window.location.href = 'keyboard_training.html';
        }
    }
}

// 全局进度管理器实例
const progressManager = new ProgressManager();

// 初始化键盘训练函数
function initKeyboardTraining(level) {
    return new KeyboardTraining(level);
}

// 确保函数在全局作用域可用
window.initKeyboardTraining = initKeyboardTraining;
window.KeyboardTraining = KeyboardTraining;
window.ProgressManager = ProgressManager;

console.log('Progress.js 加载完成');
