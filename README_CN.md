# VTxMus

<div align="center">

![VTxMus Logo](public/favicon.ico)

一个现代化、优雅的网易云音乐客户端，基于 Vue 3 + TypeScript 构建

中文文档 | [English](./README.md)

</div>

## 特性

- **音乐搜索** - 搜索歌曲、歌手和专辑
- **高品质播放** - 支持多种音质等级（最高支持 Hi-Res）
- **播放列表管理** - 创建和管理你的播放列表
- **收藏功能** - 本地保存你喜欢的歌曲
- **现代化界面** - 精美的深色渐变主题，流畅的动画效果
- **播放模式** - 顺序播放、单曲循环和随机播放
- **响应式设计** - 在不同屏幕尺寸下都能完美运行
- **桌面应用** - 提供 Electron 桌面应用版本

## 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- Python 3.x（用于 API 服务）
- 网易云音乐账号（高音质需要 VIP 会员）

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/DarkStarLan/VTxMus.git
cd VTxMus
```

2. 安装依赖

```bash
npm install
```

3. 配置 Cookie

将你的网易云音乐 Cookie 复制到 `login_cookie.txt` 文件中：

```bash
# 在浏览器登录 music.163.com 后获取 Cookie
# 将完整的 Cookie 字符串复制到 login_cookie.txt 文件
```

4. 启动应用

**Windows（最简单）：**

```bash
start.bat
```

**手动启动：**

```bash
# 终端 1：启动代理服务器
npm run dev:proxy

# 终端 2：启动前端
npm run dev:vite
```

5. 在浏览器中打开 `http://localhost:5173`

## 音质等级

在 `src/config/api.ts` 中配置音质：

```typescript
export const DEFAULT_QUALITY = QualityLevel.EXHIGH
```

可选音质等级：

- `STANDARD` - 标准音质 (128kbps)
- `EXHIGH` - 极高音质 (320kbps) [默认]
- `LOSSLESS` - 无损音质 (FLAC)
- `HIRES` - Hi-Res 音质 (24bit/96kHz)
- `JYEFFECT` - 高清环绕声
- `SKY` - 沉浸环绕声
- `JYMASTER` - 超清母带

> 注意：更高音质需要 VIP 会员

## 技术栈

- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **构建工具**: Vite
- **桌面应用**: Electron
- **API 代理**: Express + Node.js
- **样式**: CSS3 现代动画
- **测试**: Vitest + Cypress

## 构建

### Web 应用

```bash
npm run build
```

### 桌面应用

```bash
# Windows
npm run electron:build:win

# 所有平台
npm run electron:build
```

## 开发

```bash
# 运行单元测试
npm run test:unit

# 运行 E2E 测试
npm run test:e2e

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 项目结构

```
VTxMus/
├── src/
│   ├── api/              # API 接口封装
│   ├── components/       # Vue 组件
│   ├── config/           # 配置文件
│   ├── router/           # Vue Router 路由
│   ├── stores/           # Pinia 状态管理
│   ├── utils/            # 工具函数
│   └── views/            # 页面组件
├── electron/             # Electron 主进程
├── public/               # 静态资源
├── proxy-server.js       # API 代理服务器
└── package.json
```

## 致谢

本项目使用了以下开源项目：

- [@.ai/Netease_url](https://github.com/yourusername/Netease_url) - 为网易云音乐 API 解析提供了技术支持
- [Font Awesome Free 7.2.0](https://fontawesome.com/) - 提供精美的图标库支持

## 免责声明

本项目仅供**学习和个人使用**，请勿用于商业用途。使用者应遵守网易云音乐的服务条款。

## 开源协议

本项目采用 [MIT 协议](LICENSE) 开源。

## 贡献

欢迎贡献代码、提出问题和功能建议！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 联系方式

如有任何问题或建议，欢迎提交 Issue。

## 截图

### 主界面
现代化的深色渐变主题，精美的播放器控件

### 搜索功能
快速搜索歌曲、歌手和专辑

### 播放列表
便捷的播放列表管理

## 功能路线图

- [x] 基础播放功能
- [x] 搜索功能
- [x] 播放列表管理
- [x] 收藏功能
- [x] 桌面应用
- [ ] 歌词显示
- [ ] 评论功能
- [ ] 用户登录
- [ ] 个人歌单同步
- [ ] 下载功能

## 使用技巧

1. **收藏功能**：收藏的歌曲保存在浏览器本地存储中，不会丢失
2. **播放列表**：可以一次性添加多首歌曲到播放列表
3. **快捷操作**：双击歌曲立即播放并替换播放列表
4. **音质选择**：根据网络情况选择合适的音质等级

## 常见问题

### 搜索失败

**原因**：代理服务器未启动或 Cookie 失效

**解决方法**：
1. 确保代理服务器正在运行
2. 检查 `login_cookie.txt` 中的 Cookie 是否有效
3. 重新获取 Cookie 并更新

### 无法播放

**原因**：Cookie 过期、非 VIP 账号或音质等级过高

**解决方法**：
1. 更新 Cookie
2. 确认账号是否有 VIP 权限
3. 降低音质等级到 `STANDARD` 或 `EXHIGH`

### 端口被占用

**原因**：3001 或 5173 端口被其他程序占用

**解决方法**：
1. 关闭占用端口的程序
2. 或修改 `proxy-server.js` 和 `vite.config.ts` 中的端口配置

## Star History

如果这个项目对你有帮助，请给它一个 Star

---

**享受音乐吧！**

