import { test, expect } from '@playwright/test'

test.describe('端到端用户流程', () => {

  // ==================== 流程 1：首页浏览 → 技能库 → 编辑器 ====================

  test('完整流程：从首页浏览到编辑器查看 Skill', async ({ page }) => {
    // 1. 访问首页
    await page.goto('/')
    await expect(page.getByText('Skills Template Library')).toBeVisible()

    // 2. 点击"浏览技能库"
    await page.getByRole('link', { name: '浏览技能库' }).click()
    await expect(page).toHaveURL('/library')
    await expect(page.getByRole('heading', { name: '技能库' })).toBeVisible()

    // 3. 等待技能卡片加载
    await page.waitForTimeout(1000)

    // 4. 点击第一个技能卡片
    const firstCard = page.locator('.rounded-lg.cursor-pointer').first()
    await firstCard.click()

    // 5. 应该跳转到编辑器
    await expect(page).toHaveURL(/\/editor\?skill=/)
    await page.waitForTimeout(1500)
  })

  // ==================== 流程 2：技能库搜索 → 筛选 → 编辑器 ====================

  test('完整流程：搜索并打开 Skill', async ({ page }) => {
    await page.goto('/library')

    // 1. 搜索
    const searchInput = page.getByPlaceholder('搜索 Skill...')
    await searchInput.fill('表单')
    await page.waitForTimeout(500)

    // 2. 确认有搜索结果
    const cards = page.locator('.rounded-lg.cursor-pointer')
    const countAfterSearch = await cards.count()
    expect(countAfterSearch).toBeGreaterThan(0)

    // 3. 点击搜索结果
    await cards.first().click()
    await expect(page).toHaveURL(/\/editor\?skill=/)
  })

  // ==================== 流程 3：配置器完整创建流程 ====================

  test('完整流程：使用配置器创建新 Skill', async ({ page }) => {
    await page.goto('/configurator')

    // 1. 选择模板类型
    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await expect(page.getByRole('heading', { name: '选择技术栈' })).toBeVisible()

    // 2. 选择框架
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await expect(page.getByRole('heading', { name: '填写配置' })).toBeVisible()

    // 3. 等待表单加载
    await page.waitForTimeout(500)

    // 4. 填写配置
    const textInputs = page.locator('input[type="text"]')
    const inputCount = await textInputs.count()
    if (inputCount > 0) {
      await textInputs.first().fill('ProductForm')
    }

    // 5. 验证预览
    await page.waitForTimeout(500)
    await expect(page.getByText(/预览 \(\d+ 字符\)/)).toBeVisible()

    // 6. 下载
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /下载/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.skill.md')
  })

  // ==================== 流程 4：配置器 CRUD 模板完整流程 ====================

  test('完整流程：使用配置器创建 CRUD 模板', async ({ page }) => {
    await page.goto('/configurator')

    await page.locator('button').filter({ hasText: 'CRUD' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(500)

    const textInputs = page.locator('input[type="text"]')
    const inputCount = await textInputs.count()
    if (inputCount > 0) {
      await textInputs.first().fill('UserManagement')
    }

    await page.waitForTimeout(500)
    await expect(page.getByText(/预览 \(\d+ 字符\)/)).toBeVisible()
  })

  // ==================== 流程 5：编辑器操作完整流程 ====================

  test('完整流程：编辑器加载、切换模式、下载', async ({ page }) => {
    await page.goto('/library')
    await page.waitForTimeout(1000)

    const firstCard = page.locator('.rounded-lg.cursor-pointer').first()
    await firstCard.click()
    await expect(page).toHaveURL(/\/editor\?skill=/)
    await page.waitForTimeout(1500)

    // 切换编辑模式
    const editButton = page.getByRole('button', { name: /只读|编辑/ })
    if (await editButton.isVisible()) {
      await editButton.click()
    }

    // 下载
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '下载' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.md')
  })

  // ==================== 流程 6：首页分类浏览 ====================

  test('完整流程：从首页分类卡片进入筛选页面', async ({ page }) => {
    await page.goto('/')
    const categoryCard = page.locator('section').filter({ hasText: '按分类浏览' }).locator('a').first()
    await categoryCard.click()
    await expect(page).toHaveURL(/\/library\?category=/)
    await expect(page.getByRole('heading', { name: '技能库' })).toBeVisible()
  })

  // ==================== 流程 7：跨页面导航 ====================

  test('通过导航栏连续访问所有页面应该正常工作', async ({ page }) => {
    const pages = [
      { path: '/library', heading: '技能库' },
      { path: '/configurator', heading: '选择模板类型' },
      { path: '/editor', check: /选择一个 Skill/ },
      { path: '/', check: 'Skills Template Library' },
    ]

    for (const p of pages) {
      await page.goto(p.path)
      if (p.heading) {
        await expect(page.getByRole('heading', { name: p.heading })).toBeVisible()
      } else {
        await expect(page.getByText(p.check!)).toBeVisible()
      }
    }
  })

  // ==================== 流程 8：配置器重置 ====================

  test('完整流程：配置器重置并重新选择模板', async ({ page }) => {
    await page.goto('/configurator')

    await page.locator('button').filter({ hasText: '表单' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(300)

    await page.locator('button').filter({ hasText: '重置' }).click()
    await expect(page.getByRole('heading', { name: '选择模板类型' })).toBeVisible()

    await page.locator('button').filter({ hasText: 'CRUD' }).first().click()
    await page.locator('button').filter({ hasText: /React/ }).first().click()
    await page.waitForTimeout(300)

    await expect(page.getByRole('heading', { name: '填写配置' })).toBeVisible()
  })

  // ==================== 流程 9：移动端完整浏览流程 ====================

  test('移动端完整流程：底部导航浏览各页面', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await expect(page.getByText('Skills Template Library')).toBeVisible()

    const bottomNav = page.locator('nav.fixed.bottom-0')

    await bottomNav.locator('a[href="/library"]').click()
    await expect(page).toHaveURL('/library')
    await expect(page.getByRole('heading', { name: '技能库' })).toBeVisible()

    await page.locator('nav.fixed.bottom-0 a[href="/configurator"]').click()
    await expect(page).toHaveURL('/configurator')

    await page.locator('nav.fixed.bottom-0 a[href="/editor"]').click()
    await expect(page).toHaveURL('/editor')
  })
})
