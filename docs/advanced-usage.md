# 高级用法

本文档介绍 Skill.md 库的高级功能和定制方法。

## 目录
- [Skill 组合使用](#skill-组合使用)
- [自定义 Skill 模板](#自定义-skill-模板)
- [MCP 服务器集成](#mcp-服务器集成)
- [CI/CD 集成](#cicd-集成)
- [多项目管理](#多项目管理)
- [性能优化](#性能优化)
- [安全最佳实践](#安全最佳实践)

## Skill 组合使用

### 1. 链式调用
多个 Skill 可以组合使用，实现复杂功能：

```
请按照以下顺序使用 Skill：
1. 使用 form-generator.skill.md 生成用户表单
2. 使用 code-standard.skill.md 检查代码质量
3. 使用 component-wrapper.skill.md 优化组件样式
```

### 2. 条件逻辑
在 Skill 中添加条件判断：

```markdown
## 输出要求

根据项目类型选择不同的实现：

### React 项目
```typescript
// React 实现
export function Component() { ... }
```

### Vue 项目
```vue
<!-- Vue 实现 -->
<template>
  <div>...</div>
</template>
```
```

### 3. 参数化 Skill
创建可配置的 Skill 模板：

```markdown
## 配置参数

### UI 库选择
- antd: 使用 Ant Design 组件
- mui: 使用 Material-UI 组件
- chakra: 使用 Chakra UI 组件

### 验证库选择
- zod: 使用 Zod 验证
- yup: 使用 Yup 验证
- joi: 使用 Joi 验证
```

## 自定义 Skill 模板

### 1. 创建项目特定模板
基于详细模板创建项目专用模板：

```bash
# 复制模板
cp templates/detailed-skill.md templates/my-project-template.md

# 修改为项目特定内容
# 1. 添加项目技术栈
# 2. 添加项目目录结构
# 3. 添加项目特定规范
```

### 2. 模板变量系统
使用变量系统创建动态模板：

```markdown
# Skill: {{skillName}}

## 技术栈约定
- 框架: {{framework}} {{frameworkVersion}}
- UI 库: {{uiLibrary}} {{uiLibraryVersion}}
- 验证: {{validationLibrary}}

## 文件结构
{{#if isMonorepo}}
```
packages/
├── web/
├── mobile/
└── shared/
```
{{else}}
```
src/
├── components/
├── pages/
└── utils/
```
{{/if}}
```

### 3. 继承与扩展
创建基础模板和扩展模板：

**base-template.md**（基础模板）：
```markdown
# Skill: 基础规范

## 通用规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 编写单元测试
```

**react-template.md**（扩展模板）：
```markdown
# Skill: React 开发规范

{{> base-template}}

## React 特定规范
- 使用函数组件
- 合理使用 Hooks
- 避免不必要的 re-render
```

## MCP 服务器集成

### 1. 搭建 MCP 服务器
创建自定义 MCP 服务器管理 Skill：

```javascript
// mcp-server.js
const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');

const server = new Server({
  name: 'skill-manager',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {
      listSkills: {
        description: '列出所有 Skill 文件'
      },
      getSkill: {
        description: '获取 Skill 内容'
      }
    }
  }
});

// 实现工具方法
server.setRequestHandler('tools/listSkills', async () => {
  const skills = await listSkillsFromDirectory();
  return { skills };
});
```

### 2. Skill 管理 API
通过 API 管理 Skill 文件：

```typescript
interface SkillAPI {
  // 获取 Skill 列表
  listSkills(filter?: SkillFilter): Promise<Skill[]>;

  // 获取 Skill 详情
  getSkill(name: string): Promise<SkillDetail>;

  // 创建新 Skill
  createSkill(data: CreateSkillData): Promise<Skill>;

  // 更新 Skill
  updateSkill(name: string, data: UpdateSkillData): Promise<Skill>;

  // 验证 Skill
  validateSkill(name: string): Promise<ValidationResult>;
}
```

### 3. 实时 Skill 更新
实现热重载功能：

```javascript
// 监控 Skill 文件变化
const chokidar = require('chokidar');
const watcher = chokidar.watch('.claude/skills/**/*.skill.md', {
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', path => console.log(`Skill 添加: ${path}`))
  .on('change', path => console.log(`Skill 更新: ${path}`))
  .on('unlink', path => console.log(`Skill 删除: ${path}`));
```

## CI/CD 集成

### 1. GitHub Actions 集成
将 Skill 验证加入 CI 流程：

```yaml
name: Validate Skills

on:
  push:
    paths:
      - '.claude/skills/**'
      - 'templates/**'
  pull_request:
    paths:
      - '.claude/skills/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: 验证 Skill 文件
        run: |
          npm ci
          node tools/validate-skill.js --dir .claude/skills

      - name: 生成文档
        run: |
          node tools/generate-docs.js

      - name: 上传验证报告
        uses: actions/upload-artifact@v4
        with:
          name: skill-validation-report
          path: validation-report.json
```

### 2. Skill 版本管理
使用语义化版本管理 Skill：

```json
{
  "name": "form-generator.skill",
  "version": "2.1.0",
  "changelog": {
    "2.1.0": "添加 Vue 3 支持",
    "2.0.0": "重构表单验证系统",
    "1.0.0": "初始版本"
  },
  "compatibility": {
    "react": ">=16.8.0",
    "typescript": ">=4.0.0"
  }
}
```

### 3. 自动化测试
为 Skill 创建测试套件：

```typescript
describe('Form Generator Skill', () => {
  test('应该生成有效的表单组件', async () => {
    const skill = await loadSkill('form-generator.skill.md');
    const result = await generateForm(skill, {
      fields: ['username', 'email', 'password']
    });

    expect(result.code).toMatch(/interface FormData/);
    expect(result.code).toMatch(/useForm</);
    expect(result.files).toHaveLength(3); // index.tsx, schema.ts, types.ts
  });
});
```

## 多项目管理

### 1. 全局 Skill 配置
创建全局 Skill 配置文件：

```json
{
  "globalSkills": {
    "paths": [
      "~/.claude/global-skills",
      "/etc/claude/skills"
    ],
    "defaultSkills": [
      "code-standards.skill.md",
      "security-guidelines.skill.md"
    ]
  },
  "projectOverrides": {
    "my-react-app": {
      "skills": ["react-best-practices.skill.md"],
      "exclude": ["vue-specific.skill.md"]
    }
  }
}
```

### 2. Skill 继承链
配置 Skill 继承关系：

```yaml
skill-inheritance:
  company-standard.skill.md:
    base: industry-standard.skill.md
    overrides:
      - coding-guidelines

  project-specific.skill.md:
    base: company-standard.skill.md
    adds:
      - project-structure
      - api-conventions
```

### 3. 环境特定 Skill
根据环境使用不同 Skill：

```javascript
// 根据环境加载 Skill
function loadEnvironmentSpecificSkills() {
  const env = process.env.NODE_ENV || 'development';

  const baseSkills = ['code-standard.skill.md'];
  const envSkills = {
    development: ['dev-guidelines.skill.md'],
    test: ['test-standards.skill.md'],
    production: ['prod-guidelines.skill.md']
  };

  return [...baseSkills, ...(envSkills[env] || [])];
}
```

## 性能优化

### 1. Skill 文件优化
优化大型 Skill 文件：

```markdown
<!-- 将大型 Skill 拆分为多个文件 -->
## 核心规范
<!-- 引用子文件 -->
{{> includes/naming-conventions.md}}
{{> includes/typescript-rules.md}}
{{> includes/react-guidelines.md}}

<!-- 按需加载部分 -->
## 高级功能（可选）
{{#if includeAdvanced}}
{{> includes/advanced-patterns.md}}
{{/if}}
```

### 2. 缓存策略
实现 Skill 缓存：

```typescript
class SkillCache {
  private cache = new Map<string, { data: SkillData; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5分钟

  async getSkill(name: string): Promise<SkillData> {
    const cached = this.cache.get(name);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const data = await loadSkillFromDisk(name);
    this.cache.set(name, { data, timestamp: Date.now() });
    return data;
  }

  clear(): void {
    this.cache.clear();
  }
}
```

### 3. 懒加载
按需加载 Skill 部分：

```markdown
## 表单字段类型（懒加载）

{{lazy-load}}
### 基础字段
- 文本输入
- 数字输入
- 选择器

### 高级字段
- 富文本编辑器
- 文件上传
- 日期范围选择器
{{/lazy-load}}
```

## 安全最佳实践

### 1. Skill 文件安全
保护敏感信息：

```markdown
# 安全注意事项

## 不要包含
- ❌ API 密钥、密码等敏感信息
- ❌ 服务器内部地址
- ❌ 数据库连接字符串
- ❌ 个人身份信息

## 安全示例
```typescript
// ✅ 安全：使用环境变量
const apiUrl = process.env.REACT_APP_API_URL;

// ❌ 不安全：硬编码敏感信息
const apiKey = 'sk_live_1234567890abcdef';
```
```

### 2. 输入验证
验证 Skill 输入内容：

```javascript
function validateSkillContent(content) {
  const blacklist = [
    /process\.env\.([A-Z_]+)/g,
    /(password|secret|key|token)=['"][^'"]+['"]/gi,
    /(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1]))/g
  ];

  for (const pattern of blacklist) {
    if (pattern.test(content)) {
      throw new Error('Skill 包含潜在的安全风险');
    }
  }

  return true;
}
```

### 3. 权限控制
控制 Skill 访问权限：

```yaml
skill-permissions:
  public-skills:
    - code-standards.skill.md
    - ui-guidelines.skill.md

  team-skills:
    - internal-apis.skill.md
    - deployment-guide.skill.md
    require: team-member

  admin-skills:
    - security-guidelines.skill.md
    - infrastructure.skill.md
    require: admin
```

## 扩展开发

### 1. 开发插件系统
创建 Skill 插件架构：

```typescript
interface SkillPlugin {
  name: string;
  version: string;

  // 处理 Skill 内容
  process(content: string, context: PluginContext): Promise<string>;

  // 验证 Skill
  validate(content: string): ValidationResult[];
}

// 注册插件
const pluginManager = new PluginManager();
pluginManager.register(new TemplatePlugin());
pluginManager.register(new ValidationPlugin());
pluginManager.register(new SecurityPlugin());
```

### 2. IDE 集成
开发 IDE 扩展：

```json
{
  "contributes": {
    "commands": [
      {
        "command": "skill-library.generateForm",
        "title": "生成表单组件"
      }
    ],
    "configuration": {
      "skillLibrary.skillPath": {
        "type": "string",
        "default": ".claude/skills",
        "description": "Skill 文件路径"
      }
    }
  }
}
```

### 3. 社区贡献
建立 Skill 共享机制：

```yaml
skill-marketplace:
  publish:
    command: skill publish <skill-name>
    requirements:
      - 通过验证测试
      - 包含完整文档
      - 有测试用例

  discover:
    endpoint: https://skills.example.com/api/v1
    categories:
      - form-generators
      - crud-templates
      - ui-components
      - code-standards
```

---

通过以上高级功能，你可以将 Skill.md 库集成到复杂的开发工作流中，实现自动化、安全、高效的代码生成和管理。