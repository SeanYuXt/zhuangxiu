# 装修 Skill 与设计成果备份

打包日期：2026-09-09。此包是本地成果快照，不是施工图，也不表示所有历史方案已通过验收。

## 内容

- `skills/accurate-floorplan-3d/`：装修建模 Skill 原文件，含使用说明、建模规则、图标与户型校验器。
- `site/lake-home-walkthrough/`：全屋交互页面、儿童房与主卧各版设计、数据、3D 依赖、效果截图、离线渲染工程及历史验证脚本。
- `site/cad-evidence/`、`site/floorplan-1-v3/`：页面引用的 CAD 诊断证据及基础户型参考。
- `manifest.json`：每个打包文件的字节数和 SHA256，供完整性核对。

保留全部历史方案供回溯；历史文件存在不代表仍推荐该方案。排除 `.git`、`.openai` 本机托管配置、Python 缓存、Blender `.blend1` 自动备份，不删除原目录任何文件。第三方素材出处与许可保留在原项目内。

## 启动网页

解压后需安装 Python 3。Windows 可双击 `start-preview.cmd`。也可在本目录执行：

```powershell
python -m http.server 8768 --bind 127.0.0.1 --directory site
```

如果8768已被占用，改成其他空闲端口，并相应修改下列网址。不要直接双击原 HTML：模块和 JSON 需要本地 HTTP 服务。

| 入口 | 地址 |
| --- | --- |
| 当前主卧套间 / 59版主卫 | http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=bath&v=corner-59 |
| 当前主卫俯视 | http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=bathTop&v=corner-59 |
| 主卧整面柜 | http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=footwall |
| 衣帽收纳 / 保险箱 | http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=storage |
| 梳妆台 | http://127.0.0.1:8768/lake-home-walkthrough/master-window-ac-option.html?view=vanity |
| 全屋漫游 | http://127.0.0.1:8768/lake-home-walkthrough/index.html |
| 全屋室内定位 | http://127.0.0.1:8768/lake-home-walkthrough/column-view.html |
| 儿童房原门研究（未定稿） | http://127.0.0.1:8768/lake-home-walkthrough/child-original-door-study.html |

网页原有依赖已随项目保存。无需执行 npm install 才能浏览现有页面。源码重建、Blender 离线重新渲染和自动浏览器测试是开发流程，仍需要相应 Node.js、Blender、Playwright 和浏览器；不捆绑这些大型运行时。历史脚本可能保留原机器绝对路径，迁移运行前须调整，不能把脚本存在当作跨机器测试通过。

## 安装 Skill

将 `skills/accurate-floorplan-3d` 文件夹复制到新机器的 Codex skills 目录（Windows 通常为用户目录下 `.codex/skills/`）。若已存在同名技能，先比较或备份，不要直接覆盖个人修改。重新开启会话后使用 `$accurate-floorplan-3d`。

不包含、也不需要 Chaken/Jenkins 插件来浏览或继续此装修项目。

## 当前成果与边界

- 已有全屋三维漫游、门窗与家具定位、尺寸数据、俯视及室内视角；原项目 README 和各次报告中仍有历史状态，需按日期辨别。
- 主卧已建模床尾整柜、上下分段柜门、抽屉、衣帽收纳、保险箱、全身镜、理物板、梳妆、窗帘、投影和照明等候选细节。它们是设计模型，不代表水电安装已完成。
- 主卫59版：入口58×40cm盆柜，右侧马桶，窗侧90×90cm淋浴，可收拢L浴帘。是挡水分区，不是密闭干湿隔离。源模型的连续圆盘路线校核：如厕75cm、入浴70cm、洗漱65cm；原内开门保留。
- 主卫58版已因约44cm斜向瓶颈否决，只作对比。儿童房仍未定稿，不能把历史摆放当作最终选择。
- 未确认项：现场净尺寸、承重与检修区、实际排污口/马桶移位、地漏与防水找坡、窗框耐水及窗扇、空调安装净距与排水、湿区电气等。旧 validator PASS 不能替代施工复尺及专业审核。

## 核验

Skill 的户型校验器可独立执行，例如：

```powershell
python -X utf8 skills/accurate-floorplan-3d/scripts/validate_floorplan.py site/lake-home-walkthrough/master-window-ac-option-spec.json
```

打包时验证 ZIP 可读取、所有条目的 SHA256 与清单一致，并对解压后的当前主卧/主卫页面做加载核验。详细结果见同目录 `打包核验.md`。未逐项重新验收全部历史方案或离线渲染流程。

包内含私人户型、设计及现场资料，分享前请确认接收对象。
