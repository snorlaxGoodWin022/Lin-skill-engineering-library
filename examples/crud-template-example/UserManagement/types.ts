import type { Dayjs } from 'dayjs';

// 用户实体类型
export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive' | 'banned';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  department?: string;
  position?: string;
  permissions?: string[];
  metadata?: Record<string, any>;
}

// 查询参数类型
export interface ListQueryParams {
  pageNum: number;
  pageSize: number;
  keyword?: string;
  status?: string;
  dateRange?: [Dayjs, Dayjs];
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  filters?: Record<string, any>;
}

// 列表响应类型
export interface ListResponse<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  hasMore?: boolean;
  extra?: Record<string, any>;
}

// 表单数据类型
export interface UserFormData {
  username: string;
  email: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role: 'admin' | 'user' | 'guest';
  status: 'active' | 'inactive';
  department?: string;
  position?: string;
  permissions?: string[];
}

// 详情数据
export interface UserDetail extends User {
  loginHistory?: LoginHistory[];
  auditLogs?: AuditLog[];
  statistics?: UserStatistics;
}

// 登录历史
export interface LoginHistory {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  loginAt: string;
  success: boolean;
  failureReason?: string;
}

// 审计日志
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// 用户统计
export interface UserStatistics {
  totalLogins: number;
  lastLoginDays: number;
  activeDays: number;
  averageSessionDuration: number;
  favoriteActions: string[];
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  code: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
  requestId: string;
}

// 分页配置
export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal: (total: number) => string;
  pageSizeOptions: string[];
}

// 表格列配置
export interface TableColumn<T> {
  title: string;
  dataIndex: keyof T | string;
  key: string;
  width?: number;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  sorter?: boolean;
  sortDirections?: ('ascend' | 'descend')[];
  filterDropdown?: React.ReactNode;
  filteredValue?: any[];
  onFilter?: (value: any, record: T) => boolean;
  render?: (text: any, record: T, index: number) => React.ReactNode;
  ellipsis?: boolean;
  className?: string;
  responsive?: string[];
}

// 筛选配置
export interface FilterConfig {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'daterange' | 'checkbox' | 'radio';
  options?: Array<{ label: string; value: any }>;
  placeholder?: string;
  defaultValue?: any;
  width?: number;
}

// 操作配置
export interface ActionConfig {
  key: string;
  label: string;
  type: 'primary' | 'default' | 'dashed' | 'link' | 'text' | 'danger';
  icon?: React.ReactNode;
  onClick: (record: User, index: number) => void;
  confirm?: {
    title: string;
    content: string;
    okText?: string;
    cancelText?: string;
  };
  disabled?: (record: User) => boolean;
  visible?: (record: User) => boolean;
}

// 批量操作
export interface BatchAction {
  key: string;
  label: string;
  type: 'delete' | 'export' | 'update' | 'custom';
  onClick: (selectedKeys: string[], selectedRows: User[]) => void;
  confirm?: {
    title: string;
    content: string;
  };
  disabled?: (selectedKeys: string[]) => boolean;
}

// 导出配置
export interface ExportConfig {
  filename: string;
  sheetName: string;
  columns: Array<{
    header: string;
    key: keyof User;
    width?: number;
    format?: (value: any) => string;
  }>;
  data: User[];
}

// 导入配置
export interface ImportConfig {
  templateUrl: string;
  accept: string;
  maxSize: number; // MB
  columns: Array<{
    header: string;
    key: keyof User;
    required: boolean;
    validate?: (value: any) => string | undefined;
  }>;
  onImport: (data: User[]) => Promise<boolean>;
}

// 权限检查
export interface PermissionCheck {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'import';
  userId?: string;
}

// 路由配置
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  permissions?: string[];
  breadcrumb?: string[];
  title?: string;
  icon?: React.ReactNode;
  hidden?: boolean;
}