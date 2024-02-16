import { test, expect } from '@playwright/test'

const USERS = {
  STANDARD: {
    email: 'e2e_standard@mailinator.com',
    password: 'test1234',
  },
}

test('sign in', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Sign in' }).click()

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Sign In')
  await page.getByLabel('Email').pressSequentially(USERS.STANDARD.email)
  await page.getByLabel('Password').pressSequentially(USERS.STANDARD.password)
  await page.getByRole('button', { name: 'Sign in with Credentials' }).click()

  await page.waitForURL('/app')
  await expect(page).toHaveTitle('Dashboard')

  await expect(
    page.getByRole('button', {
      name: 'Sign in',
    })
  ).not.toBeVisible()

  await expect(
    page.getByRole('button', {
      name: 'Sign out',
    })
  ).toBeVisible()

  await expect(page.getByTestId('balance-card')).toBeVisible()
})

test('add account', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Sign in' }).click()

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('Sign In')
  await page.getByLabel('Email').pressSequentially(USERS.STANDARD.email)
  await page.getByLabel('Password').pressSequentially(USERS.STANDARD.password)
  await page.getByRole('button', { name: 'Sign in with Credentials' }).click()

  await page.waitForURL('/app')
  await expect(page).toHaveTitle('Dashboard')

  await page.getByRole('link', { name: /Accounts/ }).click()

  await page.getByRole('link', { name: /Add new account/ }).click()

  await page.getByLabel('Name').pressSequentially('Default Cash Account')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(
    page.getByRole('link', { name: /Default Cash Account/ })
  ).toBeVisible()
})

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/')

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click()

//   // Expects page to have a heading with the name of Installation.
//   await expect(
//     page.getByRole('heading', { name: 'Installation' })
//   ).toBeVisible()
// })
