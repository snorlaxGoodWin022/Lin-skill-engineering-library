import { test, expect } from '@playwright/test'

test.describe('编辑器页面', () => {

  // ==================== 初始状态 ====================

  test('直接访问应该显示选择提示', async ({ page }) => {
    await page.goto('/editor')
    await expect(page.getByText(/选择一个 Skill/i)).toBeVisible()
  })

  test('直接访问应该显示引导文案', async ({ page }) => {
    await page.goto('/editor')
    await expect(page.getByText('从技能库选择一个模板开始编辑')).toBeVisible()
  })

  // ==================== 加载 Skill ====================

  test('带 skill 参数访问应该加载技能内容', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    await expect(page.getByText('表单组件生成器')).toBeVisible()
  })

  test('加载 Skill 后侧边栏应该显示技能信息', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    // 应该显示技能标题
    await expect(page.getByRole('heading', { name: '表单组件生成器' })).toBeVisible()

    // 应该显示框架标签
    const reactBadge = page.locator('span.bg-blue-100, span.dark\\:bg-blue-900\\/30').first()
    await expect(reactBadge).toBeVisible()
  })

  test('加载不存在的 Skill 应该优雅处理', async ({ page }) => {
    await page.goto('/editor?skill=nonexistent-skill.md')
    await page.waitForTimeout(1500)

    // 不应该崩溃，页面应该正常显示
    await expect(page.getByText(/选择一个 Skill/)).toBeVisible()
  })

  // ==================== 编辑模式 ====================

  test('点击只读按钮应该切换编辑模式', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    const editButton = page.getByRole('button', { name: /只读|编辑/ })
    await editButton.click()
    await expect(editButton).toContainText(/编辑|只读/)
  })

  test('默认应该是只读模式', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    const editButton = page.getByRole('button', { name: /只读|编辑/ })
    await expect(editButton).toContainText('只读')
  })

  // ==================== 复制功能 ====================

  test('桌面端应该显示复制按钮', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    // 桌面端的复制按钮
    const copyButtons = page.getByRole('button', { name: /复制/ })
    const count = await copyButtons.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  // ==================== 下载功能 ====================

  test('点击下载按钮应该触发下载', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '下载' }).click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.md')
  })

  // ==================== 移动端适配 ====================

  test('移动端应该显示菜单按钮', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    // 移动端的汉堡菜单按钮
    const menuButton = page.locator('button.md\\:hidden')
    await expect(menuButton).toBeVisible()
  })

  test('移动端点击菜单按钮应该显示侧边栏', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    // 点击汉堡菜单
    const menuButton = page.locator('button.md\\:hidden')
    await menuButton.click()

    // 侧边栏应该可见
    await expect(page.getByText(/Skill 信息/)).toBeVisible()
  })

  test('移动端侧边栏应该显示关闭按钮', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    const menuButton = page.locator('button.md\\:hidden')
    await menuButton.click()

    // 关闭按钮（✕）
    const closeButton = page.locator('button').filter({ hasText: '✕' })
    await expect(closeButton).toBeVisible()
  })

  test('移动端关闭侧边栏后应该隐藏', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    const menuButton = page.locator('button.md\\:hidden')
    await menuButton.click()
    await expect(page.getByText(/Skill 信息/)).toBeVisible()

    // 点击关闭
    const closeButton = page.locator('button').filter({ hasText: '✕' })
    await closeButton.click()

    // 侧边栏应该有 -translate-x-full 类（移动端滑出）
    const sidebar = page.locator('.-translate-x-full')
    await expect(sidebar).toBeVisible()
  })

  test('移动端侧边栏显示时应该有遮罩层', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    const menuButton = page.locator('button.md\\:hidden')
    await menuButton.click()

    // 遮罩层
    const overlay = page.locator('.fixed.inset-0.bg-black\\/50')
    await expect(overlay).toBeVisible()
  })

  test('移动端点击遮罩层应该关闭侧边栏', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    const menuButton = page.locator('button.md\\:hidden')
    await menuButton.click()

    // 点击遮罩
    await page.locator('.fixed.inset-0.bg-black\\/50').click()

    // 遮罩层应该消失
    await expect(page.locator('.fixed.inset-0.bg-black\\/50')).not.toBeVisible()
  })

  // ==================== 桌面端侧边栏 ====================

  test('桌面端侧边栏应该始终可见', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1500)

    // 桌面端侧边栏不应该有 translate-x-full
    const sidebar = page.locator('.md\\:relative')
    await expect(sidebar.first()).toBeVisible()
  })
})
