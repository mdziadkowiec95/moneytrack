import {
  Page,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  PlaywrightWorkerArgs,
  PlaywrightWorkerOptions,
} from '@playwright/test'
import HomePage from '@/e2e/pages/HomePage'
import AppNavbar from '@/e2e/pages/AppNavbar'
import LoginPage from '@/e2e/pages/LoginPage'
import DashboardPage from '@/e2e/pages/DashboardPage'
import AccountsPage from '@/e2e/pages/AccountsPage'
import AddAccountPage from '@/e2e/pages/AddAccountPage'
import TransactionsPage from '@/e2e/pages/TransactionsPage'
import AddTransactionPage from '@/e2e/pages/AddTransactionPage'
import EditTransactionPage from '@/e2e/pages/EditTransactionPage'

type PlaywrightFixtures = PlaywrightTestArgs &
  PlaywrightTestOptions &
  PlaywrightWorkerArgs &
  PlaywrightWorkerOptions

const getPages = (page: Page) => {
  return {
    Home: new HomePage(page),
    AppNavbar: new AppNavbar(page),
    Login: new LoginPage(page),
    Dashboard: new DashboardPage(page),
    Accounts: new AccountsPage(page),
    AddAccount: new AddAccountPage(page),
    Transactions: new TransactionsPage(page),
    AddTransaction: new AddTransactionPage(page),
    EditTransaction: new EditTransactionPage(page),
  }
}

/**
 *
 * Higher order function to pass pages and fixtures to tests
 * Passes only needed Playwright fixtures to the callback
 */
export const withPages =
  (
    callback: (
      pages: ReturnType<typeof getPages>,
      fixtures: Pick<PlaywrightFixtures, 'page' | 'browser'>
    ) => Promise<void>
  ) =>
  async ({ page, browser }: PlaywrightFixtures) => {
    const pages = getPages(page)

    await callback(pages, { page, browser })
  }
