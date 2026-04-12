import { test, expect } from '@playwright/test'

test.describe('全局导航与布局', () => {
  // ==================== Header 导航 ====================

  test('应该显示顶部导航栏', async ({ page }) => {
    await page.goto('/')
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('应该显示 Logo 和站点名称', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Skills Library')).toBeVisible()
    await expect(page.locator('header').getByText('20+')).toBeVisible()
  })

  test('桌面端应该显示导航链接', async ({ page }) => {
    await page.goto('/')
    // 使用更精确的导航选择器 - 通过 header 内的 nav
    const topNav = page.locator('header nav')
    await expect(topNav.getByText('首页')).toBeVisible()
    await expect(topNav.getByText('技能库')).toBeVisible()
    await expect(topNav.getByText('配置器')).toBeVisible()
    await expect(topNav.getByText('编辑器')).toBeVisible()
  })

  test('导航到各个页面应该正确高亮当前链接', async ({ page }) => {
    // 首页
    await page.goto('/')
    const homeLink = page.locator('header nav a[href="/"]')
    await expect(homeLink).toHaveClass(/bg-blue-50/)

    // 技能库
    await page.goto('/library')
    const libraryLink = page.locator('header nav a[href="/library"]')
    await expect(libraryLink).toHaveClass(/bg-blue-50/)

    // 配置器
    await page.goto('/configurator')
    const configLink = page.locator('header nav a[href="/configurator"]')
    await expect(configLink).toHaveClass(/bg-blue-50/)
  })

  test('点击导航链接应该跳转到对应页面', async ({ page }) => {
    await page.goto('/')
    const topNav = page.locator('header nav')

    await topNav.locator('a[href="/library"]').click()
    await expect(page).toHaveURL('/library')

    await page.locator('header nav a[href="/configurator"]').click()
    await expect(page).toHaveURL('/configurator')

    await page.locator('header nav a[href="/editor"]').click()
    await expect(page).toHaveURL('/editor')

    await page.locator('header nav a[href="/"]').click()
    await expect(page).toHaveURL('/')
  })

  // ==================== 暗黑模式 ====================

  test('应该显示暗黑模式切换按钮', async ({ page }) => {
    await page.goto('/')
    const darkModeButton = page.locator('button').filter({ hasText: '🌙' })
    await expect(darkModeButton).toBeVisible()
  })

  test('点击暗黑模式按钮应该切换为深色主题', async ({ page }) => {
    await page.goto('/')
    await page.locator('button').filter({ hasText: '🌙' }).click()

    const rootDiv = page.locator('div.min-h-screen').first()
    await expect(rootDiv).toHaveClass(/dark/)
    await expect(page.locator('button').filter({ hasText: '☀️' })).toBeVisible()
  })

  test('在暗黑模式下点击太阳按钮应该切换回亮色', async ({ page }) => {
    await page.goto('/')
    await page.locator('button').filter({ hasText: '🌙' }).click()
    await expect(page.locator('button').filter({ hasText: '☀️' })).toBeVisible()

    await page.locator('button').filter({ hasText: '☀️' }).click()
    await expect(page.locator('button').filter({ hasText: '🌙' })).toBeVisible()
  })

  // ==================== GitHub 链接 ====================

  test('应该显示 GitHub 链接', async ({ page }) => {
    await page.goto('/')
    const githubLink = page.locator('a[href*="github.com"]')
    await expect(githubLink).toBeVisible()
    await expect(githubLink).toHaveAttribute('target', '_blank')
  })

  // ==================== 移动端底部导航 ====================

  test('移动端应该显示底部导航栏', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const bottomNav = page.locator('nav.fixed.bottom-0')
    await expect(bottomNav).toBeVisible()
  })

  test('移动端底部导航应该包含所有页面链接', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const bottomNav = page.locator('nav.fixed.bottom-0')
    await expect(bottomNav.getByText('首页')).toBeVisible()
    await expect(bottomNav.getByText('技能库')).toBeVisible()
    await expect(bottomNav.getByText('配置器')).toBeVisible()
    await expect(bottomNav.getByText('编辑器')).toBeVisible()
  })

  test('移动端底部导航应该正确高亮当前页面', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/library')

    const libraryLink = page.locator('nav.fixed.bottom-0 a[href="/library"]')
    await expect(libraryLink).toHaveClass(/text-blue-600/)
  })

  test('移动端点击底部导航应该正确跳转', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await page.locator('nav.fixed.bottom-0 a[href="/library"]').click()
    await expect(page).toHaveURL('/library')
  })

  // ==================== 响应式布局 ====================

  test('桌面端应该隐藏底部导航', async ({ page }) => {
    await page.goto('/')
    const bottomNav = page.locator('nav.fixed.bottom-0')
    await expect(bottomNav).toBeHidden()
  })

  test('桌面端顶部导航应该在移动端隐藏', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    // header nav 在移动端应该隐藏
    const topNav = page.locator('header nav')
    await expect(topNav).toBeHidden()
  })

  // ==================== 页面 Title ====================

  test('各页面应该有正确的关键内容', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Skills Template Library')).toBeVisible()

    await page.goto('/library')
    await expect(page.getByRole('heading', { name: '技能库' })).toBeVisible()

    await page.goto('/configurator')
    await expect(page.getByRole('heading', { name: '选择模板类型' })).toBeVisible()

    await page.goto('/editor')
    await expect(page.getByText(/选择一个 Skill/)).toBeVisible()
  })
})
