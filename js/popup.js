// 诺丁鸭电子宠物 - 主控制器
document.addEventListener('DOMContentLoaded', function() {
    // 初始化诺丁鸭角色
    window.duckCharacter = new DuckCharacter();
    
    // 初始化AI聊天
    window.aiChat = new AIChat();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 启动时间更新
    startTimeUpdater();
    
    // 启动每日提示更新
    startDailyTipsUpdater();
    
    // 显示初始化完成消息
    console.log('诺丁鸭电子宠物已启动！');
});

// 绑定事件监听器
function bindEventListeners() {
    // 喂食按钮
    const feedBtn = document.getElementById('feed-btn');
    if (feedBtn) {
        feedBtn.addEventListener('click', handleFeed);
    }
    
    // 玩耍按钮
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.addEventListener('click', handlePlay);
    }
    
    // 敲木鱼按钮
    const muyuBtn = document.getElementById('muyu-btn');
    if (muyuBtn) {
        muyuBtn.addEventListener('click', handleMuyu);
    }
    
    // 诺丁鸭点击事件
    const duckImage = document.getElementById('duck-image');
    if (duckImage) {
        duckImage.addEventListener('click', handleDuckClick);
    }
    
    // 双击事件 - 特殊功能
    if (duckImage) {
        duckImage.addEventListener('dblclick', handleDuckDoubleClick);
    }
}

// 处理喂食
function handleFeed() {
    const result = window.duckCharacter.feed();
    showActionResult(result);
    
    // 添加音效（如果有的话）
    playSound('feed');
}

// 处理玩耍
function handlePlay() {
    const result = window.duckCharacter.play();
    showActionResult(result);
    
    // 添加音效
    playSound('play');
}

// 处理敲木鱼
function handleMuyu() {
    const result = window.duckCharacter.strikeMuyu();
    showActionResult(result);
    
    // 添加音效
    playSound('muyu');
    
    // 显示功德特效
    showMeritEffect();
}

// 处理诺丁鸭点击
function handleDuckClick() {
    const status = window.duckCharacter.getStatus();
    
    // 根据当前状态给出不同反应
    let response = '';
    
    if (status.satiety < 30) {
        response = '我好饿啊～可以给我吃点东西吗？';
    } else if (status.energy < 20) {
        response = '我有点累了，想休息一下...';
    } else if (status.mood < 50) {
        response = '今天有点不开心呢...';
    } else {
        const responses = [
            '嘻嘻～痒痒！',
            '嘿嘿，你好！',
            '今天天气真好呢！',
            '想和我玩吗？',
            '我在这里呢！'
        ];
        response = responses[Math.floor(Math.random() * responses.length)];
    }
    
    showTemporaryMessage(response);
    
    // 调用智能推荐系统：根据最低值推荐相应动作
    window.duckCharacter.suggestActionsOnClick();
}

// 处理诺丁鸭双击
function handleDuckDoubleClick() {
    const status = window.duckCharacter.getStatus();
    
    // 双击特殊功能：根据当前状态给予特殊照顾
    if (status.satiety < 50) {
        const result = window.duckCharacter.feed();
        showActionResult(result);
        showTemporaryMessage('哇！谢谢你的照顾！我感觉好多了！');
    } else if (status.energy < 50) {
        // 恢复一些能量
        window.duckCharacter.energy = Math.min(100, window.duckCharacter.energy + 30);
        window.duckCharacter.saveState();
        window.duckCharacter.updateDisplay();
        showTemporaryMessage('谢谢你！我感觉充满活力了！');
    } else {
        // 随机给予奖励
        const rewards = [
            { type: 'exp', amount: 20, message: '获得大量经验值！' },
            { type: 'merit', amount: 3, message: '功德+3！' },
            { type: 'mood', amount: 25, message: '心情变得超级好！' }
        ];
        
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        
        switch (reward.type) {
            case 'exp':
                window.duckCharacter.addExp(reward.amount);
                break;
            case 'merit':
                window.duckCharacter.meritPoints += reward.amount;
                break;
            case 'mood':
                window.duckCharacter.mood = Math.min(100, window.duckCharacter.mood + reward.amount);
                break;
        }
        
        window.duckCharacter.saveState();
        window.duckCharacter.updateDisplay();
        showTemporaryMessage(reward.message);
    }
}

// 显示操作结果
function showActionResult(result) {
    // 创建临时消息元素
    const message = document.createElement('div');
    message.className = 'action-result';
    message.textContent = result.message;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${result.success ? '#48bb78' : '#f56565'};
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 12px;
        z-index: 10000;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    // 3秒后移除
    setTimeout(() => {
        message.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 300);
    }, 3000);
}

// 显示临时消息
function showTemporaryMessage(text) {
    const duckStatus = document.getElementById('duck-status');
    if (!duckStatus) return;
    
    const originalText = duckStatus.textContent;
    const originalBg = duckStatus.style.background;
    
    duckStatus.textContent = text;
    duckStatus.style.background = '#805ad5';
    
    setTimeout(() => {
        duckStatus.textContent = originalText;
        duckStatus.style.background = originalBg;
    }, 2000);
}

// 显示功德特效
function showMeritEffect() {
    const duckWrapper = document.querySelector('.duck-wrapper');
    if (!duckWrapper) return;
    
    // 创建功德特效
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const effect = document.createElement('div');
            effect.innerHTML = '🪷';
            effect.style.cssText = `
                position: absolute;
                font-size: 20px;
                pointer-events: none;
                z-index: 1000;
                animation: floatUp 2s ease forwards;
            `;
            
            const rect = duckWrapper.getBoundingClientRect();
            effect.style.left = (rect.left + Math.random() * rect.width) + 'px';
            effect.style.top = (rect.top + Math.random() * rect.height) + 'px';
            
            document.body.appendChild(effect);
            
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
            }, 2000);
        }, i * 200);
    }
}

// 播放音效
function playSound(type) {
    // 调用诺丁鸭角色的音效系统
    if (window.duckCharacter && window.duckCharacter.playSound) {
        window.duckCharacter.playSound(type);
    }
}

// 启动时间更新器
function startTimeUpdater() {
    function updateTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            timeElement.textContent = timeString;
        }
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// 启动每日提示更新器
function startDailyTipsUpdater() {
    const tips = [
        '每天记得照顾诺丁鸭哦！',
        '敲木鱼可以积功德呢～',
        '和诺丁鸭聊天能让心情变好！',
        '保持诺丁鸭的好心情很重要！',
        '记得让诺丁鸭吃饱饱！',
        '诺丁鸭也需要充足的休息！',
        '多和诺丁鸭玩耍，它会更开心！',
        '功德积累需要持之以恒！'
    ];
    
    function updateTip() {
        const tipElement = document.getElementById('daily-tip');
        if (tipElement) {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            tipElement.textContent = randomTip;
        }
    }
    
    updateTip();
    setInterval(updateTip, 30000); // 每30秒更新一次
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-100px) scale(1.5);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: 0.5;
        }
    }
`;
document.head.appendChild(style);

// 清除按钮高亮效果
function clearButtonHighlights() {
    const buttons = document.querySelectorAll('.action-btn');
    buttons.forEach(btn => {
        btn.classList.remove('suggested-action');
    });
}

// 导出主要函数供外部调用
window.NottinghamDuckExtension = {
    getDuckStatus: () => window.duckCharacter.getStatus(),
    feed: handleFeed,
    play: handlePlay,
    strikeMuyu: handleMuyu,
    resetDuck: () => window.duckCharacter.reset(),
    clearChat: () => window.aiChat.clearChat()
};