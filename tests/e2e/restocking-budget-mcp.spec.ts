import { test, expect } from '@playwright/test'

/**
 * Restocking budget flow — written with Playwright MCP guidance.
 *
 * Key difference vs CLI approach: selectors and assertions are derived from
 * the live accessibility snapshot, not guessed from source code.
 * The MCP navigated the real app, inspected the DOM, and confirmed:
 *   - budget $76,000 → 2 "Within budget", 2 "Over budget"
 *   - greedy allocation: SRV-301 ($44,500) + PSU-508 ($30,608) = $75,108
 *   - SRV-302 is skipped even though it comes second (would exceed budget)
 */

test.describe('Restocking budget allocation (MCP-derived)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/restocking')
    await page.waitForLoadState('networkidle')
  })

  test('page loads with correct initial state — no budget active', async ({ page }) => {
    // Stat cards visible
    await expect(page.getByText('Items to Restock')).toBeVisible()
    await expect(page.getByText('High Priority')).toBeVisible()
    await expect(page.getByText('Total Estimated Cost')).toBeVisible()

    // "Within Budget" card only appears when a budget is active
    await expect(page.getByText('Within Budget')).not.toBeVisible()

    // Apply button disabled when input is empty
    await expect(page.getByRole('button', { name: 'Apply Budget' })).toBeDisabled()
  })

  test('applying $76,000 budget marks 2 items within budget', async ({ page }) => {
    // Fill budget input and apply
    await page.getByPlaceholder(/enter budget/i).fill('76000')
    await page.getByRole('button', { name: 'Apply Budget' }).click()
    await page.waitForLoadState('networkidle')

    // Active budget badge appears
    await expect(page.getByText('Active budget: $76,000')).toBeVisible()

    // Within Budget stat card shows 2
    const withinBudgetCard = page.locator('.stat-card.success')
    await expect(withinBudgetCard).toBeVisible()
    await expect(withinBudgetCard.locator('.stat-value')).toHaveText('2')

    // Budget column appears in table
    const budgetHeader = page.getByRole('columnheader', { name: 'Budget' })
    await expect(budgetHeader).toBeVisible()
  })

  test('greedy allocation: SRV-301 and PSU-508 within budget, SRV-302 and TMP-201 over', async ({ page }) => {
    await page.getByPlaceholder(/enter budget/i).fill('76000')
    await page.getByRole('button', { name: 'Apply Budget' }).click()
    await page.waitForLoadState('networkidle')

    const rows = page.locator('table tbody tr')

    // SRV-301 ($44,500) — fits first, within budget
    const srv301Row = rows.filter({ hasText: 'SRV-301' })
    await expect(srv301Row.getByText('Within budget')).toBeVisible()

    // SRV-302 ($41,325) — would push total to $85,825, over budget
    const srv302Row = rows.filter({ hasText: 'SRV-302' })
    await expect(srv302Row.getByText('Over budget')).toBeVisible()

    // PSU-508 ($30,608) — fits in remaining $31,500, within budget
    const psu508Row = rows.filter({ hasText: 'PSU-508' })
    await expect(psu508Row.getByText('Within budget')).toBeVisible()

    // TMP-201 ($25,508) — no room left, over budget
    const tmp201Row = rows.filter({ hasText: 'TMP-201' })
    await expect(tmp201Row.getByText('Over budget')).toBeVisible()
  })

  test('clearing budget removes Within Budget card and Budget column', async ({ page }) => {
    // Apply budget first
    await page.getByPlaceholder(/enter budget/i).fill('76000')
    await page.getByRole('button', { name: 'Apply Budget' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.locator('.stat-card.success')).toBeVisible()

    // Clear it
    await page.getByRole('button', { name: 'Clear' }).click()
    await page.waitForLoadState('networkidle')

    // Budget card and column gone
    await expect(page.locator('.stat-card.success')).not.toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Budget' })).not.toBeVisible()
    await expect(page.getByText(/active budget/i)).not.toBeVisible()
  })

  test('budget below cheapest item marks all rows over budget', async ({ page }) => {
    await page.getByPlaceholder(/enter budget/i).fill('1000')
    await page.getByRole('button', { name: 'Apply Budget' }).click()
    await page.waitForLoadState('networkidle')

    // Within Budget stat should show 0
    const withinBudgetValue = page.locator('.stat-card.success .stat-value')
    await expect(withinBudgetValue).toHaveText('0')

    // All rows show Over budget
    const overBudgetBadges = page.getByText('Over budget')
    await expect(overBudgetBadges).toHaveCount(4)
  })
})
