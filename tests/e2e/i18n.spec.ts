import { test, expect } from '@playwright/test'

test.describe('Language switching (i18n)', () => {
  test.beforeEach(async ({ page }) => {
    // Reset to English before each test
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('default language is English', async ({ page }) => {
    const header = await page.locator('.page-header h2').innerText()
    // Should be English (not Japanese characters)
    expect(header).not.toMatch(/[぀-ヿ㐀-䶿一-鿿]/)
  })

  test('switching to Japanese changes nav and page text', async ({ page }) => {
    // Open language switcher
    const langButton = page.locator('.language-button')
    await langButton.click()

    const jaOption = page.locator('.dropdown-item').filter({ hasText: '日本語' })
    await expect(jaOption).toBeVisible()
    await jaOption.click()

    await page.waitForTimeout(300)

    // Page header should now contain Japanese characters
    const header = await page.locator('.page-header h2').innerText()
    expect(header).toMatch(/[぀-ヿ㐀-䶿一-鿿]/)
  })

  test('language preference persists on page navigation', async ({ page }) => {
    // Switch to Japanese
    await page.locator('.language-button').click()
    await page.locator('.dropdown-item').filter({ hasText: '日本語' }).click()
    await page.waitForTimeout(200)

    // Navigate to another page
    await page.goto('/inventory')
    await page.waitForLoadState('networkidle')

    const header = await page.locator('.page-header h2').innerText()
    expect(header).toMatch(/[぀-ヿ㐀-䶿一-鿿]/)

    // Restore English
    await page.locator('.language-button').click()
    await page.locator('.dropdown-item').filter({ hasText: 'English' }).click()
  })
})
