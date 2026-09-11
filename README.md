# zhuangxiu
这是我的房子装修3d图

## 本地预览

在仓库根目录运行：

```sh
python3 -m http.server 8774 --bind 127.0.0.1 --directory site/lake-home-walkthrough
```

打开 http://127.0.0.1:8774/column-view.html 查看当前全屋交互模型。
玄关整墙试排：`entry-wall-redesign.html`。

当前入户整墙方案（第31版）：`entry-whole-wall-review.html?view=door&v=entry-organized-31`。
屋内面对入户门，右侧从门边向次卫依次为60cm挂包与双层抽拉鞋盘、80cm鞋柜、40cm外套柜、53cm独立用品柜；左侧为浅悬浮台、内嵌冰箱意向位与餐边柜。
写实效果图：`entry-wall-31-photoreal.png`。页面提供鞋盘、鞋柜及用品柜的开合查看；尺寸和产品安装仍需现场复核。

源码自带浏览器运行所需的 vendor、模型与图片，不需要安装依赖即可预览。
构建工具依赖可在 `site/lake-home-walkthrough` 内运行 `npm ci` 安装。

本仓库包含方案迭代和对照页面；尺寸试排及旧效果图不等于施工定案。
本地依赖、会话记录、原始 CAD、Blender 工程及部分渲染中间文件未纳入版本控制。
