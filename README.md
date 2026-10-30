# gjx1500.top

一个能源互联网工程学生的个人站点。纯静态，无构建步骤，部署在 Cloudflare Pages。

## 目录结构

```
.
├── index.html                   首页
├── projects/
│   └── index.html               项目页  /projects/
├── notes/
│   ├── index.html               笔记列表  /notes/
│   └── power-flow-basics.html   示例文章  /notes/power-flow-basics.html
├── assets/
│   ├── site.css                 全站样式（配色、排版、响应式）
│   └── bg.js                    背景动画 + 滚动淡入
└── 404.html                     Cloudflare Pages 自动使用的 404 页
```

## 本地预览

页面用了根路径（`/assets/site.css`），所以**不能直接双击打开**，要起一个本地服务器：

```bash
python -m http.server 8765
```

然后访问 http://127.0.0.1:8765

## 发布

```bash
git add .
git commit -m "改了什么"
git push
```

推送后 Cloudflare Pages 会自动重新部署（约 1 分钟）。

## 加一篇新笔记

1. 复制 `notes/power-flow-basics.html`，改文件名和内容
2. 在 `notes/index.html` 的列表里加一条链接

## 改配色

只改 `assets/site.css` 顶部的 `:root` 变量：

```css
--accent:#4ea1ff;    /* 主强调色 */
--accent-2:#3ee0c5;  /* 渐变第二色 */
```

## 说明

- 背景动画是手写 canvas，低功耗；系统开启「减少动态效果」时自动静止
- 关掉背景动画：删掉页面里的 `<canvas id="grid">` 即可
- 禁用 JavaScript 时内容仍然完整可见
