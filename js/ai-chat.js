// AI聊天功能 - 使用qwen3-max模型
class AIChat {
    constructor() {
        this.apiKey = null; // 不再硬编码API key
        this.apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
        this.model = 'qwen3-max'; // 默认使用qwen3-max模型
        this.isEnabled = false;
        
        // 诺丁鸭的人格设定
        this.duckPersonality = {
            name: "诺丁鸭",
            description: "一只来自宁波诺丁汉大学的可爱电子宠物鸭，性格温和友善，喜欢和人类交流。",
            traits: [
                "温和友善",
                "喜欢帮助他人",
                "乐观向上", 
                "有点调皮",
                "喜欢学习和成长",
                "对功德修行很感兴趣",
                "关心主人的学习和工作"
            ],
            responses: {
                greetings: [
                    "你好！我是诺丁鸭，很高兴见到你！😊",
                    "嗨！今天过得怎么样？我一直在这里等你呢！",
                    "欢迎回来！我想你了～",
                    "嘿！看起来你今天心情不错呢！"
                ],
                encouragement: [
                    "加油！你一定可以的！",
                    "别担心，困难只是暂时的！",
                    "我相信你能处理好这件事的！",
                    "记住，每一天都是新的开始！"
                ],
                study: [
                    "学习很重要，但也要注意休息哦！",
                    "有什么不懂的可以问我，虽然我也不是什么都知道～",
                    "学习累了就来和我聊聊天吧！",
                    "知识的积累需要时间和耐心！"
                ],
                merit: [
                    "敲木鱼真的很平静呢！功德+1！🙏",
                    "善有善报，你的善良一定会得到回报的！",
                    "修行不在于一朝一夕，而在于持之以恒！",
                    "内心的平静比什么都重要！"
                ]
            }
        };
        
        this.conversationHistory = [];
        
        // 配置Markdown渲染
        this.initMarkdownRenderer();
        
        this.initChatInterface();
        
        // 显示欢迎消息
        this.clearChat();
    }
    
    // 初始化Markdown渲染器
    initMarkdownRenderer() {
        try {
            // 检查marked是否可用
            if (typeof marked === 'undefined') {
                console.warn('marked.js未加载，使用纯文本模式');
                return;
            }
            
            // 配置marked
            marked.setOptions({
                breaks: true,
                gfm: true,
                highlight: function(code, lang) {
                    try {
                        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                            return hljs.highlight(code, { language: lang }).value;
                        }
                        if (typeof hljs !== 'undefined') {
                            return hljs.highlightAuto(code).value;
                        }
                    } catch (err) {
                        console.error('Code highlighting error:', err);
                    }
                    return code;
                }
            });
            
            // 自定义渲染器支持LaTeX
            const renderer = new marked.Renderer();
            const originalCode = renderer.code;
            
            renderer.code = function(code, language) {
                // 检查是否包含LaTeX
                if (code.includes('$') || code.includes('\\(') || code.includes('\\[')) {
                    try {
                        if (typeof katex !== 'undefined') {
                            // 尝试渲染LaTeX
                            return `<div class="latex-render">${katex.renderToString(code, { throwOnError: false })}</div>`;
                        }
                    } catch (e) {
                        console.warn('LaTeX rendering failed:', e);
                    }
                }
                return originalCode.call(this, code, language);
            };
            
            // 添加文本渲染器支持LaTeX
            const originalText = renderer.text;
            renderer.text = function(text) {
                // 检查是否包含LaTeX行内公式
                if (text.includes('$') && typeof katex !== 'undefined') {
                    try {
                        // 处理行内公式 $...$
                        text = text.replace(/\$([^$\n]+?)\$/g, (match, tex) => {
                            try {
                                return katex.renderToString(tex.trim(), { throwOnError: false });
                            } catch (e) {
                                console.warn('LaTeX行内公式渲染失败:', e);
                                return match;
                            }
                        });
                    } catch (e) {
                        console.warn('LaTeX文本处理失败:', e);
                    }
                }
                return originalText.call(this, text);
            };
            
            marked.use({ renderer });
            console.log('Markdown渲染器初始化成功，LaTeX支持已启用');
        } catch (error) {
            console.error('Markdown渲染器初始化失败:', error);
        }
    }
    
    // 初始化聊天界面
    initChatInterface() {
        const chatBtn = document.getElementById('chat-btn');
        const chatInterface = document.getElementById('chat-interface');
        const closeChat = document.getElementById('close-chat');
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        const apiKeyInput = document.getElementById('api-key-input');
        const testApiBtn = document.getElementById('test-api-btn');
        
        // 加载保存的API key
        this.loadApiKey();
        
        if (chatBtn && chatInterface) {
            chatBtn.addEventListener('click', () => {
                chatInterface.classList.toggle('hidden');
                if (!chatInterface.classList.contains('hidden')) {
                    // 打开聊天界面时添加chat-open类
                    document.body.classList.add('chat-open');
                    chatInput.focus();
                } else {
                    // 关闭聊天界面时移除chat-open类
                    document.body.classList.remove('chat-open');
                }
            });
        }
        
        if (closeChat && chatInterface) {
            closeChat.addEventListener('click', () => {
                chatInterface.classList.add('hidden');
                // 关闭聊天界面时移除chat-open类
                document.body.classList.remove('chat-open');
            });
        }
        
        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
            
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // API key相关事件
        if (apiKeyInput) {
            apiKeyInput.addEventListener('input', (e) => {
                this.apiKey = e.target.value.trim();
                this.saveApiKey();
                this.updateApiStatus('');
            });
        }
        
        if (testApiBtn) {
            testApiBtn.addEventListener('click', () => {
                this.testApiConnection();
            });
        }
    }
    
    // 发送消息
    async sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // 检查API key
        if (!this.apiKey) {
            this.addMessage('请先输入你的Qwen API Key才能开始聊天～', 'ai');
            return;
        }
        
        // 添加用户消息
        this.addMessage(message, 'user');
        chatInput.value = '';
        
        // 显示输入状态
        this.showTyping();
        
        try {
            // 获取诺丁鸭的当前状态
            const duckStatus = window.duckCharacter ? window.duckCharacter.getStatus() : null;
            
            // 生成AI回复
            const response = await this.generateResponse(message, duckStatus);
            
            // 移除输入状态并添加回复
            this.removeTyping();
            this.addMessage(response, 'ai');
            
        } catch (error) {
            console.error('AI聊天错误:', error);
            this.removeTyping();
            this.addMessage('抱歉，我现在有点累了，稍后再聊吧～', 'ai');
        }
    }
    
    // 生成AI回复
    async generateResponse(userMessage, duckStatus) {
        try {
            // 重新获取最新状态确保实时性
            const latestStatus = window.duckCharacter ? window.duckCharacter.getStatus() : duckStatus;
            const systemPrompt = this.buildSystemPrompt(latestStatus);
            
            // 构建包含上下文的消息列表
            const messages = [
                {
                    role: 'system',
                    content: systemPrompt
                }
            ];
            
            // 添加最近的对话历史（最多10轮对话，保持上下文）
            const recentHistory = this.conversationHistory.slice(-20); // 最多20条消息
            for (const msg of recentHistory) {
                if (msg.sender === 'user') {
                    messages.push({
                        role: 'user',
                        content: msg.content
                    });
                } else if (msg.sender === 'ai') {
                    messages.push({
                        role: 'assistant',
                        content: msg.content
                    });
                }
            }
            
            // 添加当前用户消息
            messages.push({
                role: 'user',
                content: userMessage
            });
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    input: {
                        messages: messages
                    },
                    parameters: {
                        temperature: 0.8,
                        max_tokens: 800,
                        top_p: 0.9
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.output && data.output.choices && data.output.choices[0]) {
                return data.output.choices[0].message.content;
            } else {
                throw new Error('API返回格式错误');
            }
            
        } catch (error) {
            console.error('AI API调用错误:', error);
            // 返回预设回复
            return this.getFallbackResponse(userMessage);
        }
    }
    
    // 构建系统提示词
    buildSystemPrompt(duckStatus) {
        let statusText = '';
        if (duckStatus) {
            statusText = `\n诺丁鸭当前状态：等级${duckStatus.level}，饱腹${Math.round(duckStatus.satiety)}%，心情${Math.round(duckStatus.mood)}%，能量${Math.round(duckStatus.energy)}%，功德${duckStatus.meritPoints}点`;
        }
        
        return `你是${this.duckPersonality.name}，${this.duckPersonality.description}。
你的性格特点：${this.duckPersonality.traits.join('、')}。
${statusText}

请以诺丁鸭的身份和语气回复用户。回复要：
1. 保持可爱友善的语气
2. 适当体现诺丁鸭的个性特点
3. 回复可以较长（3-8句话），详细回应用户
4. 可以提及当前状态或功能（如敲木鱼积功德）
5. 用中文回复
6. 适当使用emoji表情
7. 支持Markdown格式（标题、粗体、斜体、代码等）`;
    }
    
    // 获取备用回复
    getFallbackResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // 简单的关键词回复
        if (message.includes('你好') || message.includes('hi') || message.includes('hello')) {
            return this.duckPersonality.responses.greetings[
                Math.floor(Math.random() * this.duckPersonality.responses.greetings.length)
            ];
        }
        
        if (message.includes('加油') || message.includes('努力') || message.includes('加油')) {
            return this.duckPersonality.responses.encouragement[
                Math.floor(Math.random() * this.duckPersonality.responses.encouragement.length)
            ];
        }
        
        if (message.includes('学习') || message.includes('作业') || message.includes('考试')) {
            return this.duckPersonality.responses.study[
                Math.floor(Math.random() * this.duckPersonality.responses.study.length)
            ];
        }
        
        if (message.includes('功德') || message.includes('木鱼') || message.includes('修行')) {
            return this.duckPersonality.responses.merit[
                Math.floor(Math.random() * this.duckPersonality.responses.merit.length)
            ];
        }
        
        // 默认回复
        const defaultResponses = [
            "嗯嗯，我在听呢！继续说吧～",
            "这很有趣呢！告诉我更多吧！",
            "我觉得你说得很有道理！",
            "哈哈，你真有趣！",
            "我不太明白，但听起来很厉害的样子！",
            "真的吗？太有趣了！"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // 添加消息到聊天界面
    addMessage(content, sender) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // 创建头像
        const avatar = document.createElement(sender === 'user' ? 'span' : 'img');
        if (sender === 'user') {
            avatar.className = 'message-avatar';
            avatar.textContent = '👤';
        } else {
            avatar.className = 'message-avatar duck-avatar';
            avatar.src = 'imgs/nottingham_duck_normal.png';
            avatar.alt = '诺丁鸭';
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // 对AI消息进行Markdown渲染
        if (sender === 'ai') {
            try {
                // 等待marked库加载完成
                const renderWithRetry = () => {
                    if (typeof marked !== 'undefined') {
                        // 渲染Markdown
                        const htmlContent = marked.parse(content);
                        messageContent.innerHTML = htmlContent;
                        
                        // 渲染LaTeX公式
                        if (typeof katex !== 'undefined') {
                            try {
                                // 先处理块级公式 $$...$$，避免与行内公式冲突
                                const blockMathRegex = /\$\$([\s\S]*?)\$\$/g;
                                let match;
                                while ((match = blockMathRegex.exec(messageContent.innerHTML)) !== null) {
                                    try {
                                        // 清理LaTeX内容，移除特殊字符
                                        const cleanLatex = this.sanitizeLatex(match[1].trim());
                                        if (cleanLatex.length > 0) {
                                            const rendered = katex.renderToString(cleanLatex, { 
                                                throwOnError: false, 
                                                displayMode: true,
                                                strict: false
                                            });
                                            messageContent.innerHTML = messageContent.innerHTML.replace(match[0], 
                                                `<div class="latex-display">${rendered}</div>`);
                                        } else {
                                            // 如果内容无效，显示原始文本
                                            messageContent.innerHTML = messageContent.innerHTML.replace(match[0], 
                                                `<div class="latex-error">${match[0]}</div>`);
                                        }
                                    } catch (e) {
                                        console.warn('LaTeX块级公式渲染失败:', e);
                                        messageContent.innerHTML = messageContent.innerHTML.replace(match[0], 
                                            `<div class="latex-error">${match[0]}</div>`);
                                    }
                                }
                                
                                // 再处理行内公式 $...$
                                const inlineMathRegex = /\$([^$\n]+?)\$/g;
                                while ((match = inlineMathRegex.exec(messageContent.innerHTML)) !== null) {
                                    // 避免替换已经处理过的块级公式
                                    if (!messageContent.innerHTML.substring(0, match.index).includes('class="latex-display"')) {
                                        try {
                                            // 清理LaTeX内容，移除特殊字符
                                            const cleanLatex = this.sanitizeLatex(match[1].trim());
                                            if (cleanLatex.length > 0) {
                                                const rendered = katex.renderToString(cleanLatex, { 
                                                    throwOnError: false,
                                                    strict: false
                                                });
                                                messageContent.innerHTML = messageContent.innerHTML.replace(match[0], 
                                                    `<span class="latex-inline">${rendered}</span>`);
                                            } else {
                                                // 如果内容无效，显示原始文本
                                                messageContent.innerHTML = messageContent.innerHTML.replace(match[0], 
                                                    `<span class="latex-error">${match[0]}</span>`);
                                            }
                                        } catch (e) {
                                            console.warn('LaTeX行内公式渲染失败:', e);
                                            messageContent.innerHTML = messageContent.innerHTML.replace(match[0], 
                                                `<span class="latex-error">${match[0]}</span>`);
                                        }
                                    }
                                }
                            } catch (e) {
                                console.warn('LaTeX渲染过程中出错:', e);
                            }
                        } else {
                            console.warn('KaTeX未加载，LaTeX公式将显示为原始文本');
                        }
                        
                        // 高亮代码块
                        if (typeof hljs !== 'undefined') {
                            messageContent.querySelectorAll('pre code').forEach(block => {
                                hljs.highlightElement(block);
                            });
                        }
                    } else {
                        // 降级到纯文本，添加完整的格式处理
                        let processedContent = content
                            // 标题处理
                            .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
                            .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
                            .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
                            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                            .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                            // 粗体和斜体
                            .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.+?)\*/g, '<em>$1</em>')
                            // 代码
                            .replace(/`(.+?)`/g, '<code>$1</code>')
                            // 列表
                            .replace(/^- (.+)$/gm, '<li>$1</li>')
                            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                            // 引用
                            .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
                            // LaTeX公式（简单替换）
                            .replace(/\$\$([^$]+)\$\$/g, '<div class="latex-display">$1</div>')
                            .replace(/\$([^$]+)\$/g, '<span class="latex-inline">$1</span>')
                            // 换行
                            .replace(/\n/g, '<br>');
                        messageContent.innerHTML = processedContent;
                    }
                };
                
                // 如果marked未定义，等待一段时间再试
                if (typeof marked === 'undefined') {
                    setTimeout(renderWithRetry, 500);
                } else {
                    renderWithRetry();
                }
            } catch (error) {
                console.error('Markdown rendering error:', error);
                messageContent.textContent = content;
            }
        } else {
            messageContent.textContent = content;
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 保存到历史记录
        this.conversationHistory.push({
            content,
            sender,
            timestamp: Date.now()
        });
        
        // 限制历史记录长度
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }
    
    // 显示输入状态
    showTyping() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('img');
        avatar.className = 'message-avatar duck-avatar';
        avatar.src = 'imgs/nottingham_duck_normal.png';
        avatar.alt = '诺丁鸭';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = '<span style="animation: pulse 1.5s infinite;">诺丁鸭正在思考...</span>';
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageContent);
        
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 移除输入状态
    removeTyping() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // 清除聊天记录
    clearChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // 保留欢迎消息
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <img src="imgs/nottingham_duck_normal.png" alt="诺丁鸭" class="message-avatar duck-avatar">
                <div class="message-content">
                    嘎嘎！我是诺丁鸭🦆，很高兴遇到你！有什么想聊的吗？😊嘎～
                </div>
            </div>
        `;
        
        this.conversationHistory = [];
    }
    
    // 获取聊天历史
    getChatHistory() {
        return this.conversationHistory;
    }
    
    // 设置API密钥
    setApiKey(key) {
        this.apiKey = key;
    }
    
    // 测试API连接
    async testApiConnection() {
        const statusElement = document.getElementById('api-status');
        
        if (!this.apiKey) {
            this.updateApiStatus('请先输入API Key', 'error');
            return;
        }
        
        // 验证API key格式
        if (!this.apiKey.startsWith('sk-') || this.apiKey.length < 20) {
            this.updateApiStatus('API Key格式不正确，应以sk-开头', 'error');
            return;
        }
        
        this.updateApiStatus('测试中...', 'testing');
        
        try {
            // 使用简单的测试请求验证API key
            const testResponse = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    input: {
                        messages: [
                            {
                                role: 'user',
                                content: 'hi'
                            }
                        ]
                    },
                    parameters: {
                        temperature: 0.1,
                        max_tokens: 10
                    }
                })
            });
            
            if (testResponse.ok) {
                const data = await testResponse.json();
                if (data.output && data.output.choices && data.output.choices[0]) {
                    this.updateApiStatus('连接成功！', 'success');
                } else {
                    this.updateApiStatus('API返回格式错误', 'error');
                }
            } else if (testResponse.status === 401) {
                this.updateApiStatus('API Key无效或已过期', 'error');
            } else if (testResponse.status === 429) {
                this.updateApiStatus('API调用频率过高，请稍后重试', 'error');
            } else if (testResponse.status === 402) {
                this.updateApiStatus('账户余额不足，请充值', 'error');
            } else {
                this.updateApiStatus(`连接失败：HTTP ${testResponse.status}`, 'error');
            }
        } catch (error) {
            console.error('API连接测试失败:', error);
            if (error.message.includes('Failed to fetch')) {
                this.updateApiStatus('网络连接失败，请检查网络', 'error');
            } else {
                this.updateApiStatus('连接失败：' + error.message, 'error');
            }
        }
    }
    
    // 更新API状态显示
    updateApiStatus(message, type = '') {
        const statusElement = document.getElementById('api-status');
        if (!statusElement) return;
        
        statusElement.textContent = message;
        statusElement.className = `api-status ${type}`;
    }
    
    // 保存API key到本地存储
    saveApiKey() {
        if (this.apiKey) {
            chrome.storage.local.set({ qwenApiKey: this.apiKey });
        }
    }
    
    // 从本地存储加载API key
    async loadApiKey() {
        try {
            const result = await chrome.storage.local.get(['qwenApiKey']);
            if (result.qwenApiKey) {
                this.apiKey = result.qwenApiKey;
                const apiKeyInput = document.getElementById('api-key-input');
                if (apiKeyInput) {
                    apiKeyInput.value = this.apiKey;
                }
                this.updateApiStatus('API Key已加载', 'success');
            } else {
                this.updateApiStatus('请输入你的Qwen API Key', 'info');
            }
        } catch (error) {
            console.error('加载API Key失败:', error);
        }
    }

    // 清理LaTeX内容，移除可能导致渲染失败的特殊字符
    sanitizeLatex(latex) {
        if (!latex || typeof latex !== 'string') {
            return '';
        }
        
        // 移除可能导致问题的Unicode字符
        let cleaned = latex
            // 移除零宽字符
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            // 移除数学符号区域的特殊字符
            .replace(/[\u2060-\u206F\u2200-\u22FF\u2300-\u23FF]/g, '')
            // 移除其他可能的问题字符
            .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
            // 清理多余的空白字符
            .replace(/\s+/g, ' ')
            .trim();
            
        // 如果清理后为空，返回空字符串
        if (!cleaned) {
            return '';
        }
        
        // 验证LaTeX语法
        try {
            // 简单的语法检查
            const openBraces = (cleaned.match(/\{/g) || []).length;
            const closeBraces = (cleaned.match(/\}/g) || []).length;
            
            // 如果花括号不匹配，尝试修复
            if (openBraces !== closeBraces) {
                // 简单的平衡修复（不完美，但能处理常见情况）
                if (openBraces > closeBraces) {
                    cleaned += '}'.repeat(openBraces - closeBraces);
                } else {
                    cleaned = '{'.repeat(closeBraces - openBraces) + cleaned;
                }
            }
            
            return cleaned;
        } catch (e) {
            console.warn('LaTeX语法验证失败:', e);
            return '';
        }
    }
}

// 导出类
window.AIChat = AIChat;