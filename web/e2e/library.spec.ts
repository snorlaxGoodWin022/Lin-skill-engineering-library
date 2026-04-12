import { test, expect } from '@playwright/test'

test.describe('技能库页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library')
  })

  // ==================== 基础渲染 ====================

  test('应该显示技能库标题', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '技能库' })).toBeVisible()
  })

  test('应该显示搜索框', async ({ page }) => {
    await expect(page.getByPlaceholder('搜索 Skill...')).toBeVisible()
  })

  test('应该显示框架和分类下拉选择器', async ({ page }) => {
    const selects = page.locator('select')
    const count = await selects.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  // ==================== 搜索功能 ====================

  test('搜索应该筛选技能列表', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索 Skill...')
    await searchInput.fill('表单')
    await page.waitForTimeout(500)

    const cards = page.locator('.rounded-lg.cursor-pointer')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('搜索无匹配结果时应该显示空状态', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索 Skill...')
    await searchInput.fill('zzzzzzz_nonexistent')
    await page.waitForTimeout(500)

    const cards = page.locator('.rounded-lg.cursor-pointer')
    const count = await cards.count()
    expect(count).toBe(0)
  })

  test('清空搜索应该恢复全部结果', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索 Skill...')

    // 先搜索
    await searchInput.fill('表单')
    await page.waitForTimeout(500)
    const filteredCount = await page.locator('.rounded-lg.cursor-pointer').count()

    // 清空搜索
    await searchInput.clear()
    await page.waitForTimeout(500)
    const totalCount = await page.locator('.rounded-lg.cursor-pointer').count()

    expect(totalCount).toBeGreaterThanOrEqual(filteredCount)
  })

  // ==================== 框架筛选 ====================

  test('选择 React 框架应该过滤列表', async ({ page }) => {
    const frameworkSelect = page.locator('select').first()
    await frameworkSelect.selectOption('react')
    await page.waitForTimeout(500)

    const badges = page.locator('text=React')
    const count = await badges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('选择 Vue3 框架应该过滤列表', async ({ page }) => {
    const frameworkSelect = page.locator('select').first()
    await frameworkSelect.selectOption('vue3')
    await page.waitForTimeout(500)

    const badges = page.locator('text=Vue3')
    const count = await badges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('选择全部框架应该显示所有技能', async ({ page }) => {
    const frameworkSelect = page.locator('select').first()
    await frameworkSelect.selectOption('all')
    await page.waitForTimeout(500)

    const cards = page.locator('.rounded-lg.cursor-pointer')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  // ==================== 分类筛选 ====================

  test('选择分类应该过滤列表', async ({ page }) => {
    const selects = page.locator('select')
    const categorySelect = selects.nth(1)
    await categorySelect.selectOption({ index: 1 })
    await page.waitForTimeout(500)

    const cards = page.locator('.rounded-lg.cursor-pointer')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  // ==================== 技能卡片交互 ====================

  test('点击技能卡片应该跳转到编辑器页面', async ({ page }) => {
    const firstCard = page.locator('[class*="rounded-lg"][class*="cursor-pointer"]').first()
    await firstCard.click()
    await expect(page).toHaveURL(/\/editor\?skill=/)
  })

  test('技能卡片应该显示标题和描述', async ({ page }) => {
    const firstCard = page.locator('[class*="rounded-lg"][class*="cursor-pointer"]').first()
    // 卡片应该包含文字内容（标题和描述）
    const textContent = await firstCard.textContent()
    expect(textContent?.trim().length).toBeGreaterThan(0)
  })

  // ==================== URL 参数筛选 ====================

  test('带 category 参数访问应该自动筛选', async ({ page }) => {
    await page.goto('/library?category=form')
    await page.waitForTimeout(500)

    // 分类选择器应该显示对应值
    const cards = page.locator('.rounded-lg.cursor-pointer')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  // ==================== 移动端适配 ====================

  test('移动端应该显示筛选按钮', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/library')

    const filterButton = page.locator('button').filter({ has: page.locator('svg') })
    await expect(filterButton.first()).toBeVisible()
  })

  test('移动端搜索框应该可用', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/library')

    const searchInput = page.getByPlaceholder('搜索 Skill...')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('test')
    await expect(searchInput).toHaveValue('test')
  })

  // ==================== 组合筛选 ====================

  test('搜索和框架筛选可以同时使用', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索 Skill...')
    await searchInput.fill('表单')

    const frameworkSelect = page.locator('select').first()
    await frameworkSelect.selectOption('react')
    await page.waitForTimeout(500)

    const cards = page.locator('.rounded-lg.cursor-pointer')
    const count = await cards.count()
    // 应该有结果（表单 + react 组合）
    expect(count).toBeGreaterThan(0)
  })
})
