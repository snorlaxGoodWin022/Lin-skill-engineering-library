import { test, expect } from '@playwright/test'

test.describe('首页', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('应该正确显示页面标题', async ({ page }) => {
    await expect(page.getByText('Skills Template Library')).toBeVisible()
  })

  test('应该显示统计卡片', async ({ page }) => {
    await expect(page.getByText('全部模板')).toBeVisible()
    await expect(page.getByText('React')).toBeVisible()
    await expect(page.getByText('Vue3')).toBeVisible()
  })

  test('应该显示分类浏览卡片', async ({ page }) => {
    await expect(page.getByText('按分类浏览')).toBeVisible()
  })

  test('点击浏览技能库按钮应该跳转到技能库页面', async ({ page }) => {
    await page.getByRole('link', { name: '浏览技能库' }).click()
    await expect(page).toHaveURL('/library')
  })

  test('点击打开编辑器按钮应该跳转到编辑器页面', async ({ page }) => {
    await page.getByRole('link', { name: '打开编辑器' }).click()
    await expect(page).toHaveURL('/editor')
  })

  test('点击分类卡片应该跳转到对应的筛选页面', async ({ page }) => {
    // 点击第一个分类卡片
    const categoryCard = page.locator('section').filter({ hasText: '按分类浏览' }).locator('a').first()
    await categoryCard.click()

    await expect(page).toHaveURL(/\/library\?category=/)
  })
})
