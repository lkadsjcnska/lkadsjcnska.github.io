// 键盘训练主页面功能
document.addEventListener('DOMContentLoaded', function() {
    // 加载用户进度
    loadUserProgress();
    
    // 更新关卡状态
    updateLevelStatus();
    
    // 关卡卡片点击事件
    const levelCards = document.querySelectorAll('.level-card');
    levelCards.forEach(card => {
        card.addEventListener('click', function() {
            const level = this.getAttribute('data-level');
            const progress = getUserProgress();
            
            // 检查是否已解锁
            if (level > 1 && !progress.completedLevels.includes(parseInt(level) - 1)) {
                alert('请先完成前一关卡！');
                return;
            }
            
            // 如果已解锁，跳转到对应关卡
            if (this.querySelector('a')) {
                window.location.href = this.querySelector('a').href;
            }
        });
    });
});

// 加载用户进度
function loadUserProgress() {
    const progress = getUserProgress();
    
    // 更新统计信息
    document.getElementById('max-speed').textContent = progress.maxSpeed;
    document.getElementById('avg-accuracy').textContent = progress.avgAccuracy;
    document.getElementById('completed-levels').textContent = progress.completedLevels.length;
}

// 更新关卡状态
function updateLevelStatus() {
    const progress = getUserProgress();
    const levelCards = document.querySelectorAll('.level-card');
    
    levelCards.forEach(card => {
        const level = parseInt(card.getAttribute('data-level'));
        const progressEl = card.querySelector('.progress');
        const link = card.querySelector('a');
        
        if (progress.completedLevels.includes(level)) {
            // 已完成
            progressEl.textContent = '已完成';
            progressEl.style.color = '#27ae60';
        } else if (level === 1 || progress.completedLevels.includes(level - 1)) {
            // 已解锁
            progressEl.textContent = '未开始';
            progressEl.style.color = '#3498db';
            
            // 确保有链接
            if (!link) {
                const btn = document.createElement('a');
                btn.href = `keyboard_level${level}.html`;
                btn.className = 'btn';
                btn.textContent = '开始';
                card.appendChild(btn);
            }
        } else {
            // 锁定
            progressEl.textContent = '锁定中';
            progressEl.style.color = '#95a5a6';
            
            // 移除链接
            if (link) {
                link.remove();
            }
        }
    });
}

// 获取用户进度
function getUserProgress() {
    const saved = localStorage.getItem('keyboardTrainingProgress');
    if (saved) {
        return JSON.parse(saved);
    }
    
    // 默认进度
    return {
        maxSpeed: 0,
        avgAccuracy: 0,
        completedLevels: [],
        levelScores: {}
    };
}

// 保存用户进度
function saveUserProgress(progress) {
    localStorage.setItem('keyboardTrainingProgress', JSON.stringify(progress));
}
