# Accurate Floorplan 3D

[English](README.md) | **简体中文**

一个用于将住宅户型图、扫描图、PDF 或 CAD 导出图还原为面积校准的 2D 户型与可旋转 3D 结构模型的 Codex Skill。

## 主要能力

- 按标注尺寸、面积和拓扑关系校准房间布局
- 检查共墙、过道、门窗、阳台及飘窗关系
- 从同一份权威户型数据生成一致的 2D 与 3D 视图
- 默认生成浅色三栏界面，并在本地浏览器中运行

## 安装

将仓库克隆到 Codex Skills 目录：

```bash
git clone https://github.com/jackie-csu/accurate-floorplan-3d-skill.git ~/.codex/skills/accurate-floorplan-3d
```

重启 Codex 后，即可通过 `$accurate-floorplan-3d` 使用。

## 使用示例

上传户型图后输入：

> 使用 `$accurate-floorplan-3d`，按户型图标注准确还原房间布局、面积、门窗关系，并生成可旋转的本地 3D 模型。

详细工作流程与精度约束请参阅 [SKILL.md](SKILL.md)。
