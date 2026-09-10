# 本地渲染素材

Poly Haven CC0 素材（https://polyhaven.com/license），仅用于材质与环境照明参考：

- https://polyhaven.com/a/fine_grained_wood ：wood-color / normal / rough，1K。
- https://polyhaven.com/a/white_oak_veneer ：white_oak_veneer-color / normal / rough，1K，Jenelle van Heerden制作，CC0。官方元数据dimensions为500×500；已下载并核对官方MD5、目视色图。当前显式木质板件使用0.5m纹理块的设计尺度，按板件长边定纹向；未替换浅色柜门，也不据素材宣称已选定实际板材或防潮等级。
- https://polyhaven.com/a/marble_rock_01 ：stone-color / normal，1K。网页中低对比混合用于石英石饰面示意。
- https://polyhaven.com/a/fabric_pattern_07 ：fabric-normal，1K。
- https://polyhaven.com/a/terlenka ：terlenka-color / normal / rough，1K。colormass摄影、Rico Cilliers处理；约265.7×266.3mm扫描范围，用于床品细织纹视觉参考，并非已选购面料。
- https://polyhaven.com/a/cotton_jersey ：cotton_jersey-color / normal / rough，1K。colormass摄影、Rico Cilliers处理；约263.6×263.8mm扫描范围，用于沙发布套/靠包针织纹视觉参考，并非产品选型证明。
- https://polyhaven.com/a/throw_pillows_01 ：两只独立靠包网格及原1K素材，CC0。不采用原红橙纹样：沙发版本保持等比缩放，使用中性针织面料；三卧枕套版本按几何主轴放平后适配既有床枕宽/长和200mm厚度，使用细织面料，保留原不均匀褶皱。床枕适配不是等比复制，也不是已选商品尺寸。此为三维几何素材，不是用户房间实测商品。
- https://polyhaven.com/a/lakeside ：lake.hdr，2K。不是用户楼盘或 13 层窗外实拍。

下载来源由 `download-render-assets.mjs` 通过官方 API 解析，文件用 API 提供的 MD5 核对。无用户图纸上传。首次下载后由本地服务器提供，不需要在线 API。

交付代码库：Three.js 0.160.1（MIT）；构建工具 esbuild 0.25.9（MIT）。版本锁在 package-lock.json；包内 LICENSE 保留，浏览器运行 bundle 为 vendor/render-libs.js。路径追踪试点包已撤出，不是当前运行依赖。
