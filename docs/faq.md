# 常见问题 (FAQ)

## 基础问题

### Skill.md 适合我吗？

**适合：**
- 有固定技术栈的项目
- 团队协作开发
- 需要保持代码一致性
- 经常使用 AI 生成代码

**不适合：**
- 一次性小任务
- 快速原型验证
- 技术栈频繁变化

### Skill.md 和 Cursor Rules、Copilot Instructions 有什么区别？

| 特性 | Skill.md | Cursor Rules | Copilot Instructions |
|-----|----------|--------------|---------------------|
| 适用 AI | 通用 | Cursor | GitHub Copilot |
| 文件格式 | Markdown | Markdown | Markdown |
| 配置位置 | 项目任意位置 | `.cursor/rules/` | `.github/copilot-instructions.md` |

可以同时使用，Skill.md 专注于代码生成规范。

## 配置问题

### Claude Desktop 找不到 Skill 文件

**检查清单：**
1. 确认文件位置正确（见 [快速开始](getting-started.md)）
2. 确认文件扩展名是 `.skill.md`
3. 重启 Claude Desktop 清除缓存
4. 检查配置文件路径是否正确

### 如何在多个项目间共享 Skill？

**方法一：全局目录**
```bash
# 复制到全局目录
cp .claude/skills/*.skill.md ~/.claude/skills/
```

**方法二：符号链接**
```bash
# 创建共享目录
mkdir ~/shared-skills

# 在项目中创建链接
ln -s ~/shared-skills .claude/skills/shared
```

### MCP 服务器配置失败

1. 确认 Node.js 已安装（v16+）
2. 检查配置文件 JSON 格式
3. 确认端口未被占用
4. 查看 Claude Desktop 日志

## 使用问题

### Skill 不生效，生成的代码不符合规范

**排查步骤：**
1. 运行验证工具：`node tools/validate-skill.js <skill-file>`
2. 检查 Skill 文件格式是否正确
3. 确认对话中明确引用了 Skill
4. 尝试更明确的指令："严格按照 xxx.skill.md 规范"

### 多个 Skill 规则冲突怎么办？

**解决方案：**
1. 对话中明确指定使用哪个 Skill
2. 创建组合 Skill 合并规则
3. 在项目配置中设置优先级

### 如何更新已有的 Skill？

1. 直接编辑 Skill 文件
2. 运行验证确保格式正确
3. 提交到版本控制
4. 通知团队成员更新

## 技术问题

### 支持哪些技术栈？

当前内置支持：
- React 18 + TypeScript + Ant Design
- Vue 3 + TypeScript + Element Plus

可以自定义 Skill 支持其他技术栈。

### 如何添加对新框架的支持？

1. 复制现有 Skill 模板
2. 修改技术栈约定
3. 更新代码示例
4. 测试生成效果

### Skill 文件有大小限制吗？

没有硬性限制，但建议：
- 单文件不超过 5000 行
- 复杂规范拆分为多个 Skill
- 使用引用避免重复

## 工具问题

### validate-skill.js 报错

**常见错误：**

| 错误 | 原因 | 解决 |
|-----|------|------|
| 缺少必需部分 | 未包含必要章节 | 添加 `# Skill:`、`## 使用场景` 等 |
| Skill 名称无效 | 使用了占位符 | 修改为实际名称 |
| 文件扩展名错误 | 不是 `.skill.md` | 重命名文件 |

### generate-skill.js 生成失败

1. 确认模板文件存在
2. 检查输出目录权限
3. 确认 Node.js 版本兼容

## 其他问题

### 更多问题？

1. 查看 [概念介绍](concepts.md) 了解原理
2. 查看 [快速开始](getting-started.md) 学习配置
3. 浏览 `examples/` 目录查看示例
4. 提交 GitHub Issue 获取帮助
