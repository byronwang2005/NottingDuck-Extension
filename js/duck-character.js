// 诺丁鸭角色管理系统
class DuckCharacter {
    constructor() {
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.meritPoints = 0;
        
        // 状态属性 (0-100)
        this.satiety = 80;      // 饱腹度
        this.mood = 90;        // 心情
        this.energy = 75;      // 能量
        
        // 状态衰减速度 (每小时)
        this.decayRates = {
            satiety: 8,
            mood: 3,
            energy: 6
        };
        
        // 状态图片映射
        this.stateImages = {
            normal: 'imgs/nottingham_duck_normal.png',
            happy: 'imgs/nottingham_duck_happy.png',
            hungry: 'imgs/nottingham_duck_hungry.png',
            sleep: 'imgs/nottingham_duck_sleep.png',
            muyu: 'imgs/nottingham_duck_muyu.png'
        };
        
        this.currentState = 'normal';
        this.lastUpdateTime = Date.now();
        
        this.loadState();
        this.startStatusDecay();
        
        // 初始化音效
        this.initSounds();
        
        // 延迟更新显示，确保DOM完全加载
        setTimeout(() => {
            this.updateDisplay();
        }, 100);
    }
    
    // 初始化音效
    initSounds() {
        this.sounds = {
            feed: new Audio(chrome.runtime.getURL('sounds/feed.mp3')),
            play: new Audio(chrome.runtime.getURL('sounds/play.mp3')),
            muyu: new Audio(chrome.runtime.getURL('sounds/muyu.mp3')),
            click: new Audio(chrome.runtime.getURL('sounds/duck-click.mp3')),
            levelup: new Audio(chrome.runtime.getURL('sounds/levelup.mp3'))
        };
        
        // 设置音效音量
        Object.values(this.sounds).forEach(sound => {
            sound.volume = 0.3; // 设置较低音量
        });
        
        // 添加点击诺丁鸭图片的事件监听器
        this.addClickListener();
    }
    
    // 添加点击诺丁鸭图片的监听器
    addClickListener() {
        const duckImage = document.getElementById('duck-image');
        if (duckImage) {
            duckImage.addEventListener('click', () => {
                this.playSound('click');
                this.animateDuck();
            });
        }
    }
    
    // 播放音效
    playSound(soundName) {
        if (this.sounds && this.sounds[soundName]) {
            try {
                this.sounds[soundName].currentTime = 0; // 重置播放位置
                this.sounds[soundName].play().catch(e => {
                    // 忽略自动播放限制错误
                    console.log('音效播放被阻止:', e.message);
                });
            } catch (e) {
                console.log('音效播放失败:', e.message);
            }
        }
    }
    
    // 更新动态标题
    updateDynamicTitle() {
        const titleElement = document.getElementById('duck-title');
        if (!titleElement) {
            console.log('标题元素未找到');
            return;
        }
        
        let title = '🦆 高贵人士诺丁鸭';
        
        // 根据状态生成动态标题
        if (this.satiety < 30) {
            title = '🦆 诺丁鸭好像很饥饿呢 :<';
        } else if (this.energy < 20) {
            title = '🦆 诺丁鸭看起来很累呢 :(';
        } else if (this.mood < 40) {
            title = '🦆 诺丁鸭心情不太好 :(';
        } else if (this.satiety > 80 && this.energy > 80 && this.mood > 80) {
            title = '🦆 诺丁鸭状态极佳！😊';
        } else if (this.currentState === 'muyu') {
            title = '🦆 诺丁鸭正在积功德 🙏';
        } else if (this.currentState === 'happy') {
            title = '🦆 诺丁鸭很开心！😊';
        }
        
        titleElement.textContent = title;
        console.log('标题已更新为:', title);
    }
    
    // 更新建议操作按钮高亮（默认情况下不清除高亮，保持原有状态）
    updateSuggestedActions() {
        // 默认情况下不主动推荐，只在特定情况下调用
        // 这个方法现在主要用于清除推荐状态
        this.clearSuggestedActions();
    }
    
    // 清除所有建议操作按钮高亮
    clearSuggestedActions() {
        const buttons = ['feed-btn', 'play-btn', 'muyu-btn', 'chat-btn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.remove('suggested-action');
            }
        });
    }
    
    // 根据点击诺丁鸭图片时的推荐逻辑
    suggestActionsOnClick() {
        // 先清除所有推荐
        this.clearSuggestedActions();
        
        // 检查是否所有状态都为100%
        if (this.satiety >= 100 && this.mood >= 100 && this.energy >= 100) {
            // 所有状态都为100%，推荐聊天
            const chatBtn = document.getElementById('chat-btn');
            if (chatBtn) {
                chatBtn.classList.add('suggested-action');
            }
            return;
        }
        
        // 找出哪个值最低，推荐相应的动作
        let lowestValue = 100;
        let lowestAction = null;
        
        // 检查饱腹度
        if (this.satiety < lowestValue) {
            lowestValue = this.satiety;
            lowestAction = 'feed';
        }
        
        // 检查心情
        if (this.mood < lowestValue) {
            lowestValue = this.mood;
            lowestAction = 'play';
        }
        
        // 检查能量
        if (this.energy < lowestValue) {
            lowestValue = this.energy;
            lowestAction = 'muyu';
        }
        
        // 高亮最低值的动作按钮
        if (lowestAction) {
            const btnId = `${lowestAction}-btn`;
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.add('suggested-action');
            }
        }
        
        // 5秒后自动清除推荐
        setTimeout(() => {
            this.clearSuggestedActions();
        }, 5000);
    }
    
    // 保存状态到本地存储
    saveState() {
        const state = {
            level: this.level,
            exp: this.exp,
            expToNext: this.expToNext,
            meritPoints: this.meritPoints,
            satiety: this.satiety,
            mood: this.mood,
            energy: this.energy,
            lastUpdateTime: this.lastUpdateTime
        };
        
        chrome.storage.local.set({ duckState: state });
    }
    
    // 从本地存储加载状态
    loadState() {
        chrome.storage.local.get(['duckState'], (result) => {
            if (result.duckState) {
                const state = result.duckState;
                this.level = state.level || 1;
                this.exp = state.exp || 0;
                this.expToNext = state.expToNext || 100;
                this.meritPoints = state.meritPoints || 0;
                this.satiety = state.satiety || state.hunger || 80; // 兼容旧版本
                this.mood = state.mood || 90;
                this.energy = state.energy || 75;
                this.lastUpdateTime = state.lastUpdateTime || Date.now();
                
                // 计算离线期间的状态衰减
                this.calculateOfflineDecay();
                this.updateDisplay();
            }
        });
    }
    
    // 计算离线期间的状态衰减（模拟每10秒随机衰减）
    calculateOfflineDecay() {
        const now = Date.now();
        const secondsOffline = (now - this.lastUpdateTime) / 1000;
        
        if (secondsOffline > 10) { // 如果离线超过10秒
            // 模拟每10秒随机衰减一次的机制
            const decayCycles = Math.floor(secondsOffline / 10);
            const states = ['satiety', 'mood', 'energy'];
            
            for (let i = 0; i < decayCycles; i++) {
                const randomState = states[Math.floor(Math.random() * states.length)];
                this[randomState] = Math.max(0, this[randomState] - 1);
            }
        }
        
        this.lastUpdateTime = now;
        this.saveState();
    }
    
    // 开始状态随机衰减（每10秒随机一个状态-1）
    startStatusDecay() {
        setInterval(() => {
            // 随机选择一个状态进行衰减
            const states = ['satiety', 'mood', 'energy'];
            const stateNames = ['饱腹', '心情', '能量'];
            const randomIndex = Math.floor(Math.random() * states.length);
            const randomState = states[randomIndex];
            const stateName = stateNames[randomIndex];
            
            // 记录衰减前的值
            const oldValue = this[randomState];
            
            // 随机状态衰减1点
            this[randomState] = Math.max(0, this[randomState] - 1);
            
            // 显示衰减消息 - 暂时禁用以减少弹窗频率
            // this.showDecayMessage(stateName, oldValue, this[randomState]);
            
            this.updateDisplay();
            this.saveState();
            
            // 检查是否需要特殊状态
            this.checkSpecialStates();
        }, 10000); // 每10秒更新一次
    }
    
    // 检查特殊状态
    checkSpecialStates() {
        if (this.energy < 20) {
            this.setState('sleep');
        } else if (this.satiety < 30) {
            this.setState('hungry');
        } else if (this.mood > 80 && this.satiety > 50 && this.energy > 50) {
            this.setState('happy');
        } else {
            this.setState('normal');
        }
    }
    
    // 设置状态
    setState(state) {
        if (this.currentState !== state) {
            this.currentState = state;
            this.updateDuckImage();
        }
    }
    
    // 更新诺丁鸭图片
    updateDuckImage() {
        const duckImage = document.getElementById('duck-image');
        const duckStatus = document.getElementById('duck-status');
        
        if (duckImage && this.stateImages[this.currentState]) {
            duckImage.src = this.stateImages[this.currentState];
            
            // 更新状态文字
            const statusMap = {
                normal: '正常',
                happy: '开心',
                hungry: '饥饿',
                sleep: '困倦',
                muyu: '敲木鱼'
            };
            
            duckStatus.textContent = statusMap[this.currentState] || '正常';
            duckStatus.className = 'duck-status';
            
            // 根据状态设置颜色
            switch (this.currentState) {
                case 'happy':
                    duckStatus.style.background = '#48bb78';
                    break;
                case 'hungry':
                    duckStatus.style.background = '#f56565';
                    break;
                case 'sleep':
                    duckStatus.style.background = '#805ad5';
                    break;
                case 'muyu':
                    duckStatus.style.background = '#ed8936';
                    break;
                default:
                    duckStatus.style.background = '#4299e1';
            }
        }
    }
    
    // 喂食
    feed() {
        if (this.satiety >= 100) {
            return { success: false, message: '诺丁鸭已经很饱了！' };
        }
        
        // 播放喂食音效
        this.playSound('feed');
        
        this.satiety = Math.min(100, this.satiety + 2);
        this.energy = Math.max(0, this.energy - 1);
        this.addExp(3);
        
        this.setState('happy');
        this.animateDuck();
        this.saveState();
        this.updateDisplay();
        
        return { success: true, message: '诺丁鸭开心地吃了点东西！' };
    }
    
    // 玩耍
    play() {
        if (this.energy < 5) {
            return { success: false, message: '诺丁鸭太累了，需要休息！' };
        }
        
        // 播放玩耍音效
        this.playSound('play');
        
        this.mood = Math.min(100, this.mood + 3);
        this.energy = Math.max(0, this.energy - 1);
        this.addExp(5);
        
        this.setState('happy');
        this.animateDuck();
        this.saveState();
        this.updateDisplay();
        
        return { success: true, message: '诺丁鸭玩得很开心！心情变得更好了！' };
    }
    
    // 敲木鱼积功德
    strikeMuyu() {
        // 播放敲木鱼音效
        this.playSound('muyu');
        
        this.meritPoints += 1;
        this.energy = Math.min(100, this.energy + 1); // 每次获得1点精神能量
        this.addExp(3);
        
        this.setState('muyu');
        this.animateDuck();
        this.saveState();
        this.updateDisplay();
        
        return { success: true, message: '功德+1！内心平静，精神振奋！' };
    }
    
    // 动画效果
    animateDuck() {
        const duckImage = document.getElementById('duck-image');
        if (duckImage) {
            duckImage.classList.add('bounce');
            setTimeout(() => {
                duckImage.classList.remove('bounce');
            }, 600);
        }
    }
    
    // 添加经验值
    addExp(amount) {
        this.exp += amount;
        
        // 检查升级
        while (this.exp >= this.expToNext) {
            this.exp -= this.expToNext;
            this.levelUp();
        }
    }
    
    // 升级
    levelUp() {
        this.level++;
        this.expToNext = Math.floor(this.expToNext * 1.2); // 升级所需经验递增
        
        // 播放升级音效
        this.playSound('levelup');
        
        // 显示升级动画
        this.showLevelUpAnimation();
        
        // 显示升级消息
        this.showLevelUpMessage();
    }
    
    // 显示升级消息
    showLevelUpMessage() {
        const message = `🎉 诺丁鸭升级了！现在是 ${this.level} 级！`;
        
        // 在页面上显示升级消息
        this.displayFloatingMessage(message);
    }
    
    // 显示升级动画
    showLevelUpAnimation() {
        // 创建金碧辉煌的升级动画
        const animationContainer = document.createElement('div');
        animationContainer.id = 'level-up-animation';
        animationContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 10000;
            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
            animation: levelUpGlow 2s ease-out forwards;
        `;
        
        // 创建升级文字
        const levelUpText = document.createElement('div');
        levelUpText.innerHTML = `
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 48px;
                font-weight: bold;
                color: #FFD700;
                text-shadow: 0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 60px #FFD700;
                animation: levelUpText 2s ease-out forwards;
                text-align: center;
            ">
                <div>🎉 升级啦！🎉</div>
                <div style="font-size: 24px; margin-top: 10px;">等级 ${this.level}</div>
            </div>
        `;
        
        animationContainer.appendChild(levelUpText);
        
        // 添加动画CSS
        if (!document.getElementById('level-up-styles')) {
            const style = document.createElement('style');
            style.id = 'level-up-styles';
            style.textContent = `
                @keyframes levelUpGlow {
                    0% { opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { opacity: 0; }
                }
                
                @keyframes levelUpText {
                    0% { 
                        transform: translate(-50%, -50%) scale(0.5); 
                        opacity: 0; 
                    }
                    20% { 
                        transform: translate(-50%, -50%) scale(1.2); 
                        opacity: 1; 
                    }
                    40% { 
                        transform: translate(-50%, -50%) scale(1); 
                        opacity: 1; 
                    }
                    80% { 
                        transform: translate(-50%, -50%) scale(1); 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translate(-50%, -50%) scale(0.8); 
                        opacity: 0; 
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(animationContainer);
        
        // 2秒后移除动画
        setTimeout(() => {
            if (animationContainer.parentNode) {
                animationContainer.parentNode.removeChild(animationContainer);
            }
        }, 2000);
    }
    
    // 显示状态衰减消息
    showDecayMessage(stateName, oldValue, newValue) {
        const decayMessage = `📉 ${stateName}下降: ${Math.round(oldValue)}% → ${Math.round(newValue)}%`;
        
        // 在页面上显示衰减消息
        this.displayFloatingMessage(decayMessage);
    }
    
    // 显示浮动消息
    displayFloatingMessage(message) {
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = 'floating-message';
        messageElement.textContent = message;
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
            pointer-events: none;
        `;
        
        // 添加CSS动画
        if (!document.getElementById('floating-message-styles')) {
            const style = document.createElement('style');
            style.id = 'floating-message-styles';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-20px); }
                    20% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-20px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageElement);
        
        // 3秒后移除消息
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 3000);
    }
    
    // 更新显示
    updateDisplay() {
        console.log('updateDisplay called');
        
        // 更新等级和经验
        const levelElement = document.getElementById('duck-level');
        const expElement = document.getElementById('duck-exp');
        
        if (levelElement) levelElement.textContent = `等级 ${this.level}`;
        if (expElement) expElement.textContent = `经验 ${this.exp}/${this.expToNext}`;
        
        // 更新状态条
        console.log('Updating status bars...');
        this.updateStatusBar('satiety', this.satiety);
        this.updateStatusBar('mood', this.mood);
        this.updateStatusBar('energy', this.energy);
        
        // 更新功德点
        const meritElement = document.getElementById('merit-points');
        if (meritElement) {
            meritElement.textContent = `功德: ${this.meritPoints}`;
        }
        
        // 更新诺丁鸭图片和状态
        this.updateDuckImage();
        
        // 更新动态标题
        this.updateDynamicTitle();
        
        // 发送状态更新给悬浮组件
        this.updateMiniDuckStatus();
        
        // 检测数值变化并显示通知
        this.checkForNotifications();
        
        // 默认情况下不主动推荐操作按钮，只在点击时推荐
        // this.updateSuggestedActions(); // 注释掉默认推荐
    }
    
    // 检测数值变化并显示通知
    checkForNotifications() {
        // 初始化previousValues如果不存在
        if (!this.previousValues) {
            this.previousValues = {
                satiety: this.satiety,
                mood: this.mood,
                energy: this.energy
            };
            return;
        }
        
        // 检查饱食度降低
        if (this.previousValues.satiety > this.satiety && this.satiety <= 30) {
            this.showNotification('诺丁鸭饿了！需要喂食哦～', 'hunger');
        }
        
        // 检查心情降低
        if (this.previousValues.mood > this.mood && this.mood <= 40) {
            this.showNotification('诺丁鸭心情不好，陪它玩耍吧！', 'mood');
        }
        
        // 检查能量降低
        if (this.previousValues.energy > this.energy && this.energy <= 20) {
            this.showNotification('诺丁鸭累了，需要休息～', 'energy');
        }
        
        // 更新previousValues
        this.previousValues = {
            satiety: this.satiety,
            mood: this.mood,
            energy: this.energy
        };
    }
    
    // 显示通知弹窗
    showNotification(message, type = 'info') {
        // 检查是否已经显示了相同的通知（避免重复）
        const now = Date.now();
        if (this.lastNotificationTime && now - this.lastNotificationTime < 10000) {
            return; // 10秒内不重复显示
        }
        this.lastNotificationTime = now;
        
        try {
            const notification = document.createElement('div');
            notification.className = `notification-popup notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-message">${message}</div>
                    <div class="notification-actions">
                        <button class="notification-btn notification-cancel">取消</button>
                        <button class="notification-btn notification-confirm">确定</button>
                    </div>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 10002;
                min-width: 300px;
                max-width: 400px;
                animation: notificationPopIn 0.3s ease;
            `;
            
            // 添加遮罩层
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                animation: overlayFadeIn 0.3s ease;
            `;
            
            // 添加事件监听器
            const cancelBtn = notification.querySelector('.notification-cancel');
            const confirmBtn = notification.querySelector('.notification-confirm');
            
            cancelBtn.addEventListener('click', () => {
                this.closeNotification(notification, overlay);
            });
            
            confirmBtn.addEventListener('click', () => {
                this.closeNotification(notification, overlay);
                // 根据通知类型执行相应操作
                this.handleNotificationAction(type);
            });
            
            // 点击遮罩层关闭
            overlay.addEventListener('click', () => {
                this.closeNotification(notification, overlay);
            });
            
            document.body.appendChild(overlay);
            document.body.appendChild(notification);
            
        } catch (error) {
            console.warn('Failed to show notification:', error);
        }
    }
    
    // 关闭通知弹窗
    closeNotification(notification, overlay) {
        try {
            notification.style.animation = 'notificationPopOut 0.3s ease';
            overlay.style.animation = 'overlayFadeOut 0.3s ease';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 300);
        } catch (error) {
            console.warn('Failed to close notification:', error);
        }
    }
    
    // 处理通知动作
    handleNotificationAction(type) {
        switch (type) {
            case 'hunger':
                // 自动执行喂食
                this.feed();
                break;
            case 'mood':
                // 自动执行玩耍
                this.play();
                break;
            case 'energy':
                // 建议休息（不自动执行）
                console.log('诺丁鸭建议休息');
                break;
            default:
                console.log('未知通知类型:', type);
        }
    }
    
    // 更新悬浮诺丁鸭状态
    updateMiniDuckStatus() {
        // 根据当前状态确定显示的状态文本
        let statusText = '正常';
        
        if (this.currentState === 'happy') {
            statusText = '开心';
        } else if (this.currentState === 'hungry') {
            statusText = '饥饿';
        } else if (this.currentState === 'sleep') {
            statusText = '困倦';
        } else if (this.currentState === 'muyu') {
            statusText = '敲木鱼';
        }
        
        // 发送消息给content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateMiniDuckStatus',
                    status: statusText
                }).catch((error) => {
                    // 忽略错误，可能content script还未加载
                    console.log('无法发送消息给content script:', error.message);
                });
            }
        });
    }
    
    // 更新状态条
    updateStatusBar(type, value) {
        console.log(`Updating status bar: ${type} = ${value}`);
        const barElement = document.getElementById(`${type}-bar`);
        const textElement = document.getElementById(`${type}-text`);
        
        console.log(`Bar element found:`, barElement);
        console.log(`Text element found:`, textElement);
        
        if (barElement) {
            barElement.style.width = `${value}%`;
            
            // 移除所有样式类
            barElement.classList.remove('low', 'medium', 'high');
            
            // 根据数值添加相应的样式类
            if (value <= 30) {
                barElement.classList.add('low');
            } else if (value <= 70) {
                barElement.classList.add('medium');
            } else {
                barElement.classList.add('high');
            }
        }
        
        if (textElement) {
            textElement.textContent = `${Math.round(value)}%`;
        }
    }
    
    // 获取当前状态
    getStatus() {
        return {
            level: this.level,
            exp: this.exp,
            expToNext: this.expToNext,
            meritPoints: this.meritPoints,
            satiety: this.satiety,
            mood: this.mood,
            energy: this.energy,
            currentState: this.currentState
        };
    }
    
    // 重置状态（用于测试）
    reset() {
        this.level = 1;
        this.exp = 0;
        this.expToNext = 100;
        this.meritPoints = 0;
        this.satiety = 80;
        this.mood = 90;
        this.energy = 75;
        this.currentState = 'normal';
        this.lastUpdateTime = Date.now();
        
        this.saveState();
        this.updateDisplay();
    }
}

// 导出类
window.DuckCharacter = DuckCharacter;