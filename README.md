# Skill.md 库

一个开源的AI技能文件库，帮助开发者创建和使用Skill.md文件来标准化AI辅助开发。

## 什么是Skill.md？

Skill.md是一种给AI提供"工作手册"的方式。就像入职新公司时拿到的《开发规范文档》，Skill.md告诉AI：

- 项目如何组织代码
- 有哪些约定俗成的规矩
- 常见业务怎么处理
- 代码写成什么样才算合格

**核心价值：一次配置，持续复用。**

不用每次都重复说"我用React 18"、"组件要写在components文件夹"，AI读了Skill.md就全懂了。

## Skill.md vs Prompt的区别

| 对比维度 | Prompt | Skill.md |
| --- | --- | --- |
| 使用时机 | 每次对话都要写 | 写一次，长期使用 |
| 内容性质 | 具体任务描述 | 通用规范和知识 |
| 适用场景 | "帮我生成一个登录页" | "我们项目所有页面的开发规范" |
| 更新频率 | 随需求变化 | 技术栈变更时才改 |
| 典型长度 | 100-500字 | 1000-5000字 |

## 本库包含的内容

### 1. 核心Skill文件
- **form-generator.skill.md** - React表单组件生成规范
- **crud-template.skill.md** - CRUD业务模板生成器
- **code-standard.skill.md** - 代码规范标准
- **component-wrapper.skill.md** - UI组件封装规范

### 2. 使用示例
- **表单生成示例** - 商品表单、用户表单
- **CRUD模板示例** - 用户管理模块
- **代码规范示例** - 实际项目中的应用

### 3. 快速启动模板
- **minimal-skill.md** - 最小Skill模板
- **detailed-skill.md** - 详细Skill模板
- **team-standard.md** - 团队规范模板

### 4. 工具和配置
- Skill文件验证工具
- Claude Desktop配置示例
- MCP服务器配置

## 快速开始

### 方法一：直接使用Skill文件
1. 复制`.claude/skills/`目录下的Skill文件到你的项目
2. 在Claude对话中引用这些文件
3. AI会按照规范生成代码

### 方法二：配置Claude Desktop自动加载
1. 编辑Claude Desktop配置文件：
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. 添加MCP配置：
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/project/.claude/skills"]
    }
  }
}
```

3. 重启Claude Desktop

### 方法三：自定义Skill文件
1. 参考`templates/`目录下的模板
2. 根据你的项目技术栈修改
3. 添加到`.claude/skills/`目录

## 使用示例

### 生成表单组件
```
请按照 form-generator.skill.md 的规范，生成一个用户注册表单。

字段：
- 用户名（3-20字符）
- 邮箱
- 密码（8-20字符）
- 确认密码（需要和密码一致）
```

### 生成CRUD模块
```
请按照 crud-template.skill.md 的规范，生成一个商品管理模块。

列表页筛选条件：
- 商品名称搜索
- 分类筛选
- 状态筛选

列表展示字段：
- 商品ID
- 商品名称
- 价格
- 库存
- 状态
```

## 目录结构

```
skill-library/
├── .claude/skills/           # 核心Skill文件
├── examples/                 # 使用示例
├── templates/                # 快速启动模板
├── docs/                     # 文档
├── tools/                    # 工具脚本
└── config/                   # 配置示例
```

## 技术栈支持

当前Skill文件主要面向以下技术栈：
- **前端**: React 18 + TypeScript
- **UI库**: Ant Design 5.x
- **表单**: react-hook-form + Zod
- **状态管理**: Zustand / React Query
- **路由**: React Router v6

你可以根据项目实际情况修改Skill文件。

## 贡献指南

1. Fork本仓库
2. 创建你的分支 (`git checkout -b feature/amazing-skill`)
3. 提交更改 (`git commit -m 'Add some amazing skill'`)
4. 推送到分支 (`git push origin feature/amazing-skill`)
5. 打开Pull Request

欢迎贡献新的Skill文件、示例或改进建议！

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 问题反馈

如果在使用过程中遇到问题或有改进建议，请提交 [Issue](https://github.com/yourusername/skill-library/issues)。

---

**提示**: Skill.md是团队协作的利器，把团队经验变成可执行的文档，让AI成为你的得力助手！