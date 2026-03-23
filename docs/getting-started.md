# 快速开始

本指南将帮助你快速上手使用 Skill.md 库。

## 什么是 Skill.md？

Skill.md 是给 AI 助手（如 Claude）的"工作手册"，包含项目开发规范、技术栈约定、代码模板等。AI 读取 Skill.md 后，能够按照你的规范生成代码，确保代码质量和一致性。

## 安装与配置

### 1. 下载 Skill 库

克隆或下载本仓库：

```bash
git clone <repository-url>
cd skill-library
```

或者直接下载 ZIP 文件并解压。

### 2. 配置 Claude Desktop

#### 方法一：复制 Skill 文件
1. 将 `.claude/skills/` 目录下的文件复制到你的 Claude Desktop Skill 目录：
   - **Windows**: `%USERPROFILE%\.claude\skills\`
   - **macOS**: `~/.claude/skills/`
   - **Linux**: `~/.claude/skills/`

2. 重启 Claude Desktop

#### 方法二：使用配置文件
1. 复制 `config/claude-desktop-config.json` 到 Claude Desktop 配置目录
2. 根据你的项目结构修改配置
3. 重启 Claude Desktop

### 3. 配置 MCP 服务器（可选）

如果你需要使用 MCP 服务器功能：

1. 安装依赖：
```bash
npm install
```

2. 复制 `config/mcp-server-config.json` 到 Claude Desktop MCP 配置目录

3. 启动 MCP 服务器：
```bash
node tools/mcp-server.js
```

## 基础使用

### 使用已有 Skill

在 Claude 对话中引用 Skill：

```
请按照 form-generator.skill.md 规范，生成一个用户登录表单
```

或使用别名（如果配置了别名）：

```
请使用 form 技能生成产品信息表单
```

### 创建新 Skill

使用生成工具创建新 Skill：

```bash
# 交互式创建
node tools/generate-skill.js

# 快速创建
node tools/generate-skill.js "我的Skill名称" detailed
```

### 验证 Skill

验证 Skill 文件格式：

```bash
# 验证单个文件
node tools/validate-skill.js ./my-skill.skill.md

# 验证目录下所有文件
node tools/validate-skill.js --dir ./.claude/skills
```

## 核心 Skill 介绍

### 1. 表单生成器 (form-generator.skill.md)
- **用途**：生成 React + TypeScript + Ant Design 表单
- **技术栈**：React Hook Form + Zod 验证
- **示例**：`examples/form-generator-example/`

### 2. CRUD 模板 (crud-template.skill.md)
- **用途**：生成用户管理、订单管理等 CRUD 模块
- **技术栈**：React + Ant Design Table + 自定义 Hooks
- **示例**：`examples/crud-template-example/`

### 3. 代码规范 (code-standard.skill.md)
- **用途**：统一代码风格和质量标准
- **包含**：命名规范、TypeScript 规则、React 最佳实践
- **适用**：团队开发、代码审查

### 4. UI 组件封装 (component-wrapper.skill.md)
- **用途**：二次封装 Ant Design 等 UI 组件库
- **功能**：主题定制、业务功能增强、样式统一
- **示例**：按钮、输入框、表格、弹窗封装

## 模板选择

### 最小模板 (minimal-skill.md)
- 适合简单规范
- 包含必需部分
- 快速开始

### 详细模板 (detailed-skill.md)
- 适合复杂项目
- 包含所有推荐部分
- 完整的规范文档

### 团队规范模板 (team-standard.md)
- 适合团队使用
- 包含开发流程、代码审查等
- 完整的团队规范

## 项目集成

### 在新项目中启用

1. 复制需要的 Skill 文件到项目目录：
```bash
mkdir -p .claude/skills
cp skill-library/.claude/skills/form-generator.skill.md .claude/skills/
```

2. 在项目中创建 `.claude/skills/` 目录
3. 将 Skill 文件放入该目录
4. Claude 会自动读取并使用

### 在现有项目中添加

1. 分析项目现有规范
2. 选择合适的 Skill 模板
3. 根据项目实际情况修改
4. 放入 `.claude/skills/` 目录

## 常见工作流

### 场景 1：开发新功能
```
1. 选择合适 Skill（如表单生成器）
2. 让 AI 按照 Skill 生成代码
3. 验证生成的代码
4. 根据需求微调
```

### 场景 2：统一团队规范
```
1. 使用团队规范模板创建 Skill
2. 团队评审和修改
3. 分发到各项目
4. 定期更新和维护
```

### 场景 3：代码重构
```
1. 使用代码规范 Skill
2. 让 AI 分析现有代码
3. 按照规范重构代码
4. 验证重构结果
```

## 验证与测试

### 验证 Skill 格式
确保 Skill 文件格式正确：
```bash
node tools/validate-skill.js ./your-skill.skill.md
```

### 测试生成结果
使用示例验证生成效果：
```bash
# 查看表单示例
cd examples/form-generator-example
npm install
npm start
```

### 集成到 CI/CD
将 Skill 验证加入持续集成：
```yaml
# GitHub Actions 示例
- name: 验证 Skill 文件
  run: node tools/validate-skill.js --dir ./.claude/skills
```

## 故障排除

### 问题 1：Claude 找不到 Skill
- **检查**：Skill 文件是否在正确目录
- **解决**：确认路径和文件扩展名（.skill.md）

### 问题 2：Skill 不生效
- **检查**：Skill 文件格式是否正确
- **解决**：运行验证工具修复问题

### 问题 3：生成代码不符合预期
- **检查**：Skill 描述是否清晰
- **解决**：优化 Skill 文件，添加更多示例

### 问题 4：性能问题
- **检查**：Skill 文件是否过大
- **解决**：拆分大型 Skill 为多个小 Skill

## 下一步

1. **查看示例**：浏览 `examples/` 目录了解实际用法
2. **修改模板**：根据项目需求调整 Skill 模板
3. **创建自定义 Skill**：使用生成工具创建自己的 Skill
4. **团队分享**：将 Skill 库分享给团队成员
5. **持续改进**：根据使用反馈优化 Skill 文件

## 获取帮助

- **文档**：查看 `docs/` 目录获取详细文档
- **示例**：参考 `examples/` 目录的完整示例
- **工具**：使用 `tools/` 目录的辅助工具
- **模板**：基于 `templates/` 目录的模板创建

---

✅ **恭喜！** 你已经成功设置了 Skill.md 库。现在可以开始使用 Skill 来提高开发效率和代码质量了。