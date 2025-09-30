// 扩展 KeyboardTraining 类以支持新关卡
KeyboardTraining.prototype.loadTextForLevel = function() {
    const texts = {
        1: "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        2: this.generateRandomSequence(40, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
        3: this.generateRandomSequence(45, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`'),
        4: "组合键练习", // 关卡4使用特殊实现
        5: "系统快捷键练习" // 关卡5使用特殊实现
    };
    
    this.currentText = texts[this.level] || texts[1];
};

KeyboardTraining.prototype.generateRandomSequence = function(length, chars) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
        if ((i + 1) % 5 === 0 && i < length - 1) {
            result += ' ';
        }
    }
    return result;
};
window.initKeyboardTraining = initKeyboardTraining;
window.ProgressManager = ProgressManager;
