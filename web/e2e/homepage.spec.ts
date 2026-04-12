import { test, expect } from '@playwright/test'

test.describe('首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ==================== 基础渲染 ====================

  test('应该正确显示页面标题', async ({ page }) => {
    await expect(page.getByText('Skills Template Library')).toBeVisible()
  })

  test('应该显示副标题描述', async ({ page }) => {
    await expect(page.getByText('AI 代码生成模板库，帮助开发者快速生成符合项目规范的代码')).toBeVisible()
  })

  // ==================== 统计卡片 ====================

  test('应该显示统计卡片', async ({ page }) => {
    const statsSection = page.locator('section').filter({ hasText: '全部模板' })
    await expect(statsSection.getByText('全部模板')).toBeVisible()
    await expect(statsSection.locator('div').filter({ hasText: /^React$/ })).toBeVisible()
    await expect(statsSection.getByText('Vue3')).toBeVisible()
    await expect(statsSection.getByText('通用')).toBeVisible()
  })

  test('统计数字应该是正整数', async ({ page }) => {
    // 全部模板数量
    const totalStat = page.locator('text=全部模板').locator('..').locator('div').first()
    const totalText = await totalStat.textContent()
    expect(Number(totalText)).toBeGreaterThan(0)
  })

  // ==================== 分类浏览 ====================

  test('应该显示分类浏览卡片', async ({ page }) => {
    await expect(page.getByText('按分类浏览')).toBeVisible()
  })

  test('每个分类卡片应该显示模板数量', async ({ page }) => {
    const categoryCards = page.locator('section').filter({ hasText: '按分类浏览' }).locator('a')
    const count = await categoryCards.count()
    expect(count).toBeGreaterThanOrEqual(3)

    // 每个卡片应该有 "个模板" 文本
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(categoryCards.nth(i).getByText('个模板')).toBeVisible()
    }
  })

  // ==================== 最近更新 ====================

  test('应该显示最近更新区域', async ({ page }) => {
    await expect(page.getByText('最近更新')).toBeVisible()
  })

  test('最近更新应该显示最多6条记录', async ({ page }) => {
    const recentItems = page.locator('section').filter({ hasText: '最近更新' }).locator('a[href*="/editor"]')
    const count = await recentItems.count()
    expect(count).toBeLessThanOrEqual(6)
    expect(count).toBeGreaterThan(0)
  })

  test('最近更新的条目应该显示框架标签', async ({ page }) => {
    const recentSection = page.locator('section').filter({ hasText: '最近更新' })
    // 至少有一个 React 或 Vue3 标签
    const hasReact = await recentSection.getByText('React').first().isVisible()
    const hasVue3 = await recentSection.getByText('Vue3').first().isVisible()
    expect(hasReact || hasVue3).toBeTruthy()
  })

  test('点击查看全部应该跳转到技能库', async ({ page }) => {
    await page.getByText('查看全部 →').click()
    await expect(page).toHaveURL('/library')
  })

  // ==================== 功能特点 ====================

  test('应该显示功能特点区域', async ({ page }) => {
    await expect(page.getByText('功能特点')).toBeVisible()
    await expect(page.getByText('20+ 模板')).toBeVisible()
    await expect(page.getByText('双栈支持')).toBeVisible()
    await expect(page.getByText('在线编辑')).toBeVisible()
  })

  // ==================== 导航按钮 ====================

  test('点击浏览技能库按钮应该跳转到技能库页面', async ({ page }) => {
    await page.getByRole('link', { name: '浏览技能库' }).click()
    await expect(page).toHaveURL('/library')
  })

  test('点击打开编辑器按钮应该跳转到编辑器页面', async ({ page }) => {
    await page.getByRole('link', { name: '打开编辑器' }).click()
    await expect(page).toHaveURL('/editor')
  })

  test('点击分类卡片应该跳转到对应的筛选页面', async ({ page }) => {
    const categoryCard = page.locator('section').filter({ hasText: '按分类浏览' }).locator('a').first()
    await categoryCard.click()
    await expect(page).toHaveURL(/\/library\?category=/)
  })

  test('点击最近更新的技能应该跳转到编辑器', async ({ page }) => {
    const firstRecent = page.locator('section').filter({ hasText: '最近更新' }).locator('a[href*="/editor"]').first()
    await firstRecent.click()
    await expect(page).toHaveURL(/\/editor\?skill=/)
  })

  // ==================== 响应式 ====================

  test('移动端 Hero 区域应该正常显示', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page.getByText('Skills Template Library')).toBeVisible()
    await expect(page.getByRole('link', { name: '浏览技能库' })).toBeVisible()
    await expect(page.getByRole('link', { name: '打开编辑器' })).toBeVisible()
  })

  test('移动端统计卡片应该正常排列', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // 4列统计在移动端应该都可见
    const statsSection = page.locator('section').filter({ hasText: '全部模板' })
    await expect(statsSection.getByText('全部模板')).toBeVisible()
    await expect(statsSection.locator('div').filter({ hasText: /^React$/ })).toBeVisible()
    await expect(statsSection.getByText('Vue3')).toBeVisible()
    await expect(statsSection.getByText('通用')).toBeVisible()
  })
})
