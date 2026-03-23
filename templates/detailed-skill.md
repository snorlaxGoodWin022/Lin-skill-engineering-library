# Skill: [技能名称]

## 使用场景
什么情况下使用这个Skill？解决什么问题？

### 适用场景
- 场景1：...
- 场景2：...
- 场景3：...

### 不适用场景
- 场景A：...
- 场景B：...

## 技术栈约定

### 核心依赖
- 框架：[框架名称] [版本]
- UI库：[UI库名称] [版本]
- 状态管理：[状态管理方案]
- 路由：[路由方案]
- 其他：[其他依赖]

### 开发环境要求
- Node.js版本：>= 18.0.0
- 包管理器：npm/yarn/pnpm
- IDE推荐：VSCode + 插件列表

### 构建工具配置
```json
// 示例配置
{
  "compilerOptions": {
    // TypeScript配置
  }
}
```

## 项目结构规范

### 目录结构
```
src/
├── components/          # 公共组件
│   ├── Common/         # 通用组件
│   └── Business/       # 业务组件
├── pages/              # 页面组件
│   ├── ModuleName/     # 业务模块
│   └── Layout/         # 布局组件
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
├── services/           # API服务
├── stores/             # 状态管理
├── types/              # 类型定义
├── constants/          # 常量配置
└── assets/             # 静态资源
```

### 文件命名规范
- 组件文件：PascalCase.tsx
- Hook文件：useCamelCase.ts
- 工具文件：camelCase.ts
- 类型文件：camelCase.types.ts
- 常量文件：UPPER_SNAKE_CASE.ts

## 代码规范

### 命名规范
1. **变量命名**：camelCase
2. **常量命名**：UPPER_SNAKE_CASE
3. **函数命名**：动词开头，camelCase
4. **组件命名**：PascalCase
5. **类型命名**：PascalCase，不加I前缀

### 代码风格
1. 使用箭头函数（React组件除外）
2. 优先使用解构赋值
3. 使用可选链（?.）和空值合并（??）
4. 使用模板字符串
5. 避免嵌套过深（最多3层）

### TypeScript规范
1. 禁止使用any类型
2. 所有导出必须有类型定义
3. 使用interface定义对象类型
4. 使用type定义联合类型
5. 泛型参数使用单个大写字母

### React规范
1. 组件单一职责
2. 优先使用函数组件
3. 合理使用Hooks
4. 列表必须加key
5. 避免不必要的re-render

## 业务逻辑模板

### 通用模式1：[模式名称]
```typescript
// 代码模板
export function templateFunction(params: Params): Result {
  // 实现逻辑
}
```

### 通用模式2：[模式名称]
```typescript
// 代码模板
export const TemplateComponent: React.FC<Props> = (props) => {
  // 组件实现
};
```

### 错误处理模板
```typescript
// 统一错误处理
async function fetchData() {
  try {
    // 业务逻辑
  } catch (error) {
    // 错误处理
    console.error('Error:', error);
    throw error;
  }
}
```

## 常见场景处理

### 场景1：[常见场景]
**问题描述**：...

**解决方案**：
```typescript
// 解决代码
function handleScenario1() {
  // 实现
}
```

### 场景2：[常见场景]
**问题描述**：...

**解决方案**：
```typescript
// 解决代码
function handleScenario2() {
  // 实现
}
```

### 场景3：[常见场景]
**问题描述**：...

**解决方案**：
```typescript
// 解决代码
function handleScenario3() {
  // 实现
}
```

## 测试规范

### 单元测试
```typescript
// 测试示例
describe('FunctionName', () => {
  it('should work correctly', () => {
    // 测试逻辑
  });
});
```

### 组件测试
```typescript
// 测试示例
describe('ComponentName', () => {
  it('should render correctly', () => {
    // 渲染测试
  });
});
```

## 部署配置

### 构建配置
```javascript
// 构建脚本
module.exports = {
  // 配置项
};
```

### 环境变量
```env
# 环境变量示例
API_URL=https://api.example.com
ENV=production
```

## 版本更新记录

### v1.0.0 - YYYY-MM-DD
- 功能1：...
- 功能2：...
- 修复：...

### v0.1.0 - YYYY-MM-DD
- 初始版本

## 输出要求

AI生成代码时必须遵守以下要求：

### 必须遵守
1. 遵循所有命名规范
2. 使用指定的技术栈
3. 按照项目结构组织代码
4. 包含完整的类型定义
5. 添加必要的错误处理

### 质量检查清单
- [ ] 代码格式正确
- [ ] 类型定义完整
- [ ] 错误处理完善
- [ ] 注释清晰
- [ ] 测试覆盖

### 常见错误避免
1. 不要使用已废弃的API
2. 不要引入不必要的依赖
3. 不要写重复代码
4. 不要忽略性能问题
5. 不要暴露敏感信息