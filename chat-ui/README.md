# Local LLM Chat UI

一个用于本地部署大语言模型的美观聊天前端 Demo。支持流式对话、思考过程可视化、终端调试输出展示，以及思考模式的开关控制。

![preview](https://img.shields.io/badge/preview-dark%20tech-blue)

## 功能特性

- **本地模型对话**：通过 Ollama 本地 API 与 `qwen3.5-4b` 模型进行流式聊天
- **思考过程可视化**：模型回复的思考过程可折叠查看，支持一键开关
- **深色科技风 UI**：使用 React + Vite + Tailwind CSS 构建，界面简洁现代
- **终端调试页面**：可将本地终端脚本的输出实时推送到前端 `/debug` 页面
- **多会话管理**：左侧边栏支持新建/切换会话
- **Markdown 渲染**：支持代码高亮、表格、列表等富文本格式

## 目录结构

```
chat-ui/
├── api/
│   └── server.ts          # 调试后端服务（Express + SSE）
├── scripts/
│   └── pipe_debug.sh      # 终端输出推送到调试页的包装脚本
├── src/
│   ├── components/        # UI 组件
│   ├── hooks/             # 自定义 Hooks
│   ├── pages/             # 页面
│   ├── store/             # Zustand 状态管理
│   └── types/             # TypeScript 类型
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 环境要求

- [Node.js](https://nodejs.org/) >= 18
- [Ollama](https://ollama.com/) 本地服务已启动
- 已加载 `qwen3.5-4b` 模型（或修改配置中的模型名称）

## 快速开始

### 1. 安装依赖

```bash
cd chat-ui
npm install
```

### 2. 启动本地 Ollama 服务

确保 Ollama 正在运行，并且已加载目标模型：

```bash
ollama serve
ollama run qwen3.5-4b
```

### 3. 启动前端与调试后端

```bash
npm run dev
```

该命令会同时启动：
- Vite 前端开发服务器：`http://localhost:5173/`
- Express 调试后端：`http://localhost:3001`

如果只需要前端，可运行：

```bash
npm run dev:ui
```

## 使用说明

### 聊天页面

1. 打开 `http://localhost:5173/`
2. 在底部输入框输入问题，按 `Enter` 发送
3. 点击顶部 **Thinking 开关** 可开启/关闭模型的思考模式
4. 思考模式开启时，模型回复前会显示「思考过程」折叠面板

### 终端调试页面

1. 打开 `http://localhost:5173/debug`
2. 在另一个终端运行脚本时，使用包装脚本将输出推送到调试页：

```bash
./chat-ui/scripts/pipe_debug.sh ./ask_llm_stream.sh 你好
```

或者手动逐行推送：

```bash
./ask_llm_stream.sh 你好 | while IFS= read -r line; do
  curl -s -X POST http://localhost:5173/api/debug/log \
    -H "Content-Type: application/json" \
    -d '{"content":"$line"}'
done
```

调试页支持：
- 实时滚动显示终端输出
- 暂停/继续接收
- 一键清空日志
- 区分 stdout / stderr / info

## 常用脚本

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 同时启动前端与调试后端 |
| `npm run dev:ui` | 仅启动前端 |
| `npm run dev:api` | 仅启动调试后端 |
| `npm run build` | 构建生产版本 |
| `npm run check` | TypeScript 类型检查 |

## 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS
- **状态管理**：Zustand
- **Markdown 渲染**：react-markdown + remark-gfm + highlight.js
- **图标**：Lucide React
- **调试后端**：Express + Server-Sent Events

## 自定义配置

### 修改模型名称

编辑 `src/hooks/useChat.ts` 中的 `model` 字段：

```typescript
model: "qwen3.5-4b",
```

### 修改 Ollama 服务地址

编辑 `vite.config.ts` 中的代理配置：

```typescript
proxy: {
  '/api/chat': {
    target: 'http://localhost:11434',
    changeOrigin: true,
  },
}
```

### 修改调试后端端口

通过环境变量设置：

```bash
DEBUG_API_PORT=3002 npm run dev
```

## 注意事项

- 本 Demo 主要用于本地调试和展示，不适合直接部署到公网
- 对话数据仅在本地处理，不会上传到第三方服务
- 模型输出可能存在不准确之处，重要信息请自行核验

## License

MIT
