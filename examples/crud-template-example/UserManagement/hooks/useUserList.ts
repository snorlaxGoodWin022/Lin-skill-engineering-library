import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import type { User, ListQueryParams, ListResponse } from '../types';
import { mockUserList, mockUserListData } from '../mocks/user';

// 模拟API调用
const fetchUserList = async (params: ListQueryParams): Promise<ListResponse<User>> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  const { pageNum = 1, pageSize = 20, keyword = '', status, dateRange } = params;

  // 筛选数据
  let filteredList = [...mockUserList];

  // 关键词搜索
  if (keyword) {
    filteredList = filteredList.filter(user =>
      user.username.toLowerCase().includes(keyword.toLowerCase()) ||
      user.email.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // 状态筛选
  if (status) {
    filteredList = filteredList.filter(user => user.status === status);
  }

  // 日期范围筛选
  if (dateRange && dateRange[0] && dateRange[1]) {
    const startDate = new Date(dateRange[0]).getTime();
    const endDate = new Date(dateRange[1]).getTime();
    filteredList = filteredList.filter(user => {
      const userDate = new Date(user.createdAt).getTime();
      return userDate >= startDate && userDate <= endDate;
    });
  }

  // 分页
  const startIndex = (pageNum - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedList = filteredList.slice(startIndex, endIndex);

  return {
    list: paginatedList,
    total: filteredList.length,
    pageNum,
    pageSize,
  };
};

export function useUserList(params: ListQueryParams) {
  const [data, setData] = useState<ListResponse<User>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      const result = await fetchUserList(params);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取用户列表失败';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  // 初始加载
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 刷新数据
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // 重新加载（带参数）
  const reload = useCallback((newParams?: Partial<ListQueryParams>) => {
    const updatedParams = newParams ? { ...params, ...newParams } : params;
    return fetchUserList(updatedParams).then(result => {
      setData(result);
      return result;
    });
  }, [params]);

  // 获取单个用户
  const getUser = useCallback(async (userId: string): Promise<User | undefined> => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockUserList.find(user => user.id === userId);
    } catch (err) {
      message.error('获取用户信息失败');
      return undefined;
    }
  }, []);

  // 创建用户
  const createUser = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('用户创建成功');
      refresh();
      return true;
    } catch (err) {
      message.error('用户创建失败');
      return false;
    }
  }, [refresh]);

  // 更新用户
  const updateUser = useCallback(async (userId: string, userData: Partial<User>): Promise<boolean> => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('用户更新成功');
      refresh();
      return true;
    } catch (err) {
      message.error('用户更新失败');
      return false;
    }
  }, [refresh]);

  // 删除用户
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('用户删除成功');
      refresh();
      return true;
    } catch (err) {
      message.error('用户删除失败');
      return false;
    }
  }, [refresh]);

  // 批量删除用户
  const batchDeleteUsers = useCallback(async (userIds: string[]): Promise<boolean> => {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      message.success(`成功删除 ${userIds.length} 个用户`);
      refresh();
      return true;
    } catch (err) {
      message.error('批量删除失败');
      return false;
    }
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    reload,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    batchDeleteUsers,
  };
}

// 导出的工具函数
export const useUserListUtils = {
  // 格式化查询参数
  formatQueryParams: (params: ListQueryParams): Record<string, any> => {
    const formatted: Record<string, any> = {
      page: params.pageNum,
      limit: params.pageSize,
    };

    if (params.keyword) {
      formatted.q = params.keyword;
    }

    if (params.status) {
      formatted.status = params.status;
    }

    if (params.dateRange?.[0] && params.dateRange?.[1]) {
      formatted.start_date = params.dateRange[0].toISOString().split('T')[0];
      formatted.end_date = params.dateRange[1].toISOString().split('T')[0];
    }

    return formatted;
  },

  // 解析响应数据
  parseResponse: (response: any): ListResponse<User> => {
    return {
      list: response.data || [],
      total: response.total || 0,
      pageNum: response.page || 1,
      pageSize: response.limit || 20,
    };
  },

  // 获取默认查询参数
  getDefaultParams: (): ListQueryParams => ({
    pageNum: 1,
    pageSize: 20,
    keyword: '',
    status: undefined,
    dateRange: undefined,
  }),

  // 验证查询参数
  validateParams: (params: ListQueryParams): string[] => {
    const errors: string[] = [];

    if (params.pageNum < 1) {
      errors.push('页码必须大于0');
    }

    if (params.pageSize < 1 || params.pageSize > 100) {
      errors.push('每页数量必须在1-100之间');
    }

    if (params.dateRange?.[0] && params.dateRange?.[1]) {
      const startDate = new Date(params.dateRange[0]);
      const endDate = new Date(params.dateRange[1]);

      if (startDate > endDate) {
        errors.push('开始日期不能晚于结束日期');
      }

      // 限制查询范围（最多90天）
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 90) {
        errors.push('查询日期范围不能超过90天');
      }
    }

    return errors;
  },
};