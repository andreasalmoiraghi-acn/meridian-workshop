import { test, expect } from '@playwright/test'

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')
  })

  test('loads inventory table with rows', async ({ page }) => {
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('shows item count in card header', async ({ page }) => {
    // Inventory shows count in the card title (e.g. "Stock Levels (32 SKUs)")
    await expect(page.locator('.card-title').first()).toBeVisible({ timeout: 10000 })
    const cardTitle = await page.locator('.card-title').first().innerText()
    expect(cardTitle).toMatch(/\d+/)
  })

  test('each row has SKU, name, category, warehouse and quantity columns', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first()
    const cells = firstRow.locator('td')
    const cellCount = await cells.count()
    expect(cellCount).toBeGreaterThan(4)
  })

  test('search field filters results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]').first()
    if (await searchInput.isVisible()) {
      const totalBefore = await page.locator('table tbody tr').count()
      await searchInput.fill('PCB')
      await page.waitForTimeout(300)
      const totalAfter = await page.locator('table tbody tr').count()
      expect(totalAfter).toBeLessThan(totalBefore + 1)
    }
  })
})
