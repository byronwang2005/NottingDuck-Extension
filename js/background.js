// 诺丁鸭电子宠物 - 后台脚本
console.log('诺丁鸭电子宠物后台脚本已启动');

// 安装事件
chrome.runtime.onInstalled.addListener((details) => {
    console.log('诺丁鸭电子宠物已安装', details);
    
    // 初始化默认设置
    if (details.reason === 'install') {
        initializeDefaultSettings();
    }
});

// 初始化默认设置
function initializeDefaultSettings() {
    const defaultSettings = {
        duckState: {
            level: 1,
            exp: 0,
            expToNext: 100,
            meritPoints: 0,
            hunger: 80,
            mood: 90,
            energy: 75,
            lastUpdateTime: Date.now()
        },
        settings: {
            notificationsEnabled: true,
            autoSave: true,
            soundEnabled: true
        }
    };
    
    chrome.storage.local.set(defaultSettings, () => {
        console.log('默认设置已初始化');
    });
}

// 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('收到消息:', request);
    
    switch (request.action) {
        case 'getDuckStatus':
            getDuckStatus().then(sendResponse);
            return true; // 保持消息通道开放
            
        case 'updateDuckStatus':
            updateDuckStatus(request.data).then(sendResponse);
            return true;
            
        case 'resetDuck':
            resetDuck().then(sendResponse);
            return true;
            
        case 'getSettings':
            getSettings().then(sendResponse);
            return true;
            
        case 'updateSettings':
            updateSettings(request.data).then(sendResponse);
            return true;
            
        default:
            sendResponse({ success: false, message: '未知操作' });
    }
});

// 获取诺丁鸭状态
async function getDuckStatus() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['duckState'], (result) => {
            resolve({
                success: true,
                data: result.duckState || null
            });
        });
    });
}

// 更新诺丁鸭状态
async function updateDuckStatus(data) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['duckState'], (result) => {
            const currentState = result.duckState || {};
            const newState = { ...currentState, ...data };
            
            chrome.storage.local.set({ duckState: newState }, () => {
                resolve({
                    success: true,
                    message: '状态已更新'
                });
            });
        });
    });
}

// 重置诺丁鸭
async function resetDuck() {
    return new Promise((resolve) => {
        const defaultState = {
            level: 1,
            exp: 0,
            expToNext: 100,
            meritPoints: 0,
            hunger: 80,
            mood: 90,
            energy: 75,
            lastUpdateTime: Date.now()
        };
        
        chrome.storage.local.set({ duckState: defaultState }, () => {
            resolve({
                success: true,
                message: '诺丁鸭已重置'
            });
        });
    });
}

// 获取设置
async function getSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['settings'], (result) => {
            resolve({
                success: true,
                data: result.settings || {}
            });
        });
    });
}

// 更新设置
async function updateSettings(data) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['settings'], (result) => {
            const currentSettings = result.settings || {};
            const newSettings = { ...currentSettings, ...data };
            
            chrome.storage.local.set({ settings: newSettings }, () => {
                resolve({
                    success: true,
                    message: '设置已更新'
                });
            });
        });
    });
}

// 定时任务 - 状态衰减
setInterval(async () => {
    try {
        const status = await getDuckStatus();
        if (status.success && status.data) {
            const duckState = status.data;
            const now = Date.now();
            const timeDiff = (now - duckState.lastUpdateTime) / (1000 * 60 * 60); // 小时
            
            if (timeDiff > 0.0167) { // 如果超过1分钟
                // 更新状态衰减
                duckState.hunger = Math.max(0, duckState.hunger - (5 * timeDiff));
                duckState.mood = Math.max(0, duckState.mood - (3 * timeDiff));
                duckState.energy = Math.max(0, duckState.energy - (4 * timeDiff));
                duckState.lastUpdateTime = now;
                
                await updateDuckStatus(duckState);
            }
        }
    } catch (error) {
        console.error('状态衰减更新失败:', error);
    }
}, 60000); // 每分钟检查一次

// 每日重置任务
setInterval(async () => {
    try {
        const now = new Date();
        const today = now.toDateString();
        
        chrome.storage.local.get(['lastResetDate'], (result) => {
            if (result.lastResetDate !== today) {
                // 执行每日重置任务
                performDailyReset();
                chrome.storage.local.set({ lastResetDate: today });
            }
        });
    } catch (error) {
        console.error('每日重置任务失败:', error);
    }
}, 3600000); // 每小时检查一次

// 执行每日重置
async function performDailyReset() {
    console.log('执行每日重置任务');
    
    // 可以在这里添加每日奖励、清理等功能
    // 比如：每日登录奖励、清理过期数据等
}

// 监听标签页变化，更新诺丁鸭状态
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    // 标签页激活时的处理
    console.log('标签页已激活:', activeInfo);
});

// 监听窗口焦点变化
chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== chrome.windows.WINDOW_ID_NONE) {
        // 窗口获得焦点时的处理
        console.log('窗口已获得焦点');
    }
});

// 错误处理
chrome.runtime.onSuspend.addListener(() => {
    console.log('诺丁鸭电子宠物后台脚本即将暂停');
});

chrome.runtime.onSuspendCanceled.addListener(() => {
    console.log('诺丁鸭电子宠物后台脚本暂停已取消');
});