# Skill: 国际化 i18n

## 使用场景

当需要实现前端多语言支持时使用此Skill，包括但不限于：
- 静态文本翻译（UI 文案、按钮、提示）
- 动态内容翻译
- 日期/数字本地化格式
- 语言切换
- 按需加载语言包
- 表单校验信息国际化

## 技术栈

### 核心依赖

**React 方案：**
- react-i18next 14.x
- i18next 23.x
- i18next-http-backend（按需加载）
- i18next-browser-languagedetector（语言检测）

**Vue 3 方案：**
- vue-i18n 9.x
- @intlify/unplugin-vue-i18n（编译优化）
- 支持按需加载（defineAsyncComponent）

## 文件结构规范

```
src/
├── i18n/
│   ├── index.ts                 # i18n 初始化配置
│   ├── types.ts                 # 类型定义
│   ├── locales/                 # 语言包
│   │   ├── zh-CN/
│   │   │   ├── common.json      # 公共文案
│   │   │   ├── validation.json  # 表单校验
│   │   │   ├── menu.json        # 菜单导航
│   │   │   └── modules/         # 业务模块
│   │   │       ├── user.json
│   │   │       └── order.json
│   │   └── en/
│   │       ├── common.json
│   │       ├── validation.json
│   │       ├── menu.json
│   │       └── modules/
│   │           ├── user.json
│   │           └── order.json
│   └── utils.ts                 # 工具函数
├── components/
│   └── LanguageSwitch/
│       └── index.vue|tsx        # 语言切换组件
└── hooks/|composables/
    └── useLocale.ts             # 语言切换 Hook/Composable
```

## 语言包规范

### 命名空间拆分

```json
// i18n/locales/zh-CN/common.json
{
  "app": {
    "title": "管理系统",
    "loading": "加载中...",
    "confirm": "确认",
    "cancel": "取消",
    "save": "保存",
    "delete": "删除",
    "edit": "编辑",
    "create": "新建",
    "search": "搜索",
    "reset": "重置",
    "export": "导出",
    "import": "导入",
    "refresh": "刷新",
    "back": "返回",
    "submit": "提交",
    "success": "操作成功",
    "failed": "操作失败",
    "noData": "暂无数据"
  },
  "pagination": {
    "total": "共 {{count}} 条",
    "pageSize": "{{size}} 条/页"
  },
  "time": {
    "justNow": "刚刚",
    "minutesAgo": "{{count}} 分钟前",
    "hoursAgo": "{{count}} 小时前",
    "daysAgo": "{{count}} 天前"
  }
}
```

```json
// i18n/locales/zh-CN/validation.json
{
  "required": "请输入{{field}}",
  "min": "{{field}}不能少于{{min}}个字符",
  "max": "{{field}}不能超过{{max}}个字符",
  "email": "请输入正确的邮箱格式",
  "phone": "请输入正确的手机号",
  "url": "请输入正确的URL格式",
  "number": "{{field}}必须为数字",
  "minValue": "{{field}}不能小于{{min}}",
  "maxValue": "{{field}}不能大于{{max}}"
}
```

```json
// i18n/locales/en/common.json
{
  "app": {
    "title": "Management System",
    "loading": "Loading...",
    "confirm": "Confirm",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "reset": "Reset",
    "export": "Export",
    "import": "Import",
    "refresh": "Refresh",
    "back": "Back",
    "submit": "Submit",
    "success": "Operation successful",
    "failed": "Operation failed",
    "noData": "No data"
  },
  "pagination": {
    "total": "Total {{count}} items",
    "pageSize": "{{size}} / page"
  },
  "time": {
    "justNow": "Just now",
    "minutesAgo": "{{count}} minutes ago",
    "hoursAgo": "{{count}} hours ago",
    "daysAgo": "{{count}} days ago"
  }
}
```

```json
// i18n/locales/en/validation.json
{
  "required": "Please enter {{field}}",
  "min": "{{field}} must be at least {{min}} characters",
  "max": "{{field}} must be at most {{max}} characters",
  "email": "Please enter a valid email",
  "phone": "Please enter a valid phone number",
  "url": "Please enter a valid URL",
  "number": "{{field}} must be a number",
  "minValue": "{{field}} must be at least {{min}}",
  "maxValue": "{{field}} must be at most {{max}}"
}
```

## 类型定义

```typescript
// i18n/types.ts

/** 支持的语言 */
export type Locale = 'zh-CN' | 'en';

/** 语言配置 */
export interface LocaleOption {
  value: Locale;
  label: string;
  icon?: string;
}

/** 可用语言列表 */
export const LOCALE_OPTIONS: LocaleOption[] = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en', label: 'English' },
];

/** 语言包命名空间 */
export type Namespace =
  | 'common'
  | 'validation'
  | 'menu'
  | 'user'
  | 'order';
```

## React 方案

### i18n 初始化

```typescript
// i18n/index.ts (React)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Locale } from './types';

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 按需加载语言包
  .use(HttpBackend)
  // 注入 React
  .use(initReactI18next)
  .init({
    // 默认语言
    fallbackLng: 'zh-CN',
    // 支持的语言
    supportedLngs: ['zh-CN', 'en'],
    // 命名空间
    ns: ['common', 'validation', 'menu'],
    defaultNS: 'common',
    // 后端加载配置
    backend: {
      // 语言包路径（public/locales/zh-CN/common.json）
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    // 语言检测配置
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'locale',
    },
    interpolation: {
      // React 已经防 XSS，不需要 i18next 再转义
      escapeValue: false,
    },
  });

export default i18n;
```

### 在 main.tsx 引入

```typescript
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n'; // 引入 i18n 初始化
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### 组件中使用

```typescript
// React 组件中使用
import { useTranslation } from 'react-i18next';

export default function UserList() {
  const { t } = useTranslation(['user', 'common']);

  return (
    <div>
      <h1>{t('user:list.title')}</h1>
      <Button>{t('common:app.create')}</Button>
      <span>{t('common:pagination.total', { count: 100 })}</span>
    </div>
  );
}
```

### 语言切换 Hook

```typescript
// hooks/useLocale.ts (React)
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Locale, LOCALE_OPTIONS } from '@/i18n/types';

/**
 * 语言切换 Hook
 *
 * @example
 * const { locale, changeLocale, localeOptions } = useLocale();
 * changeLocale('en');
 */
export function useLocale() {
  const { i18n } = useTranslation();

  const locale = i18n.language as Locale;

  const changeLocale = useCallback(
    async (newLocale: Locale) => {
      await i18n.changeLanguage(newLocale);
      localStorage.setItem('locale', newLocale);
      // 更新 HTML lang 属性
      document.documentElement.lang = newLocale;
    },
    [i18n],
  );

  return {
    locale,
    changeLocale,
    localeOptions: LOCALE_OPTIONS,
  };
}
```

### Zod 校验国际化

```typescript
// i18n/utils.ts (React) — Zod 校验信息国际化
import { z } from 'zod';
import i18n from 'i18next';

/**
 * 创建带国际化的 Zod Schema
 * 使用函数动态创建，确保获取最新语言
 */
export function createValidationSchema() {
  const t = i18n.getFixedT('validation');

  return z.object({
    username: z.string()
      .min(1, t('required', { field: '用户名' }))
      .max(20, t('max', { field: '用户名', max: '20' })),
    email: z.string()
      .email(t('email')),
    phone: z.string()
      .regex(/^1[3-9]\d{9}$/, t('phone')),
  });
}
```

### 语言切换组件

```typescript
// components/LanguageSwitch/index.tsx (React)
import React from 'react';
import { Select } from 'antd';
import { useLocale } from '@/hooks/useLocale';

/**
 * 语言切换下拉组件
 */
export default function LanguageSwitch() {
  const { locale, changeLocale, localeOptions } = useLocale();

  return (
    <Select
      value={locale}
      onChange={changeLocale}
      options={localeOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      }))}
      style={{ width: 120 }}
    />
  );
}
```

## Vue 3 方案

### i18n 初始化

```typescript
// i18n/index.ts (Vue 3)
import { createI18n } from 'vue-i18n';
import { Locale } from './types';

// 静态导入公共语言包（按需加载可选）
import zhCNCommon from './locales/zh-CN/common.json';
import zhCNValidation from './locales/zh-CN/validation.json';
import enCommon from './locales/en/common.json';
import enValidation from './locales/en/validation.json';

/**
 * Vue I18n 实例
 * 使用 legacy: false 启用 Composition API 模式
 */
const i18n = createI18n({
  legacy: false, // 必须为 false，使用 Composition API
  locale: (localStorage.getItem('locale') as Locale) || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: zhCNCommon,
      validation: zhCNValidation,
    },
    en: {
      common: enCommon,
      validation: enValidation,
    },
  },
});

export default i18n;
```

### 在 main.ts 引入

```typescript
// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import i18n from './i18n';

const app = createApp(App);
app.use(i18n);
app.mount('#app');
```

### 组件中使用

```vue
<!-- Vue 3 组件中使用 -->
<template>
  <div>
    <h1>{{ t('user:list.title') }}</h1>
    <el-button>{{ t('common:app.create') }}</el-button>
    <span>{{ t('common:pagination.total', { count: 100 }) }}</span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
```

### 语言切换 Composable

```typescript
// composables/useLocale.ts (Vue 3)
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Locale, LOCALE_OPTIONS } from '@/i18n/types';

/**
 * 语言切换 Composable
 *
 * @example
 * const { locale, changeLocale, localeOptions } = useLocale();
 * changeLocale('en');
 */
export function useLocale() {
  const { locale: i18nLocale } = useI18n();

  const locale = computed(() => i18nLocale.value as Locale);

  function changeLocale(newLocale: Locale) {
    i18nLocale.value = newLocale;
    localStorage.setItem('locale', newLocale);
    document.documentElement.lang = newLocale;
  }

  return {
    locale,
    changeLocale,
    localeOptions: LOCALE_OPTIONS,
  };
}
```

### Zod 校验国际化

```typescript
// i18n/utils.ts (Vue 3) — Zod 校验信息国际化
import { z } from 'zod';
import i18n from './index';

/**
 * 创建带国际化的 Zod Schema
 * 使用函数动态创建，确保获取最新语言
 */
export function createValidationSchema() {
  const { t } = i18n.global;

  return z.object({
    username: z.string()
      .min(1, t('validation:required', { field: '用户名' }))
      .max(20, t('validation:max', { field: '用户名', max: '20' })),
    email: z.string()
      .email(t('validation:email')),
    phone: z.string()
      .regex(/^1[3-9]\d{9}$/, t('validation:phone')),
  });
}
```

### 语言切换组件

```vue
<!-- components/LanguageSwitch/index.vue (Vue 3) -->
<template>
  <el-select
    :model-value="locale"
    @change="changeLocale"
    style="width: 120px"
  >
    <el-option
      v-for="opt in localeOptions"
      :key="opt.value"
      :label="opt.label"
      :value="opt.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale';

const { locale, changeLocale, localeOptions } = useLocale();
</script>
```

## 按需加载语言包（Vue 3）

```typescript
// i18n/index.ts — 异步加载业务模块语言包
import type { Locale } from './types';

const loadedLanguages: Locale[] = [];

/**
 * 按需加载业务模块语言包
 * 在路由守卫或组件中按需调用
 */
export async function loadLocaleMessages(locale: Locale, module: string) {
  if (loadedLanguages.includes(locale)) return;

  const messages = await import(`./locales/${locale}/modules/${module}.json`);

  i18n.global.mergeLocaleMessage(locale, {
    [module]: messages.default,
  });

  loadedLanguages.push(locale);
}

// 在路由守卫中使用
// router.beforeEach(async (to) => {
//   const module = to.meta.i18nModule;
//   if (module) {
//     await loadLocaleMessages(locale.value, module);
//   }
// });
```

## 日期/数字本地化

```typescript
// i18n/utils.ts — 格式化工具

import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/en';
import { Locale } from './types';

const localeMap: Record<Locale, string> = {
  'zh-CN': 'zh-cn',
  en: 'en',
};

/**
 * 格式化日期（自动跟随当前语言）
 */
export function formatDate(date: string | Date, format = 'YYYY-MM-DD HH:mm'): string {
  const locale = (localStorage.getItem('locale') as Locale) || 'zh-CN';
  return dayjs(date).locale(localeMap[locale]).format(format);
}

/**
 * 格式化数字（千分位分隔）
 */
export function formatNumber(value: number, locale?: Locale): string {
  const currentLocale = locale || (localStorage.getItem('locale') as Locale) || 'zh-CN';
  return new Intl.NumberFormat(currentLocale).format(value);
}

/**
 * 格式化货币
 */
export function formatCurrency(value: number, currency = 'CNY'): string {
  const locale = (localStorage.getItem('locale') as Locale) || 'zh-CN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}
```

## 输出要求

当用户要求实现国际化时，必须：

1. 提供 i18n 初始化配置（React / Vue 3 双方案）
2. 语言包按命名空间拆分（common / validation / modules）
3. 语言切换 Hook/Composable
4. 语言切换 UI 组件
5. 日期/数字本地化格式化工具
6. Zod 校验信息国际化
7. 支持按需加载业务模块语言包
8. 所有类型定义完整

## 使用示例

### 用户输入

```
请按照 i18n-common 规范，实现项目国际化。

支持语言：中文、英文
需要翻译：
- 通用文案（按钮、提示）
- 表单校验信息
- 用户管理模块
```

### AI 输出

AI 会自动生成：

1. i18n 初始化配置（react-i18next / vue-i18n）
2. 语言包文件（zh-CN / en）
3. 语言切换 Hook / Composable
4. 语言切换 UI 组件
5. 日期/数字本地化工具
6. Zod 校验国际化方案

你只需要：

+ 补充业务模块的翻译文案
+ 在组件中使用 t() 函数
+ 切换语言调用 changeLocale
+ 基本上不用改就能用
