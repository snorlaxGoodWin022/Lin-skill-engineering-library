import { useState } from 'react';
import { Table, Button, Space, Input, Select, DatePicker, Card, Tag, Modal } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUserList } from '../hooks/useUserList';
import type { User, ListQueryParams } from '../types';
import styles from './ListPage.module.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function ListPage() {
  const [queryParams, setQueryParams] = useState<ListQueryParams>({
    pageNum: 1,
    pageSize: 20,
    keyword: '',
    status: undefined,
    dateRange: undefined,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { data, loading, refresh } = useUserList(queryParams);
  const { list = [], total = 0 } = data || {};

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setQueryParams(prev => ({ ...prev, keyword, pageNum: 1 }));
  };

  // 处理状态筛选
  const handleStatusChange = (status?: string) => {
    setQueryParams(prev => ({ ...prev, status, pageNum: 1 }));
  };

  // 处理日期范围筛选
  const handleDateRangeChange = (dates: any) => {
    setQueryParams(prev => ({ ...prev, dateRange: dates, pageNum: 1 }));
  };

  // 处理分页
  const handlePageChange = (pageNum: number, pageSize: number) => {
    setQueryParams(prev => ({ ...prev, pageNum, pageSize }));
  };

  // 处理表格行选择
  const handleRowSelectionChange = (selectedKeys: React.Key[]) => {
    setSelectedRowKeys(selectedKeys);
  };

  // 处理删除
  const handleDelete = async () => {
    // 这里调用删除API
    console.log('删除用户:', selectedRowKeys);
    setDeleteModalVisible(false);
    setSelectedRowKeys([]);
    refresh();
  };

  // 表格列定义
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 180,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => {
        const roleConfig = {
          admin: { color: 'red', text: '管理员' },
          user: { color: 'blue', text: '普通用户' },
          guest: { color: 'gray', text: '访客' },
        };
        const config = roleConfig[role as keyof typeof roleConfig] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'orange', text: '未激活' },
          banned: { color: 'red', text: '禁用' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            className={styles.actionButton}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSingle(record.id)}
            className={styles.actionButton}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 编辑用户
  const handleEdit = (userId: string) => {
    console.log('编辑用户:', userId);
    // 跳转到编辑页
  };

  // 删除单个用户
  const handleDeleteSingle = (userId: string) => {
    setSelectedRowKeys([userId]);
    setDeleteModalVisible(true);
  };

  // 批量操作
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      Modal.warning({
        title: '提示',
        content: '请先选择要删除的用户',
      });
      return;
    }
    setDeleteModalVisible(true);
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelectionChange,
  };

  return (
    <div className={styles.listPage}>
      {/* 筛选工具栏 */}
      <Card className={styles.filterCard}>
        <div className={styles.filterToolbar}>
          <div className={styles.filterItems}>
            <Search
              placeholder="搜索用户名/邮箱"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              className={styles.searchInput}
            />

            <Select
              placeholder="用户状态"
              allowClear
              onChange={handleStatusChange}
              className={styles.filterSelect}
            >
              <Option value="active">活跃</Option>
              <Option value="inactive">未激活</Option>
              <Option value="banned">禁用</Option>
            </Select>

            <RangePicker
              placeholder={['开始日期', '结束日期']}
              onChange={handleDateRangeChange}
              className={styles.dateRangePicker}
            />
          </div>

          <div className={styles.actionButtons}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => console.log('新建用户')}
              className={styles.createButton}
            >
              新建用户
            </Button>

            {selectedRowKeys.length > 0 && (
              <Button
                danger
                onClick={handleBatchDelete}
                className={styles.batchDeleteButton}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={list}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            current: queryParams.pageNum,
            pageSize: queryParams.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 删除确认对话框 */}
      <Modal
        title="删除确认"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除选中的 {selectedRowKeys.length} 个用户吗？</p>
        <p className={styles.warningText}>此操作不可恢复，请谨慎操作。</p>
      </Modal>
    </div>
  );
}