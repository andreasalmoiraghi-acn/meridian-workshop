import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('loads page with title and KPI cards', async ({ page }) => {
    await expect(page.locator('.page-header h2')).toBeVisible()
    // Dashboard uses .kpi-value cards, not generic .stat-value
    await expect(page.locator('.kpi-value').first()).toBeVisible({ timeout: 10000 })
  })

  test('navigation links are all present', async ({ page }) => {
    const nav = page.locator('.nav-tabs')
    await expect(nav.getByRole('link', { name: /inventory/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /orders/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /reports/i })).toBeVisible()
    await expect(nav.getByRole('link', { name: /restocking/i })).toBeVisible()
  })

  test('filter bar is visible', async ({ page }) => {
    await expect(page.locator('.filter-bar, [class*="filter"]').first()).toBeVisible()
  })

  test('dark mode toggle switches theme when present', async ({ page }) => {
    // This test is meaningful only when the dark mode feature branch is merged
    const toggle = page.locator('.theme-toggle')
    const isPresent = await toggle.isVisible()
    if (!isPresent) {
      test.skip(true, 'Dark mode toggle not present on this branch (D3 feature/dark-mode)')
      return
    }
    const htmlBefore = await page.locator('html').getAttribute('data-theme')
    await toggle.click()
    const htmlAfter = await page.locator('html').getAttribute('data-theme')
    expect(htmlAfter).not.toBe(htmlBefore)
    await toggle.click()
  })
})
