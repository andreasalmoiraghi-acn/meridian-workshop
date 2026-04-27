import { test, expect } from '@playwright/test'

test.describe('Restocking Recommendations (R2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking')
    await page.waitForLoadState('networkidle')
  })

  test('loads recommendations table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('table tbody tr').first()).toBeVisible()
  })

  test('shows stat cards: total items, high priority, estimated cost', async ({ page }) => {
    await expect(page.locator('.stat-card').first()).toBeVisible({ timeout: 10000 })
    const count = await page.locator('.stat-card').count()
    expect(count).toBeGreaterThan(2)
  })

  test('each recommendation row has a priority badge', async ({ page }) => {
    const badges = page.locator('table tbody .badge')
    await expect(badges.first()).toBeVisible()
    const text = await badges.first().innerText()
    expect(text.toLowerCase()).toMatch(/high|medium|low/i)
  })

  test('budget input applies filter and shows within-budget column', async ({ page }) => {
    const budgetInput = page.locator('input[type="number"]')
    await expect(budgetInput).toBeVisible()

    await budgetInput.fill('50000')
    await page.locator('button').filter({ hasText: /apply|apply budget/i }).click()
    await page.waitForLoadState('networkidle')

    // Budget column header should appear
    const headers = await page.locator('table thead th').allInnerTexts()
    const hasBudgetCol = headers.some(h => /budget/i.test(h))
    expect(hasBudgetCol).toBe(true)

    // At least one within-budget badge should be present
    const budgetBadges = page.locator('table tbody td .badge')
    await expect(budgetBadges.first()).toBeVisible()
  })

  test('clear budget removes budget column', async ({ page }) => {
    const budgetInput = page.locator('input[type="number"]')
    await budgetInput.fill('50000')
    await page.locator('button').filter({ hasText: /apply|apply budget/i }).click()
    await page.waitForLoadState('networkidle')

    const clearBtn = page.locator('button').filter({ hasText: /clear/i })
    await expect(clearBtn).toBeVisible()
    await clearBtn.click()
    await page.waitForLoadState('networkidle')

    const headers = await page.locator('table thead th').allInnerTexts()
    const hasBudgetCol = headers.some(h => /budget/i.test(h))
    expect(hasBudgetCol).toBe(false)
  })

  test('high priority items appear before medium and low', async ({ page }) => {
    const badges = page.locator('table tbody tr .badge').filter({ hasText: /high|medium|low/i })
    const count = await badges.count()
    if (count < 2) return

    const priorities: string[] = []
    for (let i = 0; i < Math.min(count, 6); i++) {
      priorities.push((await badges.nth(i).innerText()).toLowerCase())
    }

    const priorityOrder = ['high', 'medium', 'low']
    for (let i = 1; i < priorities.length; i++) {
      const prev = priorityOrder.indexOf(priorities[i - 1])
      const curr = priorityOrder.indexOf(priorities[i])
      if (prev !== -1 && curr !== -1) {
        expect(prev).toBeLessThan(curr + 1)
      }
    }
  })
})
