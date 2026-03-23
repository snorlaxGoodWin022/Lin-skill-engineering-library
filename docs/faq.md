# 常见问题 (FAQ)

## 目录
- [基础问题](#基础问题)
- [配置与安装](#配置与安装)
- [使用问题](#使用问题)
- [技术问题](#技术问题)
- [最佳实践](#最佳实践)
- [故障排除](#故障排除)

## 基础问题

### 1. 什么是 Skill.md？
Skill.md 是给 AI 助手（如 Claude）的"工作手册"，包含项目开发规范、技术栈约定、代码模板等。AI 读取 Skill.md 后，能够按照你的规范生成代码。

### 2. Skill.md 和普通文档有什么区别？
| 特性 | 普通文档 | Skill.md |
|------|----------|----------|
| 使用对象 | 人类开发者 | AI 助手 |
| 格式 | 自由格式 | 结构化格式 |
| 目的 | 阅读理解 | 代码生成 |
| 更新频率 | 较低 | 随技术栈更新 |

### 3. 谁应该使用 Skill.md？
- **个人开发者**：保持代码一致性，提高效率
- **开发团队**：统一编码规范，减少沟通成本
- **开源项目**：提供贡献者指南，规范代码风格
- **教育培训**：创建教学模板，统一评分标准

### 4. Skill.md 有哪些局限性？
- 需要学习编写格式
- 技术栈变更时需要更新
- 不适合一次性任务
- 不适合探索性项目

## 配置与安装

### 5. 如何安装 Skill.md 库？
1. 下载或克隆本仓库
2. 将 `.claude/skills/` 目录复制到 Claude Desktop 的 Skill 目录
3. 重启 Claude Desktop
4. 或在项目目录中创建 `.claude/skills/` 目录并放入 Skill 文件

### 6. Claude Desktop 的 Skill 目录在哪里？
- **Windows**: `%USERPROFILE%\.claude\skills\`
- **macOS**: `~/.claude/skills/`
- **Linux**: `~/.claude/skills/`

### 7. 如何在多个项目中使用相同的 Skill？
**方法一**：将 Skill 文件放在全局目录
**方法二**：使用符号链接
**方法三**：创建项目间共享的 Skill 目录

### 8. 如何配置 MCP 服务器？
1. 复制 `config/mcp-server-config.json` 到 Claude Desktop MCP 配置目录
2. 安装依赖：`npm install`
3. 启动服务器：`node tools/mcp-server.js`
4. 在 Claude Desktop 中启用 MCP

## 使用问题

### 9. 如何在对话中使用 Skill？
在对话中直接引用 Skill 文件名：
```
请按照 form-generator.skill.md 规范，生成登录表单
```

或使用配置的别名：
```
请使用 form 技能创建产品表单
```

### 10. 如何创建新的 Skill？
```bash
# 交互式创建
node tools/generate-skill.js

# 快速创建
node tools/generate-skill.js "我的Skill名称" detailed

# 基于模板创建
cp templates/detailed-skill.md .claude/skills/my-skill.skill.md
```

### 11. 如何验证 Skill 文件格式？
```bash
# 验证单个文件
node tools/validate-skill.js ./my-skill.skill.md

# 验证目录下所有文件
node tools/validate-skill.js --dir ./.claude/skills

# 集成到 CI/CD
# 在 GitHub Actions 或 GitLab CI 中添加验证步骤
```

### 12. 一个项目可以使用多个 Skill 吗？
可以，Claude 会读取目录中的所有 Skill 文件。你可以在对话中指定使用哪个 Skill。

### 13. 如何更新已有的 Skill？
1. 编辑 Skill 文件
2. 运行验证工具确保格式正确
3. 重启 Claude Desktop（如果 Skill 已缓存）
4. 或使用开发模式自动重载

## 技术问题

### 14. Skill.md 支持哪些技术栈？
核心 Skill 支持：
- React 18 + TypeScript
- Ant Design 5.x
- React Hook Form + Zod
- React Query
- React Router v6

你可以创建支持其他技术栈的 Skill。

### 15. 如何添加对新框架的支持？
1. 复制现有 Skill 模板
2. 修改技术栈约定部分
3. 更新代码示例和模板
4. 测试生成结果
5. 添加到 Skill 库

### 16. Skill 文件有大小限制吗？
没有硬性限制，但建议：
- 单个 Skill 文件不超过 5000 行
- 复杂规范拆分为多个 Skill
- 使用引用和懒加载技术

### 17. 如何处理 Skill 之间的冲突？
当多个 Skill 有冲突规则时：
1. **明确指定**：在对话中明确使用哪个 Skill
2. **优先级**：后加载的 Skill 覆盖先加载的
3. **合并规则**：创建组合 Skill 解决冲突
4. **项目配置**：在项目级配置 Skill 优先级

### 18. Skill.md 支持国际化吗？
支持，可以通过以下方式：
1. 创建多语言 Skill 文件
2. 在 Skill 中添加语言切换逻辑
3. 使用变量系统处理翻译
4. 创建语言特定的 Skill 变体

## 最佳实践

### 19. 编写 Skill 的最佳实践是什么？
1. **结构清晰**：使用标准章节结构
2. **示例丰富**：包含完整可运行的代码示例
3. **版本控制**：记录 Skill 更新历史
4. **测试验证**：确保生成的代码能正常工作
5. **定期更新**：随技术栈更新 Skill

### 20. 如何组织大型项目的 Skill？
```
.claude/skills/
├── foundation/           # 基础规范
│   ├── code-style.skill.md
│   └── typescript.skill.md
├── components/           # 组件规范
│   ├── ui-components.skill.md
│   └── form-components.skill.md
├── features/             # 功能模块
│   ├── auth.skill.md
│   └── user-management.skill.md
└── project-specific/     # 项目特定
    └── my-project.skill.md
```

### 21. 如何保证生成的代码质量？
1. **详细规范**：在 Skill 中定义明确的质量标准
2. **代码审查**：AI 生成后仍需人工审查
3. **自动化测试**：为生成的代码添加测试
4. **持续改进**：根据使用反馈优化 Skill

### 22. 团队如何协作开发 Skill？
1. **版本控制**：Skill 文件纳入 Git 管理
2. **代码审查**：Skill 变更需要团队评审
3. **文档化**：记录 Skill 设计和决策
4. **培训**：新成员学习使用 Skill
5. **反馈机制**：收集使用问题并改进

## 故障排除

### 23. Claude 找不到 Skill 文件
**可能原因**：
1. 文件不在正确目录
2. 文件扩展名不是 .skill.md
3. Claude 缓存了旧版本
4. 配置文件路径错误

**解决方案**：
1. 确认文件位置：`ls -la ~/.claude/skills/`
2. 确认扩展名：`.skill.md`
3. 重启 Claude Desktop
4. 检查配置文件路径

### 24. Skill 不生效，生成的代码不符合规范
**可能原因**：
1. Skill 文件格式错误
2. 规范描述不清晰
3. AI 理解有偏差
4. 多个 Skill 冲突

**解决方案**：
1. 运行验证工具：`node tools/validate-skill.js <skill-file>`
2. 优化 Skill 描述，添加更多示例
3. 在对话中更明确地指定要求
4. 检查是否有冲突的 Skill

### 25. Skill 文件太大，加载缓慢
**可能原因**：
1. 单个文件包含太多内容
2. 代码示例过多
3. 图片等资源太大

**解决方案**：
1. 拆分为多个 Skill 文件
2. 使用引用和包含语法
3. 压缩图片资源
4. 启用 Skill 缓存

### 26. 生成的代码有安全风险
**可能原因**：
1. Skill 中包含敏感信息
2. 代码示例不安全
3. 缺少安全规范

**解决方案**：
1. 检查 Skill 文件，移除敏感信息
2. 添加安全最佳实践章节
3. 使用环境变量代替硬编码
4. 运行安全扫描工具

### 27. MCP 服务器无法连接
**可能原因**：
1. 服务器未启动
2. 端口冲突
3. 配置文件错误
4. 权限问题

**解决方案**：
1. 检查服务器状态：`ps aux | grep mcp`
2. 检查端口占用：`netstat -tulpn | grep 3001`
3. 验证配置文件格式
4. 检查文件权限

### 28. 在不同操作系统上表现不一致
**可能原因**：
1. 路径分隔符不同
2. 行结束符不同
3. 环境变量差异
4. 工具版本不同

**解决方案**：
1. 使用 `path.join()` 处理路径
2. 统一使用 LF 行结束符
3. 明确环境要求
4. 指定工具版本范围

## 性能优化

### 29. 如何提高 Skill 加载速度？
1. **缓存**：启用 Claude Desktop 的 Skill 缓存
2. **懒加载**：将大型 Skill 拆分为多个部分
3. **压缩**：移除不必要的空白和注释
4. **预加载**：在配置中指定常用 Skill

### 30. 如何处理大量 Skill 文件？
1. **分类存储**：按功能或项目分类
2. **索引文件**：创建 Skill 索引文件
3. **搜索功能**：实现 Skill 搜索工具
4. **按需加载**：只加载需要的 Skill

## 社区与支持

### 31. 在哪里可以获得帮助？
1. **文档**：查阅本仓库的 docs/ 目录
2. **示例**：参考 examples/ 目录的完整示例
3. **问题追踪**：在 GitHub 仓库提交 Issue
4. **社区讨论**：参与相关技术社区

### 32. 如何贡献 Skill？
1. Fork 本仓库
2. 创建新分支
3. 添加或改进 Skill
4. 提交 Pull Request
5. 通过代码审查

### 33. 有 Skill 模板市场吗？
目前还没有官方的 Skill 市场，但你可以：
1. 分享你的 Skill 到技术社区
2. 在 GitHub 创建 Skill 集合仓库
3. 参与开源项目贡献 Skill
4. 关注 Skill.md 生态发展

### 34. Skill.md 的未来发展计划？
1. **标准化**：统一的 Skill 格式规范
2. **工具集成**：更多 IDE 和编辑器支持
3. **社区生态**：Skill 共享和协作平台
4. **AI 优化**：更好的 AI 理解和生成能力

---

如果这里没有解答你的问题，请：
1. 查看详细文档：`docs/getting-started.md` 和 `docs/advanced-usage.md`
2. 参考完整示例：`examples/` 目录
3. 使用工具验证：`tools/validate-skill.js`
4. 在 GitHub 仓库提交 Issue