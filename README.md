<div align="center">

<img src="public/brand/tomo-icon-1024.jpg" width="120" alt="TOMO" />

# 🍅 TOMO · 番茄的 3D 世界

**一颗有情绪的番茄，住在你的浏览器里。**

[在线体验](https://cowork.xiaohongshu.com/s/tomo-3d) · [功能一览](#-功能一览) · [快速开始](#-快速开始)

</div>

---

## ✨ 这是什么

TOMO 是一个纯前端 3D 互动品牌站：一颗会哭、会困、会耍酷的番茄角色，住在梦幻的少女绘本房间里。你可以拖动它、给它换装、陪它专注，也可以戳一戳雨滴，听它说一句戳心窝的话。

**不是工具，是一个住着小番茄的世界。**

## 🎁 功能一览

| 功能 | 说明 |
|---|---|
| 🏠 3D 房间 | Three.js 手绘风场景，TOMO / 鸡蛋 / 插画卡 / 3D 周边**全部可拖拽** |
| 📖 番茄日记 | 10 章故事线：厨房逃生记，从"我不做食材"到"我做自己" |
| 🎭 DIY 工坊 | 7 种配件（眼镜/墨镜/礼帽/领结/胡子/耳机/皇冠）+ 9 种体色自由搭配 |
| 🏞️ 场景切换 | 暖室 / 森系清晨 / 黄昏，小泉理惠风配色 |
| ⏱️ 番茄钟 | 全屏沉浸专注 + Web Audio 合成白噪音（雨/厨房/森林/咖啡馆/海浪）|
| 🌱 番茄园 | 番茄养成四阶段，**与番茄钟联动**：专注越多浇水配额越多 |
| 🔮 玄学运势 | 塔罗 × 周易 × 梅花易数 × 紫微四体系，日期+口令种子决定每日一卦 |
| 🌳 情绪树洞 | 写下心情埋进土里开出花，14 天情绪日历 |
| 🎨 心情鸡尾酒 | 选 3 种心情调一杯专属鸡尾酒，配 Gemini API 可 AI 生图 |
| 🧪 性格测试 | 8 道情境题，4 种 TOMO 人格 |
| 🖼️ 插画馆 | 22 张 AI 手绘插画（日常/食物/贴纸），可下载 |
| 💧 雨滴语录 | 点击雨滴/云朵掉落 TOMO 语录，喜欢的句子可**收进口袋** |

## 🚀 快速开始

```bash
git clone https://github.com/chensn05/tomo-3d.git
cd tomo-3d
npm install
npm run dev
```

构建：

```bash
npm run build
```

纯静态产物，部署到任何静态托管（Vercel / Netlify / Cloudflare Pages / GitHub Pages）即可。

## 🔑 可选：AI 生图

心情鸡尾酒支持接入 [Google AI Studio](https://aistudio.google.com/apikey) 的 Gemini API（免费额度）：

1. 页面内「🔑 配置 Key」处粘贴
2. Key 只存在浏览器 localStorage，**不经过任何服务器**

不配 Key 也完全可用——会降级为本地生成的「心情配方卡」。

## 📱 PWA 安装（当 App 用）

TOMO 是一个 PWA——可以像原生 App 一样安装到手机桌面，离线也能打开：

**iOS（Safari）**
1. 用 Safari 打开网站
2. 点底部「分享」按钮
3. 选「添加到主屏幕」

**Android（Chrome）**
1. 用 Chrome 打开网站
2. 地址栏右侧「安装应用」提示，或菜单 →「添加到主屏幕」

**桌面（Chrome / Edge）**
- 地址栏右侧安装图标 → 安装

安装后：独立窗口、深红番茄图标、离线可玩、长按图标直达番茄钟/运势快捷方式。

## 🛠️ 技术栈

- **Vue 3** + TypeScript + Vite
- **Three.js**（3D 场景 / 可拖拽物理 / Canvas 纹理表情系统）
- **Web Audio API**（白噪音实时合成，无音频文件依赖）
- 零后端、零数据库，所有状态存 localStorage

## 📁 项目结构

```
src/
├── three/           # 3D 世界
│   ├── TomoScene.ts       # 场景 / 灯光 / 通用拖拽系统
│   ├── TomoCharacter.ts   # 番茄角色 + Canvas 表情
│   ├── FoodBuddy.ts       # 鸡蛋小伙伴
│   ├── DraggableItem.ts   # 通用拖拽物理（弹跳/摇晃）
│   └── Merch3D.ts         # 3D 周边模型（冰箱贴/钥匙扣/徽章/手办）
├── components/      # 功能面板（11 个）
└── App.vue          # 主界面 + 雨滴语录 + 新手引导
public/
├── art/            # 22 张 AI 手绘插画素材
└── brand/          # 图标与品牌字
```

## 📄 许可证

[MIT](LICENSE) — 插画素材（AI 生成）随项目一并 MIT，可自由使用。

## 🙏 Acknowledgements

- 插画由 GPT Image 2 / Nano Banana 2 生成
- 灵感来自所有相信"小而美的东西值得被做出来"的人
