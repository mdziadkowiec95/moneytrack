import { test, expect } from '@playwright/test'
import { USERS } from '@/e2e/utils/users'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

test('sign in and sign out', async ({ page }) => {
  const Home = new HomePage(page)
  const Login = new LoginPage(page)
  const Dashboard = new DashboardPage(page)

  await Home.goToHomePage()

  await Home.clickSignInButton()

  await Login.signIn(USERS.STANDARD)

  await Dashboard.verifyDashboardElementsAfterLogin()

  await Dashboard.openUserProfileMenu()

  await Dashboard.clickSignOutButton()
})

test('add account', async ({ page }) => {
  const Home = new HomePage(page)
  const Login = new LoginPage(page)
  const Dashboard = new DashboardPage(page)

  await Home.goToHomePage()

  await Home.clickSignInButton()

  await Login.signIn(USERS.STANDARD)

  await Dashboard.clickOnAccountsNavItem()

  await page.getByRole('link', { name: /Add new account/ }).click()

  await page.getByLabel('Name').pressSequentially('Test Add New Account')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(
    page.getByRole('link', { name: /Test Add New Account/ })
  ).toBeVisible()
})

test('add transaction and remove transaction', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page).toHaveTitle('Sign In')
  await page.getByLabel('Email').pressSequentially(USERS.STANDARD.email)
  await page.getByLabel('Password').pressSequentially(USERS.STANDARD.password)
  await page.getByRole('button', { name: 'Sign in with Credentials' }).click()

  await page.waitForURL('/app')
  await expect(page).toHaveTitle('Dashboard')

  await page.getByRole('link', { name: 'Add new' }).click()

  await expect(page).toHaveTitle('Add new transaction')
  await page.getByLabel('Select outcome transaction type').click()
  await page.getByLabel('amount').pressSequentially('500')

  await page.getByRole('combobox', { name: 'Choose Account' }).click()

  await page.getByLabel('Default Cash Account').click()

  await page.getByLabel('title').pressSequentially('First test transaction')
  await page.getByRole('combobox', { name: 'Choose Category' }).click()
  await page.getByLabel('Car').click()

  const datePicker = page.getByPlaceholder('YYYY-MM-DD')

  await datePicker.pressSequentially('2024-01-07')
  await datePicker.blur()

  await page.getByLabel('Time').fill('15:30:00')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(page).toHaveTitle('Transactions')

  const addedTransactionCard = page.getByRole('link', {
    name: 'First test transaction',
  })

  await expect(addedTransactionCard).toBeVisible()

  await expect(
    addedTransactionCard.getByText('2/23/2202, 3:30:00 PM')
  ).toBeVisible()

  await addedTransactionCard.click()

  await expect(page).toHaveTitle('Edit transaction')

  await page.getByRole('button', { name: 'Delete' }).click()

  await expect(page).toHaveTitle('Transactions')

  await expect(
    page.getByRole('link', {
      name: 'First test transaction',
    })
  ).not.toBeVisible()
})
