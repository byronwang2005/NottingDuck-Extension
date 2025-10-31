# 🦆 高贵人士诺丁鸭电子宠物浏览器扩展

一个优雅的诺丁鸭电子宠物扩展，为您的浏览时光增添乐趣和陪伴。

## 🚀 快速安装指南（Chrome / Edge / Firefox）

只需几步，即可在浏览器中唤醒你的专属诺丁鸭：

1. **下载项目**  
   克隆本仓库或在[Releases 页面](https://github.com/byronwang2005/NottingDuck-Extension/releases)下载`.zip`文件，解压到本地。

2. **打开扩展管理页面**  
   - **Chrome / Edge**: 访问 `chrome://extensions/`  
   - **Firefox**: 访问 `about:debugging#/runtime/this-firefox`

3. **启用开发者模式**  
   在页面右上角开启 **“开发者模式”**（Developer mode）。

4. **加载扩展**  
   - **Chrome / Edge**: 点击 **“加载已解压的扩展程序”**，选择解压后的 `nottingham-duck-extension` 文件夹。  
   - **Firefox**: 点击 **“临时载入附加组件”**，选择文件夹内的 `manifest.json`。

5. **完成！**  
   诺丁鸭图标将出现在浏览器工具栏，点击即可开始互动。

> 💡 **提示**：首次使用 AI 聊天功能前，请在聊天界面中配置你的 Qwen API Key。

## ✨ 功能特色

### 🎮 核心玩法
- **宠物养成**: 照顾诺丁鸭的饱腹度、心情值和能量值
- **等级系统**: 通过互动获得经验值，提升诺丁鸭等级
- **功德系统**: 敲木鱼积功德，修身养性

### 🤖 AI 聊天
- 与诺丁鸭进行智能对话
- 支持 Markdown 渲染和 LaTeX 数学公式
- 目前需要配置 Qwen API Key

### 🎵 音效体验
- 丰富的交互音效
- 喂食、玩耍、敲木鱼等动作都有专属音效
- 升级时的特殊音效

### 🎨 视觉反馈
- 不同的诺丁鸭有不同的状态图片
- 实时状态条显示
- 优雅的界面设计

## 📁 项目结构

```
nottingham-duck-extension/
├── manifest.json          # 扩展配置文件
├── popup.html             # 主界面
├── css/
│   └── popup.css          # 样式文件
├── js/
│   ├── duck-character.js  # 诺丁鸭核心逻辑
│   ├── ai-chat.js         # AI聊天功能
│   ├── popup.js           # 界面交互逻辑
│   └── background.js      # 后台服务
├── sounds/                # 音效文件
│   ├── feed.mp3           # 喂食音效
│   ├── play.mp3           # 玩耍音效
│   ├── muyu.mp3           # 敲木鱼音效
│   ├── duck-click.mp3     # 点击音效
│   └── levelup.mp3        # 升级音效
├── imgs/                  # 诺丁鸭图片
│   ├── nottingham_duck_normal.png  # 正常状态
│   ├── nottingham_duck_happy.png   # 开心状态
│   ├── nottingham_duck_hungry.png  # 饥饿状态
│   ├── nottingham_duck_sleep.png   # 困倦状态
│   └── nottingham_duck_muyu.png    # 敲木鱼状态
├── libs/                  # 第三方库
│   ├── katex.min.css      # LaTeX 渲染
│   ├── katex.min.js
│   ├── marked.min.js      # Markdown 解析
│   └── highlight.min.js   # 代码高亮
├── icons/                 # 扩展图标
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── LICENSE                # 开源协议
```

## 🚀 安装方法（Edge/Firefox同理）

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `nottingham-duck-extension` 文件夹
6. 扩展安装完成！

## 🎯 使用指南

### AI聊天设置
1. 点击"💬 聊天"按钮
2. 在弹出的聊天界面中输入您的 Qwen API Key
3. 点击"测试"验证API Key有效性
4. 开始与诺丁鸭对话！

## 🔧 技术特性

- **Manifest V3**: 使用最新的Chrome扩展标准
- **模块化设计**: 清晰的代码结构，易于维护
- **本地存储**: 数据持久化保存

## 📝 开发说明

### 环境要求
- Chrome 88+ 或其他基于 Chromium 的浏览器
- Node.js (可选，用于开发)

### 本地开发
1. 克隆或下载项目文件
2. 在 Chrome 中加载扩展
3. 修改代码后刷新扩展即可看到效果

### API配置
扩展使用阿里云 Qwen API 进行AI对话：
- 需要有效的 API Key
- 支持 Markdown 和 LaTeX 渲染

## 🐛 问题反馈

如果您在使用过程中遇到问题：
1. 检查 Chrome 扩展管理页面是否有错误提示
2. 确认 API Key 配置正确
3. 查看浏览器控制台日志
4. 在本 repo 提出 `Issues`

## 📄 开源协议

本项目采用 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

---

**享受与诺丁鸭的美好时光！** 🦆✨
**Made with ❤️ for UNNCers**  
By Byron | [GitHub](https://github.com/byronwang2005/NottingDuck-Extension)
