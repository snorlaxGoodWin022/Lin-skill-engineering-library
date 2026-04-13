# Skill: UI组件封装规范

## 使用场景

当项目使用Ant Design等UI组件库，但需要统一业务风格、增加通用功能时使用此Skill：

- 主题色、圆角、间距等设计Token统一
- 增加权限控制、埋点等业务通用功能
- 统一空状态、loading样式
- 简化重复配置

## 技术栈约定

### 核心依赖
- React 18 + TypeScript
- Ant Design 5.x（或其他UI库）
- CSS Modules / styled-components（样式方案）
- 设计Token系统

### 封装原则
- 保持原组件API不变
- 只覆盖样式，不改逻辑
- 通过props扩展功能
- 支持主题定制

## 设计Token配置

### 1. 主题色定义
```typescript
// styles/tokens.ts
export const tokens = {
  // 品牌色
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',

  // 中性色
  gray1: '#ffffff',
  gray2: '#fafafa',
  gray3: '#f5f5f5',
  gray4: '#e8e8e8',
  gray5: '#d9d9d9',
  gray6: '#bfbfbf',
  gray7: '#8c8c8c',
  gray8: '#595959',
  gray9: '#262626',
  gray10: '#000000',

  // 功能色
  link: '#1890ff',
};
```

### 2. 尺寸体系
```typescript
// styles/sizes.ts
export const sizes = {
  // 间距（4px基准）
  space1: '4px',
  space2: '8px',
  space3: '12px',
  space4: '16px',
  space5: '20px',
  space6: '24px',
  space7: '32px',
  space8: '40px',
  space9: '48px',
  space10: '64px',

  // 圆角
  borderRadiusSM: '2px',
  borderRadius: '4px',
  borderRadiusLG: '8px',

  // 字体大小
  fontSizeSM: '12px',
  fontSize: '14px',
  fontSizeLG: '16px',
  fontSizeXL: '20px',
  fontSizeXXL: '24px',
};
```

### 3. 组件尺寸映射
```typescript
// styles/componentSizes.ts
export const componentSizes = {
  small: {
    height: '24px',
    padding: '0 8px',
    fontSize: '12px',
  },
  medium: {
    height: '32px',
    padding: '0 12px',
    fontSize: '14px',
  },
  large: {
    height: '40px',
    padding: '0 16px',
    fontSize: '16px',
  },
};
```

## 组件封装原则

### 1. API兼容性
保持与原组件相同的API，避免学习成本：
```typescript
// ✅ 推荐：保持相同props
interface ButtonProps extends AntdButtonProps {
  // 只添加业务需要的props
  trackEvent?: string;
  permission?: string;
}

// ❌ 不推荐：完全重写props
interface MyButtonProps {
  // 与原组件完全不同
  text: string;
  clickHandler: () => void;
}
```

### 2. 样式覆盖
使用CSS Modules或styled-components覆盖样式：
```typescript
// Button/index.tsx
import { Button as AntdButton } from 'antd';
import styles from './Button.module.css';

export default function Button({ className, ...props }: ButtonProps) {
  return (
    <AntdButton
      className={`${styles.button} ${className || ''}`}
      {...props}
    />
  );
}
```

### 3. 功能增强
通过HOC或自定义Hook增加业务功能：
```typescript
// withPermission.tsx
import { usePermission } from '@/hooks/usePermission';

export function withPermission<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  permissionKey: string
) {
  return function WithPermissionComponent(props: T) {
    const { hasPermission } = usePermission();

    if (!hasPermission(permissionKey)) {
      return null; // 或返回禁用状态
    }

    return <WrappedComponent {...props} />;
  };
}
```

## 常见组件封装示例

### 1. Button组件（主题色、圆角、埋点）
```typescript
// components/Button/index.tsx
import { Button as AntdButton } from 'antd';
import { withPermission } from '@/hocs/withPermission';
import { useTracking } from '@/hooks/useTracking';
import styles from './Button.module.css';

interface ButtonProps extends AntdButtonProps {
  // 业务扩展props
  trackEvent?: string;
  permission?: string;
}

function BaseButton({
  trackEvent,
  onClick,
  permission,
  className,
  ...props
}: ButtonProps) {
  const { track } = useTracking();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (trackEvent) {
      track(trackEvent, { element: 'button' });
    }
    onClick?.(e);
  };

  return (
    <AntdButton
      className={`${styles.button} ${className || ''}`}
      onClick={handleClick}
      {...props}
    />
  );
}

// 导出带权限控制的Button
export const Button = withPermission(BaseButton, 'button:use');
export default Button;
```

```css
/* Button.module.css */
.button {
  /* 覆盖Ant Design默认样式 */
  border-radius: var(--border-radius-lg);
  font-weight: 500;
}

.buttonPrimary {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.buttonPrimary:hover {
  background: var(--primary-color-hover);
  border-color: var(--primary-color-hover);
}
```

### 2. Input组件（错误提示、字数统计）
```typescript
// components/Input/index.tsx
import { Input as AntdInput } from 'antd';
import { useState } from 'react';
import styles from './Input.module.css';

interface InputProps extends AntdInputProps {
  maxLength?: number;
  showCount?: boolean;
  errorMessage?: string;
}

export default function Input({
  maxLength,
  showCount,
  errorMessage,
  value,
  onChange,
  className,
  ...props
}: InputProps) {
  const [count, setCount] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCount(newValue.length);
    onChange?.(e);
  };

  return (
    <div className={styles.inputWrapper}>
      <AntdInput
        className={`${styles.input} ${errorMessage ? styles.error : ''} ${className || ''}`}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />

      {(showCount && maxLength) && (
        <div className={styles.count}>
          {count}/{maxLength}
        </div>
      )}

      {errorMessage && (
        <div className={styles.errorMessage}>{errorMessage}</div>
      )}
    </div>
  );
}
```

### 3. Table组件（空状态、loading样式）
```typescript
// components/Table/index.tsx
import { Table as AntdTable, Empty, Spin } from 'antd';
import type { TableProps } from 'antd';
import styles from './Table.module.css';

interface CustomTableProps<T> extends TableProps<T> {
  loading?: boolean;
  emptyText?: string;
  emptyImage?: React.ReactNode;
}

export default function Table<T extends object>({
  loading = false,
  emptyText = '暂无数据',
  emptyImage,
  dataSource,
  className,
  ...props
}: CustomTableProps<T>) {
  const isEmpty = !dataSource || dataSource.length === 0;

  return (
    <div className={styles.tableContainer}>
      <Spin spinning={loading}>
        <AntdTable
          className={`${styles.table} ${className || ''}`}
          dataSource={dataSource}
          locale={{
            emptyText: emptyImage ? (
              <Empty
                image={emptyImage}
                description={emptyText}
              />
            ) : (
              <Empty description={emptyText} />
            ),
          }}
          {...props}
        />
      </Spin>
    </div>
  );
}
```

### 4. Modal组件（固定宽度、关闭确认）
```typescript
// components/Modal/index.tsx
import { Modal as AntdModal } from 'antd';
import type { ModalProps } from 'antd';
import { useState } from 'react';
import styles from './Modal.module.css';

interface CustomModalProps extends ModalProps {
  width?: number;
  confirmClose?: boolean;
  confirmMessage?: string;
}

export default function Modal({
  width = 520,
  confirmClose = false,
  confirmMessage = '确定要关闭吗？未保存的内容将丢失',
  onCancel,
  ...props
}: CustomModalProps) {
  const [internalOpen, setInternalOpen] = useState(true);

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (confirmClose) {
      // 自定义确认逻辑
      if (window.confirm(confirmMessage)) {
        setInternalOpen(false);
        onCancel?.(e);
      }
    } else {
      setInternalOpen(false);
      onCancel?.(e);
    }
  };

  return (
    <AntdModal
      className={styles.modal}
      width={width}
      open={internalOpen}
      onCancel={handleCancel}
      {...props}
    />
  );
}
```

## 主题配置

### 1. Ant Design主题定制
```typescript
// styles/theme.ts
import { theme } from 'antd';

export const customTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    // 主题色
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',

    // 边框圆角
    borderRadius: 4,
    borderRadiusSM: 2,
    borderRadiusLG: 8,

    // 字体
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,

    // 间距
    controlHeightSM: 24,
    controlHeight: 32,
    controlHeightLG: 40,
  },
  components: {
    Button: {
      colorPrimary: '#1890ff',
      algorithm: true,
    },
    Input: {
      colorPrimary: '#1890ff',
      borderRadius: 4,
    },
    Table: {
      borderRadiusLG: 8,
      headerBg: '#fafafa',
    },
  },
};
```

### 2. 全局样式重置
```css
/* styles/reset.css */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;

  --border-radius-sm: 2px;
  --border-radius: 4px;
  --border-radius-lg: 8px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.85);
  background-color: #fff;
}
```

## 使用示例

### 1. 在项目中统一引入
```typescript
// src/components/index.ts
export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Table } from './Table';
export { default as Modal } from './Modal';
```

```typescript
// App.tsx
import { ConfigProvider } from 'antd';
import { Button, Input, Table, Modal } from '@/components';
import { customTheme } from '@/styles/theme';

function App() {
  return (
    <ConfigProvider theme={customTheme}>
      <Button type="primary">提交</Button>
      <Input placeholder="请输入" />
      <Table dataSource={[]} />
      <Modal title="弹窗">内容</Modal>
    </ConfigProvider>
  );
}
```

### 2. 按需使用业务功能
```typescript
// 带埋点的按钮
<Button
  type="primary"
  trackEvent="user_click_submit"
  onClick={handleSubmit}
>
  提交
</Button>

// 带权限控制的按钮
<Button
  type="primary"
  permission="order:create"
  onClick={handleCreateOrder}
>
  新建订单
</Button>

// 带字数统计的输入框
<Input
  placeholder="请输入内容"
  maxLength={100}
  showCount
/>
```

## 输出要求

生成UI组件封装时必须：

1. 保持与原组件API兼容
2. 使用设计Token统一样式
3. 通过props扩展业务功能
4. 包含完整的TypeScript类型定义
5. 提供主题配置示例
6. 支持按需引入和全局配置