# Skill: 团队开发规范

## 团队信息

### 团队名称
[团队名称]

### 技术负责人
- 姓名：[负责人姓名]
- 邮箱：[邮箱地址]
- 职责：[负责内容]

### 团队成员
| 姓名 | 角色 | 负责模块 | 联系方式 |
|------|------|----------|----------|
| [姓名1] | [角色1] | [模块1] | [联系方式] |
| [姓名2] | [角色2] | [模块2] | [联系方式] |

## 开发流程

### 分支管理策略
- **主分支**：`main`/`master`，保护分支，只接受PR合并
- **开发分支**：`develop`，日常开发集成
- **功能分支**：`feature/功能名称`，从develop拉取
- **修复分支**：`fix/问题描述`，从develop拉取
- **发布分支**：`release/版本号`，从develop拉取

### Git提交规范
```
类型(范围): 描述

正文（可选）

脚注（可选）
```

**类型**：
- `feat`：新功能
- `fix`：bug修复
- `docs`：文档更新
- `style`：代码格式调整
- `refactor`：代码重构
- `test`：测试相关
- `chore`：构建/工具更新

**示例**：
```
feat(user): 添加用户登录功能

- 实现手机号登录
- 添加登录验证
- 添加错误处理

Closes #123
```

### 代码审查流程
1. 创建PR，描述更改内容
2. 至少2名团队成员审查
3. 通过所有自动化检查
4. 解决审查意见
5. 合并到目标分支

## 项目配置

### 编辑器配置
```json
// .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

### IDE插件推荐
- **VSCode**：
  - ESLint
  - Prettier
  - TypeScript Hero
  - GitLens
  - Auto Rename Tag

### 代码格式化配置
```json
// .prettierrc
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## 技术栈规范

### 前端技术栈
| 技术领域 | 技术选型 | 版本 | 备注 |
|----------|----------|------|------|
| 框架 | React | 18.x | 函数式组件 |
| 语言 | TypeScript | 5.x | 严格模式 |
| UI库 | Ant Design | 5.x | 主题定制 |
| 路由 | React Router | 6.x | |
| 状态管理 | Zustand | 4.x | 轻量级 |
| 数据请求 | React Query | 5.x | 服务端状态 |
| 表单 | react-hook-form + Zod | 7.x + 3.x | |
| 样式 | CSS Modules | | 或styled-components |
| 测试 | Jest + React Testing Library | | 单元测试 |
| E2E测试 | Cypress | | 端到端测试 |

### 后端技术栈
| 技术领域 | 技术选型 | 版本 | 备注 |
|----------|----------|------|------|
| 框架 | NestJS | 10.x | |
| 语言 | TypeScript | 5.x | |
| 数据库 | PostgreSQL | 15.x | 或MySQL |
| ORM | Prisma | 5.x | |
| 缓存 | Redis | 7.x | |
| 消息队列 | RabbitMQ | | 可选 |
| API文档 | Swagger/OpenAPI | | |

## 代码质量

### 代码审查清单
审查PR时检查以下项目：

#### 功能性
- [ ] 功能按需求实现
- [ ] 没有引入bug
- [ ] 边界情况已处理

#### 代码质量
- [ ] 命名清晰易懂
- [ ] 函数单一职责
- [ ] 没有重复代码
- [ ] 注释清晰必要

#### 性能
- [ ] 没有内存泄漏
- [ ] 渲染性能优化
- [ ] 请求合理缓存

#### 安全性
- [ ] 没有XSS漏洞
- [ ] 输入验证完善
- [ ] 敏感信息保护

#### 测试
- [ ] 单元测试覆盖
- [ ] 集成测试通过
- [ ] 测试用例清晰

### 代码度量标准
- **圈复杂度**：< 10
- **代码重复率**：< 5%
- **测试覆盖率**：
  - 语句覆盖率：> 80%
  - 分支覆盖率：> 70%
  - 函数覆盖率：> 90%

## 文档规范

### README规范
每个项目必须包含：
```
# 项目名称

## 项目描述
[简要描述]

## 技术栈
[技术栈列表]

## 快速开始
[安装运行步骤]

## 项目结构
[目录结构说明]

## 开发指南
[开发相关说明]

## 部署说明
[部署步骤]

## 贡献指南
[如何贡献]
```

### API文档规范
```typescript
/**
 * 获取用户列表
 * @param params - 查询参数
 * @param params.pageNum - 页码，默认1
 * @param params.pageSize - 每页数量，默认20
 * @param params.keyword - 搜索关键词
 * @returns 用户列表和总数
 * @throws 401 - 未授权
 * @throws 500 - 服务器错误
 * @example
 * const { list, total } = await fetchUserList({ pageNum: 1, pageSize: 20 });
 */
export async function fetchUserList(params: ListParams): Promise<ListResponse> {
  // 实现
}
```

### 组件文档规范
```typescript
/**
 * 用户卡片组件
 * @param user - 用户信息
 * @param onEdit - 编辑回调
 * @param onDelete - 删除回调
 * @param className - 自定义样式类
 * @example
 * <UserCard
 *   user={user}
 *   onEdit={() => console.log('edit')}
 *   onDelete={() => console.log('delete')}
 * />
 */
export default function UserCard({
  user,
  onEdit,
  onDelete,
  className,
}: UserCardProps) {
  // 实现
}
```

## 测试规范

### 单元测试
```typescript
// 测试文件结构
describe('模块名称', () => {
  describe('功能描述', () => {
    beforeEach(() => {
      // 初始化
    });

    it('测试用例描述', () => {
      // 准备
      const input = '输入';

      // 执行
      const result = functionToTest(input);

      // 断言
      expect(result).toBe('期望输出');
    });

    it('边界情况测试', () => {
      // 测试边界情况
    });
  });
});
```

### 测试数据管理
```typescript
// __tests__/fixtures/user.ts
export const mockUser = {
  id: '1',
  name: '测试用户',
  email: 'test@example.com',
  role: 'admin',
};

export const mockUserList = [
  mockUser,
  // 更多测试数据
];
```

## 部署规范

### 环境配置
| 环境 | 地址 | 数据库 | 用途 |
|------|------|--------|------|
| 开发 | http://dev.example.com | dev_db | 日常开发 |
| 测试 | http://test.example.com | test_db | 功能测试 |
| 预发布 | http://stag.example.com | stag_db | 回归测试 |
| 生产 | http://prod.example.com | prod_db | 线上环境 |

### 部署流程
1. **开发环境**：自动部署（每次提交到develop）
2. **测试环境**：手动触发（功能测试通过后）
3. **预发布环境**：手动触发（回归测试）
4. **生产环境**：手动触发（领导审批后）

### 回滚策略
- 发现问题后15分钟内回滚
- 保留最近3个版本的备份
- 回滚后立即通知相关人员

## 监控与日志

### 前端监控
- 错误监控：Sentry
- 性能监控：Lighthouse
- 用户行为：Google Analytics

### 日志规范
```typescript
// 日志级别
logger.debug('调试信息');    // 开发阶段
logger.info('普通信息');     // 正常操作
logger.warn('警告信息');     // 潜在问题
logger.error('错误信息');    // 错误情况

// 结构化日志
logger.info('用户登录', {
  userId: '123',
  loginTime: new Date(),
  userAgent: navigator.userAgent,
});
```

## 沟通协作

### 日常沟通
- **晨会**：每日9:30，同步进度和问题
- **周会**：每周一10:00，总结和计划
- **技术分享**：每月一次，分享新技术

### 工具使用
- **项目管理**：Jira/Trello
- **文档协作**：Notion/Confluence
- **即时通讯**：Slack/钉钉
- **代码托管**：GitHub/GitLab

### 问题处理流程
1. **发现问题**：记录到问题跟踪系统
2. **分析问题**：确定影响范围和优先级
3. **分配任务**：指定负责人和截止时间
4. **解决问题**：编码、测试、部署
5. **验证结果**：确认问题已解决
6. **总结经验**：记录到知识库

## 更新记录

### 版本历史
| 版本 | 日期 | 更新内容 | 负责人 |
|------|------|----------|--------|
| v1.0.0 | 2024-01-01 | 初始版本 | [姓名] |
| v1.1.0 | 2024-02-01 | 新增代码审查流程 | [姓名] |

### 规范更新流程
1. 提出更新建议
2. 团队讨论通过
3. 更新文档
4. 通知团队成员
5. 培训新规范