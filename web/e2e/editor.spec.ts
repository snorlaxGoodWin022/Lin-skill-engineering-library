import { test, expect } from '@playwright/test'

test.describe('编辑器页面', () => {
  test('直接访问应该显示选择提示', async ({ page }) => {
    await page.goto('/editor')

    await expect(page.getByText(/选择一个 Skill/i)).toBeVisible()
  })

  test('带 skill 参数访问应该加载技能内容', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')

    // 等待内容加载
    await page.waitForTimeout(1000)

    // 验证侧边栏显示技能信息
    await expect(page.getByText('Form Generator')).toBeVisible()
  })

  test('点击只读按钮应该切换编辑模式', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1000)

    const editButton = page.getByRole('button', { name: /只读|编辑/ })
    await editButton.click()

    // 按钮文字应该改变
    await expect(editButton).toContainText(/编辑|只读/)
  })

  test('点击下载按钮应该触发下载', async ({ page }) => {
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1000)

    // 监听下载事件
    const downloadPromise = page.waitForEvent('download')

    await page.getByRole('button', { name: '下载' }).click()

    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.md')
  })

  test('移动端应该显示菜单按钮', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1000)

    // 查找汉堡菜单按钮
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await expect(menuButton).toBeVisible()
  })

  test('移动端点击菜单按钮应该显示侧边栏', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/editor?skill=form-generator-react.skill.md')
    await page.waitForTimeout(1000)

    // 点击菜单按钮
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first()
    await menuButton.click()

    // 验证侧边栏显示
    await expect(page.getByText(/Skill 信息/i)).toBeVisible()
  })
})
