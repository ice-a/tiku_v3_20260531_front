# 题库系统 - 前端

基于 Vue 3 + Ant Design Vue 的前端项目。

## 技术栈

- Vue 3 (Composition API / `<script setup>`)
- Ant Design Vue 4
- Pinia 状态管理
- Vue Router 4
- Vite 6
- Vitest + @vue/test-utils 测试框架

## 环境变量

复制 `.env.example` 为 `.env`，按需修改：

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:3000` |

- **开发环境**：Vite 会自动代理 `/api` 请求到此地址
- **生产环境**：填写后端部署地址，如 `https://your-backend.vercel.app`

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173

> 需要后端服务同时运行在 `VITE_API_BASE_URL` 指定的地址。

## 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch
```

测试覆盖：
- `composables/__tests__/useHitokoto.test.js` — 一言缓存逻辑（7 个测试）
- `utils/__tests__/api.test.js` — API 请求工具（7 个测试）

## 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建产物在 `dist/` 目录。

## 项目结构

```
frontend/
├── index.html              # HTML 入口
├── package.json
├── vite.config.js          # Vite 配置
├── vitest.config.js        # 测试配置
├── .env.example            # 环境变量示例
└── src/
    ├── main.js             # Vue 入口
    ├── App.vue             # 根组件
    ├── router/             # 路由配置
    ├── stores/             # Pinia 状态管理
    ├── components/         # 通用组件
    │   ├── AppHeader.vue
    │   ├── AppSidebar.vue
    │   ├── AppFooter.vue
    │   ├── HitokotoBar.vue
    │   ├── MarkdownRenderer.vue
    │   ├── FileUploader.vue
    │   ├── SearchBar.vue
    │   ├── Pagination.vue
    │   └── TagList.vue
    ├── composables/        # 组合式函数
    │   └── useHitokoto.js  # 一言缓存
    ├── utils/              # 工具函数
    │   └── api.js          # 统一 API 请求（apiGet/apiPost/apiPut/apiDelete）
    ├── styles/             # 全局样式
    │   └── global.css
    └── views/              # 页面组件
```

## API 请求

所有 API 请求通过 `utils/api.js` 统一处理：

- 自动注入 JWT token
- 401 时自动刷新 token
- 响应自动解包（`json.data` 直接返回）

```javascript
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/api.js';

const data = await apiGet('/api/questions');
const result = await apiPost('/api/questions', { title, answer });
```
