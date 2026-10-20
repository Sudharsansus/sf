import { expect, test } from '@playwright/test'

test('landing renders key sections', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/ISAII/i)
  await expect(page.getByRole('heading', { level: 2, name: /Frequently asked/i })).toBeVisible()
  await expect(page.getByRole('tab', { name: /India/ })).toBeVisible()
})

test('health endpoint responds', async ({ request }) => {
  expect((await request.get('/api/health')).status()).toBeLessThan(500)
})
