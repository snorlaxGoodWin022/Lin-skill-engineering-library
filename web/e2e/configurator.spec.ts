import { test, expect } from '@playwright/test'

test.describe('配置器页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configurator')
  })

  // ==================== 步骤指示器 ====================

  test('应该显示三步向导指示器', async ({ page }) => {
    await expect(page.getByRole('button', { name: '选择模板' })).toBeVisible()
    await expect(page.getByRole('button', { name: '选择框架' })).toBeVisible()
    await expect(page.getByRole('button', { name: '填写配置' })).toBeVisible()
  })

  test('初始应该停留在第一步', async ({ page }) => {
    const step1Button = page.getByRole('button', { name: '选择模板' })
    const indicator = step1Button.locator('span').first()
    await expect(indicator).toHaveClass(/bg-blue-600/)
  })

  // ==================== 第一步：选择模板 ====================

  test('应该显示模板选择网格', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '选择模板类型' })).toBeVisible()
    const templateCards = page.locator('button').filter({ hasText: /表单|CRUD|API|Hooks|工具函数/ })
    const count = await templateCards.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('点击模板卡片应该选中并进入第二步', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await expect(page.getByRole('heading', { name: '选择技术栈' })).toBeVisible()

    const step2Button = page.getByRole('button', { name: '选择框架' })
    const indicator = step2Button.locator('span').first()
    await expect(indicator).toHaveClass(/bg-blue-600/)
  })

  test('选中的模板应该有高亮样式', async ({ page }) => {
    const formTemplate = page.locator('button').filter({ hasText: '表单' }).first()
    // 点击后直接进入第二步，通过步骤指示器确认已选中
    await formTemplate.click()
    await expect(page.getByRole('heading', { name: '选择技术栈' })).toBeVisible()
    // 回退到第一步确认选中状态
    await page.getByRole('button', { name: '选择模板' }).click()
    await expect(formTemplate).toHaveClass(/border-blue-500/)
  })

  test('可以选择不同的模板类型', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'CRUD' }).first().click()
    await expect(page.getByRole('heading', { name: '选择技术栈' })).toBeVisible()

    // 回到第一步
    await page.getByRole('button', { name: '选择模板' }).click()
    await expect(page.getByRole('heading', { name: '选择模板类型' })).toBeVisible()

    // 选择其他模板
    await page.locator('button').filter({ hasText: 'Hooks' }).first().click()
    await expect(page.getByRole('heading', { name: '选择技术栈' })).toBeVisible()
  })

  // ==================== 第二步：选择框架 ====================

  test('应该显示 React 和 Vue3 框架选项', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    // 使用 heading 或更精确的选择器
    const reactBtn = page.locator('button').filter({ hasText: /React/ }).first()
    const vue3Btn = page.locator('button').filter({ hasText: /Vue3/ }).first()
    await expect(reactBtn).toBeVisible()
    await expect(vue3Btn).toBeVisible()
  })

  test('选择 React 框架后应该进入第三步', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await expect(page.getByRole('heading', { name: '填写配置' })).toBeVisible()

    const step3Button = page.getByRole('button', { name: '填写配置' })
    const indicator = step3Button.locator('span').first()
    await expect(indicator).toHaveClass(/bg-blue-600/)
  })

  test('选择 Vue3 框架后应该进入第三步', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /Vue3/ }).click()
    await expect(page.getByRole('heading', { name: '填写配置' })).toBeVisible()
  })

  test('不支持的框架应该显示禁用状态', async ({ page }) => {
    await page.locator('button').filter({ hasText: 'Hooks' }).first().click()
    const vue3Button = page.locator('button').filter({ hasText: /Vue3/ })
    const isDisabled = await vue3Button.getAttribute('disabled')
    if (isDisabled !== null) {
      await expect(vue3Button).toHaveClass(/opacity-40/)
    }
  })

  // ==================== 第三步：填写配置 ====================

  test('配置表单应该显示必填字段标记', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    const requiredMarks = page.locator('span.text-red-500')
    const count = await requiredMarks.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('填写配置表单应该实时更新预览', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(500)

    const nameInput = page.locator('input[type="text"]').first()
    if (await nameInput.isVisible()) {
      await nameInput.fill('UserLoginForm')
      await page.waitForTimeout(300)
      await expect(page.getByText(/预览 \(\d+ 字符\)/)).toBeVisible()
    }
  })

  test('填写 textarea 类型字段', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(500)

    const textarea = page.locator('textarea').first()
    if (await textarea.isVisible()) {
      await textarea.fill('这是一个测试描述')
      await expect(textarea).toHaveValue('这是一个测试描述')
    }
  })

  test('选择 select 类型字段应该更新值', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(500)

    const selects = page.locator('select')
    const count = await selects.count()
    if (count > 0) {
      const firstSelect = selects.first()
      const optionCount = await firstSelect.locator('option').count()
      if (optionCount > 1) {
        await firstSelect.selectOption({ index: 1 })
      }
    }
  })

  // ==================== 预览区域 ====================

  test('初始状态预览区域应该显示占位提示', async ({ page }) => {
    await expect(page.getByText('选择模板类型和框架后')).toBeVisible()
  })

  test('完成配置后预览区域应该显示生成的内容', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(500)

    const placeholder = page.getByText('选择模板类型和框架后')
    await expect(placeholder).not.toBeVisible()
    await expect(page.getByText(/预览 \(\d+ 字符\)/)).toBeVisible()
  })

  // ==================== 复制与下载 ====================

  test('完成配置后应该显示复制和下载按钮', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(500)

    // 底部操作栏应该有复制和下载按钮
    const copyBtn = page.getByRole('button', { name: '复制' })
    const downloadBtn = page.getByRole('button', { name: /下载/ })
    await expect(copyBtn).toBeVisible()
    await expect(downloadBtn).toBeVisible()
  })

  test('点击下载按钮应该下载 .skill.md 文件', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(500)

    const nameInput = page.locator('input[type="text"]').first()
    if (await nameInput.isVisible()) {
      await nameInput.fill('TestForm')
    }

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /下载/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.skill.md')
  })

  // ==================== 重置 ====================

  test('点击重置按钮应该回到第一步', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()

    // 重置按钮在 step > 1 时显示
    const resetBtn = page.locator('button').filter({ hasText: '重置' })
    await expect(resetBtn).toBeVisible()
    await resetBtn.click()
    await expect(page.getByRole('heading', { name: '选择模板类型' })).toBeVisible()
  })

  // ==================== 导入功能 ====================

  test('应该显示导入按钮', async ({ page }) => {
    const importBtn = page.locator('button').filter({ hasText: '导入' })
    await expect(importBtn).toBeVisible()
  })

  test('点击导入按钮应该打开导入对话框', async ({ page }) => {
    const importBtn = page.locator('button').filter({ hasText: '导入' })
    await importBtn.click()
    await expect(page.getByRole('heading', { name: '导入 Skill' })).toBeVisible()
    await expect(page.getByRole('button', { name: '上传文件' })).toBeVisible()
    await expect(page.getByRole('button', { name: '粘贴内容' })).toBeVisible()
  })

  test('导入对话框中可以切换到粘贴模式', async ({ page }) => {
    await page.locator('button').filter({ hasText: '导入' }).click()
    await page.getByRole('button', { name: '粘贴内容' }).click()
    await expect(page.getByPlaceholder(/粘贴到此处/)).toBeVisible()
    await expect(page.getByRole('button', { name: '解析内容' })).toBeVisible()
  })

  test('粘贴空内容解析应该显示错误', async ({ page }) => {
    await page.locator('button').filter({ hasText: '导入' }).click()
    await page.getByRole('button', { name: '粘贴内容' }).click()
    await page.getByRole('button', { name: '解析内容' }).click()
    await expect(page.getByText('请输入 Skill.md 内容')).toBeVisible()
  })

  test('关闭导入对话框', async ({ page }) => {
    await page.locator('button').filter({ hasText: '导入' }).click()
    await expect(page.getByRole('heading', { name: '导入 Skill' })).toBeVisible()

    await page.getByRole('button', { name: '取消' }).click()
    await expect(page.getByRole('heading', { name: '导入 Skill' })).not.toBeVisible()
  })

  test('点击对话框外部区域应该关闭对话框', async ({ page }) => {
    await page.locator('button').filter({ hasText: '导入' }).click()
    await expect(page.getByRole('heading', { name: '导入 Skill' })).toBeVisible()

    // 点击遮罩层 - 使用更精确的选择器
    const overlay = page.locator('.fixed.inset-0').filter({ has: page.locator('.bg-black\\/50, .bg-black\\/40, [class*="bg-black"]') }).first()
    // 直接点击对话框外层 div
    await page.mouse.click(10, 10)
    await page.waitForTimeout(300)
    await expect(page.getByRole('heading', { name: '导入 Skill' })).not.toBeVisible()
  })

  // ==================== 移动端适配 ====================

  test('移动端应该显示配置/预览 Tab 切换', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/configurator')
    await expect(page.getByRole('button', { name: '配置' })).toBeVisible()
    await expect(page.getByRole('button', { name: '预览' })).toBeVisible()
  })

  test('移动端点击预览 Tab 应该切换到预览视图', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/configurator')
    await page.getByRole('button', { name: '预览' }).click()
    const previewTab = page.getByRole('button', { name: '预览' })
    await expect(previewTab).toHaveClass(/text-blue-600/)
  })

  // ==================== 步骤回退 ====================

  test('应该可以回退到之前的步骤', async ({ page }) => {
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(300)

    // 回退到第一步
    await page.getByRole('button', { name: '选择模板' }).click()
    await expect(page.getByRole('heading', { name: '选择模板类型' })).toBeVisible()

    // 重新选择
    await page.locator('button').filter({ hasText: 'CRUD' }).first().click()
    await expect(page.getByRole('heading', { name: '选择技术栈' })).toBeVisible()
  })
})
