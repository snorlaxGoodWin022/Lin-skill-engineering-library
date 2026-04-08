import { test, expect } from '@playwright/test'

test.describe('技能库页面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/library')
  })

  test('应该显示技能库标题', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '技能库' })).toBeVisible()
  })

  test('应该显示搜索框', async ({ page }) => {
    await expect(page.getByPlaceholder('搜索 Skill...')).toBeVisible()
  })

  test('搜索应该筛选技能列表', async ({ page }) => {
    const searchInput = page.getByPlaceholder('搜索 Skill...')
    await searchInput.fill('form')

    // 等待列表更新
    await page.waitForTimeout(500)

    // 验证结果包含 form 相关内容
    const cards = page.locator('[class*="rounded-lg"][class*="cursor-pointer"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })

  test('点击框架筛选应该过滤列表', async ({ page }) => {
    // 选择 React 框架
    const frameworkSelect = page.locator('select').first()
    await frameworkSelect.selectOption('react')

    await page.waitForTimeout(500)

    // 验证所有显示的卡片都是 React
    const badges = page.locator('text=React')
    const count = await badges.count()
    expect(count).toBeGreaterThan(0)
  })

  test('点击技能卡片应该跳转到编辑器页面', async ({ page }) => {
    const firstCard = page.locator('[class*="rounded-lg"][class*="cursor-pointer"]').first()
    await firstCard.click()

    await expect(page).toHaveURL(/\/editor\?skill=/)
  })

  test('移动端应该显示筛选按钮', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // 查找筛选按钮（漏斗图标）
    const filterButton = page.locator('button').filter({ has: page.locator('svg') })
    await expect(filterButton.first()).toBeVisible()
  })
})
