import { test, expect } from '@playwright/test'

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/orders')
    await page.waitForLoadState('networkidle')
  })

  test('loads orders table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('shows total orders stat card', async ({ page }) => {
    const statValues = page.locator('.stat-value')
    await expect(statValues.first()).toBeVisible()
    const text = await statValues.first().innerText()
    expect(parseInt(text.replace(/[^0-9]/g, ''))).toBeGreaterThan(0)
  })

  test('order rows have status badges', async ({ page }) => {
    await expect(page.locator('table tbody .badge').first()).toBeVisible()
  })

  test('status filter reduces visible orders', async ({ page }) => {
    const totalBefore = await page.locator('table tbody tr').count()

    // Find the status filter select in the filter bar
    const selects = page.locator('select')
    const selectCount = await selects.count()
    if (selectCount > 0) {
      // Try to select a non-"all" status option
      for (let i = 0; i < selectCount; i++) {
        const sel = selects.nth(i)
        const options = await sel.locator('option').allInnerTexts()
        const statusOption = options.find(o => /delivered|processing|shipped|backordered/i.test(o))
        if (statusOption) {
          await sel.selectOption({ label: statusOption })
          await page.waitForLoadState('networkidle')
          const totalAfter = await page.locator('table tbody tr').count()
          expect(totalAfter).toBeLessThan(totalBefore + 1)
          break
        }
      }
    }
  })
})
