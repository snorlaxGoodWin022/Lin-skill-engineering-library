import type { User, UserDetail, LoginHistory, AuditLog, UserStatistics } from '../types';

// 模拟用户数据
export const mockUserList: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138000',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-20T14:25:00Z',
    lastLoginAt: '2024-03-22T09:15:00Z',
    department: '技术部',
    position: '技术总监',
    permissions: ['user:create', 'user:update', 'user:delete', 'user:export'],
  },
  {
    id: '2',
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    phone: '13900139000',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    role: 'user',
    status: 'active',
    createdAt: '2024-02-10T08:20:00Z',
    updatedAt: '2024-03-21T16:40:00Z',
    lastLoginAt: '2024-03-21T13:30:00Z',
    department: '市场部',
    position: '市场经理',
  },
  {
    id: '3',
    username: 'lisi',
    email: 'lisi@example.com',
    phone: '13700137000',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-02-28T11:45:00Z',
    updatedAt: '2024-03-18T10:15:00Z',
    lastLoginAt: '2024-03-10T14:20:00Z',
    department: '销售部',
    position: '销售专员',
  },
  {
    id: '4',
    username: 'wangwu',
    email: 'wangwu@example.com',
    phone: '13600136000',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    role: 'guest',
    status: 'active',
    createdAt: '2024-03-05T09:10:00Z',
    updatedAt: '2024-03-19T15:30:00Z',
    lastLoginAt: '2024-03-19T11:45:00Z',
    department: '客服部',
    position: '客服专员',
  },
  {
    id: '5',
    username: 'zhaoliu',
    email: 'zhaoliu@example.com',
    phone: '13500135000',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    role: 'user',
    status: 'banned',
    createdAt: '2024-01-20T14:50:00Z',
    updatedAt: '2024-03-15T17:25:00Z',
    lastLoginAt: '2024-03-01T10:30:00Z',
    department: '技术部',
    position: '前端工程师',
  },
  {
    id: '6',
    username: 'sunqi',
    email: 'sunqi@example.com',
    phone: '13400134000',
    role: 'user',
    status: 'active',
    createdAt: '2024-03-10T13:25:00Z',
    updatedAt: '2024-03-22T08:45:00Z',
    lastLoginAt: '2024-03-22T08:30:00Z',
    department: '产品部',
    position: '产品经理',
  },
  {
    id: '7',
    username: 'zhouba',
    email: 'zhouba@example.com',
    phone: '13300133000',
    avatar: 'https://randomuser.me/api/portraits/women/6.jpg',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-25T16:15:00Z',
    updatedAt: '2024-03-21T09:50:00Z',
    lastLoginAt: '2024-03-21T09:30:00Z',
    department: '运营部',
    position: '运营总监',
    permissions: ['user:read', 'user:export'],
  },
  {
    id: '8',
    username: 'wujiu',
    email: 'wujiu@example.com',
    phone: '13200132000',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-02-15T10:05:00Z',
    updatedAt: '2024-03-17T14:20:00Z',
    lastLoginAt: '2024-03-05T16:45:00Z',
    department: '财务部',
    position: '财务专员',
  },
  {
    id: '9',
    username: 'zhengshi',
    email: 'zhengshi@example.com',
    phone: '13100131000',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    role: 'user',
    status: 'active',
    createdAt: '2024-03-01T11:30:00Z',
    updatedAt: '2024-03-20T13:15:00Z',
    lastLoginAt: '2024-03-20T12:50:00Z',
    department: '人事部',
    position: '人事专员',
  },
  {
    id: '10',
    username: 'fengshiyi',
    email: 'fengshiyi@example.com',
    phone: '13000130000',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    role: 'guest',
    status: 'active',
    createdAt: '2024-02-20T15:40:00Z',
    updatedAt: '2024-03-18T11:25:00Z',
    lastLoginAt: '2024-03-18T10:45:00Z',
    department: '行政部',
    position: '行政助理',
  },
];

// 模拟列表响应数据
export const mockUserListData = {
  list: mockUserList,
  total: mockUserList.length,
  pageNum: 1,
  pageSize: 20,
};

// 模拟用户详情
export const mockUserDetail: UserDetail = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  phone: '13800138000',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  role: 'admin',
  status: 'active',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-03-20T14:25:00Z',
  lastLoginAt: '2024-03-22T09:15:00Z',
  department: '技术部',
  position: '技术总监',
  permissions: ['user:create', 'user:update', 'user:delete', 'user:export'],
  loginHistory: [
    {
      id: '101',
      userId: '1',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '北京',
      loginAt: '2024-03-22T09:15:00Z',
      success: true,
    },
    {
      id: '102',
      userId: '1',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      location: '上海',
      loginAt: '2024-03-21T14:30:00Z',
      success: true,
    },
  ],
  auditLogs: [
    {
      id: '201',
      userId: '1',
      action: 'create',
      resource: 'user',
      resourceId: '2',
      details: { username: 'zhangsan', role: 'user' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: '2024-03-20T10:25:00Z',
    },
    {
      id: '202',
      userId: '1',
      action: 'update',
      resource: 'user',
      resourceId: '3',
      details: { status: 'inactive' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      createdAt: '2024-03-18T15:40:00Z',
    },
  ],
  statistics: {
    totalLogins: 156,
    lastLoginDays: 1,
    activeDays: 45,
    averageSessionDuration: 1800, // 秒
    favoriteActions: ['login', 'view_user', 'edit_profile'],
  },
};

// 模拟登录历史
export const mockLoginHistory: LoginHistory[] = [
  {
    id: '101',
    userId: '1',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: '北京',
    loginAt: '2024-03-22T09:15:00Z',
    success: true,
  },
  {
    id: '102',
    userId: '1',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    location: '上海',
    loginAt: '2024-03-21T14:30:00Z',
    success: true,
  },
  {
    id: '103',
    userId: '2',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    location: '广州',
    loginAt: '2024-03-21T13:30:00Z',
    success: true,
  },
  {
    id: '104',
    userId: '3',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    location: '深圳',
    loginAt: '2024-03-10T14:20:00Z',
    success: false,
    failureReason: '密码错误',
  },
];

// 模拟审计日志
export const mockAuditLogs: AuditLog[] = [
  {
    id: '201',
    userId: '1',
    action: 'create',
    resource: 'user',
    resourceId: '2',
    details: { username: 'zhangsan', role: 'user' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-03-20T10:25:00Z',
  },
  {
    id: '202',
    userId: '1',
    action: 'update',
    resource: 'user',
    resourceId: '3',
    details: { status: 'inactive' },
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-03-18T15:40:00Z',
  },
  {
    id: '203',
    userId: '2',
    action: 'login',
    resource: 'auth',
    details: { method: 'password' },
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    createdAt: '2024-03-21T13:30:00Z',
  },
  {
    id: '204',
    userId: '4',
    action: 'export',
    resource: 'user',
    details: { format: 'excel', count: 10 },
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    createdAt: '2024-03-19T16:15:00Z',
  },
];

// 模拟API响应
export const mockApiResponse = {
  success: true,
  code: 200,
  message: '操作成功',
  data: mockUserListData,
  timestamp: '2024-03-22T10:30:00Z',
  requestId: 'req_1234567890abcdef',
};

// 模拟错误响应
export const mockErrorResponse = {
  success: false,
  code: 400,
  message: '参数验证失败',
  errors: {
    username: ['用户名不能为空', '用户名至少3个字符'],
    email: ['邮箱格式不正确'],
  },
  timestamp: '2024-03-22T10:30:00Z',
  requestId: 'req_1234567890abcdef',
};

// 工具函数：生成随机用户
export function generateRandomUser(): User {
  const id = Math.random().toString(36).substring(2, 10);
  const roles: User['role'][] = ['admin', 'user', 'guest'];
  const statuses: User['status'][] = ['active', 'inactive', 'banned'];
  const departments = ['技术部', '市场部', '销售部', '产品部', '运营部', '财务部', '人事部', '行政部'];
  const positions = ['总监', '经理', '专员', '工程师', '助理'];

  const role = roles[Math.floor(Math.random() * roles.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const department = departments[Math.floor(Math.random() * departments.length)];
  const position = positions[Math.floor(Math.random() * positions.length)];

  return {
    id,
    username: `user_${id}`,
    email: `user_${id}@example.com`,
    phone: `13${Math.floor(Math.random() * 900000000 + 100000000)}`,
    role,
    status,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    department,
    position,
  };
}

// 工具函数：生成用户列表
export function generateUserList(count: number): User[] {
  return Array.from({ length: count }, generateRandomUser);
}