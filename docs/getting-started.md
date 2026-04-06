# 快速开始

本指南帮助你快速上手 Skill.md 库。

## 安装

### 方法一：克隆仓库

```bash
git clone <repository-url>
cd skill-library
```

### 方法二：直接下载

下载 ZIP 文件并解压到本地。

## 配置 Claude Desktop

### 复制 Skill 文件

将 `.claude/skills/` 目录下的文件复制到 Claude Desktop Skill 目录：

| 系统 | 路径 |
|-----|------|
| Windows | `%USERPROFILE%\.claude\skills\` |
| macOS | `~/.claude/skills/` |
| Linux | `~/.claude/skills/` |

复制后重启 Claude Desktop。

### 使用配置文件（可选）

1. 复制 `config/claude-desktop-config.json` 到 Claude Desktop 配置目录
2. 根据项目结构修改配置
3. 重启 Claude Desktop

## 基础使用

### 在对话中使用 Skill

直接引用 Skill 文件名：

```
请按照 form-generator-react.skill.md 规范，生成用户登录表单
```

或使用别名（需在配置中设置）：

```
请使用 form 技能生成产品信息表单
```

### 第一个示例

尝试生成一个用户注册表单：

```
请按照 form-generator-react.skill.md 规范，生成用户注册表单。

字段包括：
- 用户名（必填，3-20字符）
- 邮箱（必填）
- 密码（必填，8-20字符）
- 确认密码（必填，需与密码一致）
```

AI 会自动生成完整的文件结构和代码。

## 工具使用

### 验证 Skill 文件

```bash
# 验证单个文件
node tools/validate-skill.js ./my-skill.skill.md

# 验证目录下所有文件
node tools/validate-skill.js --dir ./.claude/skills
```

### 生成新 Skill

```bash
# 交互式创建
node tools/generate-skill.js

# 快速创建
node tools/generate-skill.js "我的Skill名称" detailed

# 查看帮助
node tools/validate-skill.js --help
```

可用模板：`minimal`、`detailed`、`team`、`component`、`form`、`crud`

## 项目集成

### 新项目

```bash
# 创建 Skill 目录
mkdir -p .claude/skills

# 复制需要的 Skill 文件
cp skill-library/.claude/skills/form-generator-react.skill.md .claude/skills/
```

### 现有项目

1. 分析项目现有规范
2. 选择合适的 Skill 模板
3. 根据项目实际情况修改
4. 放入 `.claude/skills/` 目录

## 常用工作流

### 开发新功能

1. 选择合适的 Skill（如表单生成器）
2. 让 AI 按照 Skill 生成代码
3. 验证生成的代码
4. 根据需求微调

### 统一团队规范

1. 使用团队规范模板创建 Skill
2. 团队评审和修改
3. 分发到各项目
4. 定期更新和维护

### 代码重构

1. 使用代码规范 Skill
2. 让 AI 分析现有代码
3. 按照规范重构代码
4. 验证重构结果

## 集成到 CI/CD

将 Skill 验证加入持续集成：

```yaml
# GitHub Actions 示例
- name: 验证 Skill 文件
  run: node tools/validate-skill.js --dir ./.claude/skills
```

## 下一步

- 查看 [概念介绍](concepts.md) 了解 Skill.md 的设计理念
- 查看 [常见问题](faq.md) 解决使用中的疑问
- 浏览 `examples/` 目录查看完整示例
