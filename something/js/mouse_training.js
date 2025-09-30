// 鼠标训练功能
document.addEventListener('DOMContentLoaded', function() {
    // 统计变量
    let clickCount = 0;
    let doubleClickCount = 0;
    let rightClickCount = 0;
    let dragCount = 0;
    let clickTargets = 0;
    let dragTargets = 0;

    // DOM 元素
    const clickCountEl = document.getElementById('click-count');
    const doubleClickCountEl = document.getElementById('double-click-count');
    const rightClickCountEl = document.getElementById('right-click-count');
    const dragCountEl = document.getElementById('drag-count');
    const clickTargetsEl = document.getElementById('click-targets');
    const dragTargetsEl = document.getElementById('drag-targets');
    const clickTargetEl = document.getElementById('click-target');
    const dragItemEl = document.getElementById('drag-item');
    const dropzoneEl = document.querySelector('.dropzone');
    const resetBtn = document.getElementById('reset-btn');

    // 初始化
    loadProgress();
    updateUI();

    // 单击练习
    clickTargetEl.addEventListener('click', function(e) {
        e.stopPropagation();
        clickCount++;
        clickTargets++;
        updateUI();
        
        // 移动目标位置
        moveClickTarget();
        
        // 检查是否完成练习
        if (clickTargets >= 10) {
            clickTargetEl.style.display = 'none';
            alert('单击练习完成！');
        }
    });

    // 双击检测
    let clickTimer = null;
    clickTargetEl.addEventListener('click', function(e) {
        if (clickTimer === null) {
            clickTimer = setTimeout(function() {
                clickTimer = null;
            }, 500);
        } else {
            clearTimeout(clickTimer);
            clickTimer = null;
            doubleClickCount++;
            updateUI();
        }
    });

    // 右击检测
    clickTargetEl.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        rightClickCount++;
        updateUI();
        return false;
    });

    // 拖动功能
    let isDragging = false;
    let dragStartX, dragStartY;

    dragItemEl.addEventListener('mousedown', function(e) {
        isDragging = true;
        dragStartX = e.clientX - dragItemEl.offsetLeft;
        dragStartY = e.clientY - dragItemEl.offsetTop;
        dragItemEl.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const x = e.clientX - dragStartX;
        const y = e.clientY - dragStartY;
        
        dragItemEl.style.left = x + 'px';
        dragItemEl.style.top = y + 'px';
        dragItemEl.style.position = 'absolute';
    });

    document.addEventListener('mouseup', function() {
        if (!isDragging) return;
        
        isDragging = false;
        dragItemEl.style.cursor = 'grab';
        dragCount++;
        
        // 检查是否拖放到目标区域
        const dragRect = dragItemEl.getBoundingClientRect();
        const dropRect = dropzoneEl.getBoundingClientRect();
        
        if (dragRect.left >= dropRect.left && 
            dragRect.right <= dropRect.right &&
            dragRect.top >= dropRect.top && 
            dragRect.bottom <= dropRect.bottom) {
            dragTargets++;
            updateUI();
            
            if (dragTargets >= 5) {
                alert('拖动练习完成！');
                resetDragItem();
            } else {
                resetDragItem();
            }
        }
        
        updateUI();
    });

    // 重置拖动项目位置
    function resetDragItem() {
        dragItemEl.style.position = 'static';
        dragItemEl.style.left = 'auto';
        dragItemEl.style.top = 'auto';
    }

    // 移动单击目标
    function moveClickTarget() {
        const container = document.querySelector('.training-area');
        const maxX = container.clientWidth - 100;
        const maxY = container.clientHeight - 100;
        
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        clickTargetEl.style.position = 'absolute';
        clickTargetEl.style.left = randomX + 'px';
        clickTargetEl.style.top = randomY + 'px';
        
        // 随机颜色
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        clickTargetEl.style.background = randomColor;
    }

    // 更新UI
    function updateUI() {
        clickCountEl.textContent = clickCount;
        doubleClickCountEl.textContent = doubleClickCount;
        rightClickCountEl.textContent = rightClickCount;
        dragCountEl.textContent = dragCount;
        clickTargetsEl.textContent = `${clickTargets}/10`;
        dragTargetsEl.textContent = `${dragTargets}/5`;
        
        saveProgress();
    }

    // 重置按钮
    resetBtn.addEventListener('click', function() {
        clickCount = 0;
        doubleClickCount = 0;
        rightClickCount = 0;
        dragCount = 0;
        clickTargets = 0;
        dragTargets = 0;
        
        clickTargetEl.style.display = 'block';
        resetDragItem();
        moveClickTarget();
        updateUI();
    });

    // 保存进度到本地存储
    function saveProgress() {
        const progress = {
            clickCount,
            doubleClickCount,
            rightClickCount,
            dragCount,
            clickTargets,
            dragTargets
        };
        localStorage.setItem('mouseTrainingProgress', JSON.stringify(progress));
    }

    // 从本地存储加载进度
    function loadProgress() {
        const saved = localStorage.getItem('mouseTrainingProgress');
        if (saved) {
            const progress = JSON.parse(saved);
            clickCount = progress.clickCount || 0;
            doubleClickCount = progress.doubleClickCount || 0;
            rightClickCount = progress.rightClickCount || 0;
            dragCount = progress.dragCount || 0;
            clickTargets = progress.clickTargets || 0;
            dragTargets = progress.dragTargets || 0;
        }
    }

    // 初始化单击目标位置
    moveClickTarget();
});
