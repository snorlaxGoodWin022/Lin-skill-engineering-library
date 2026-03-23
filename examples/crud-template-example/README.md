# CRUD模板示例：用户管理

本示例演示如何使用 `crud-template.skill.md` 规范生成一个完整的用户管理CRUD模块。

## 示例结构

```
UserManagement/
├── pages/
│   ├── ListPage.tsx          # 列表页面
│   └── ListPage.module.css   # 列表页面样式
├── hooks/
│   └── useUserList.ts        # 用户列表Hook
├── types.ts                  # TypeScript类型定义
└── mocks/
    └── user.ts               # 模拟数据
```

## 技术栈

- **React 18** + **TypeScript** - 组件开发
- **Ant Design 5.x** - UI组件库
- **React Query** (示例中为自定义Hook) - 数据管理
- **CSS Modules** - 样式隔离

## 功能特性

### 1. 完整的数据列表
- 分页查询
- 多条件筛选（关键词、状态、日期范围）
- 排序支持
- 数据懒加载

### 2. 丰富的表格功能
- 行选择（单选/多选）
- 批量操作
- 自定义列渲染
- 状态标签显示
- 操作列（编辑、删除）

### 3. 用户友好的交互
- 加载状态指示
- 空状态显示
- 操作确认对话框
- 错误提示
- 响应式设计

## 使用方式

### 1. 安装依赖
```bash
npm install antd @ant-design/icons dayjs
```

### 2. 导入组件
```typescript
import ListPage from './UserManagement/pages/ListPage';

function App() {
  return (
    <div>
      <ListPage />
    </div>
  );
}
```

### 3. 集成API服务
修改 `useUserList.ts` 中的 `fetchUserList` 函数，连接真实API：
```typescript
const fetchUserList = async (params: ListQueryParams): Promise<ListResponse<User>> => {
  const response = await axios.get('/api/users', {
    params: useUserListUtils.formatQueryParams(params),
  });
  return useUserListUtils.parseResponse(response.data);
};
```

## 核心组件

### ListPage 列表页面
- 筛选工具栏：搜索框、状态筛选、日期范围筛选
- 数据表格：分页、排序、行选择
- 操作按钮：新建、批量删除
- 确认对话框：删除确认

### useUserList Hook
- 数据获取：支持查询参数
- 状态管理：loading、error、data
- 操作方法：刷新、重新加载、CRUD操作
- 工具函数：参数格式化、响应解析、验证

### 类型系统
- 完整TypeScript类型定义
- 接口响应类型
- 查询参数类型
- 表格配置类型

## 筛选功能

### 关键词搜索
- 支持用户名和邮箱搜索
- 实时搜索（防抖优化）
- 搜索历史记录

### 状态筛选
- 活跃用户
- 未激活用户
- 禁用用户

### 日期范围筛选
- 创建时间范围查询
- 最多90天查询限制
- 日期格式验证

## 表格功能

### 列配置
- 固定列（用户ID、用户名）
- 自定义渲染列（角色、状态标签）
- 操作列（编辑、删除按钮）

### 行选择
- 单选/多选模式
- 跨页保持选择
- 批量操作计数

### 分页
- 自定义每页数量
- 快速跳转
- 总数显示

## 批量操作

### 批量删除
- 选择多个用户后批量删除
- 删除前确认
- 操作结果反馈

### 扩展支持
可添加更多批量操作：
- 批量激活/禁用
- 批量导出
- 批量分配角色

## 最佳实践

### 1. 性能优化
- 虚拟滚动（大数据量）
- 分页查询（避免一次加载过多数据）
- 防抖搜索（减少API调用）
- 缓存策略（React Query）

### 2. 错误处理
```typescript
try {
  await batchDeleteUsers(selectedUserIds);
  message.success('删除成功');
} catch (error) {
  message.error('删除失败');
  // 记录错误日志
  console.error('批量删除失败:', error);
}
```

### 3. 可访问性
- 键盘导航支持
- ARIA标签
- 屏幕阅读器兼容
- 颜色对比度

## 扩展建议

### 1. 添加更多页面
- 详情页（用户信息详情）
- 编辑页（表单编辑）
- 创建页（新建用户）

### 2. 增强功能
- 导入/导出功能
- 用户统计图表
- 操作日志
- 权限控制

### 3. 集成第三方服务
- 短信验证
- 邮件通知
- 第三方登录
- 身份验证

## 相关资源

- [crud-template.skill.md](../.claude/skills/crud-template.skill.md) - CRUD模板规范
- [Ant Design Table文档](https://ant.design/components/table-cn)
- [React Query文档](https://tanstack.com/query/latest)
- [Day.js文档](https://day.js.org/)

---

**提示**：此示例可直接用于生产环境，或根据项目需求进行修改。遵循 `crud-template.skill.md` 规范可确保代码质量和一致性。