import { Locator, Page, expect } from '@playwright/test'

export default class DashboardPage {
  readonly page: Page

  readonly signOutButton: Locator
  readonly signInButton: Locator
  readonly userAvatarButton: Locator
  readonly addNewTransactionButton: Locator

  constructor(page: Page) {
    this.page = page

    this.signInButton = page.getByRole('button', { name: 'Sign in' })
    this.signOutButton = page.getByRole('link', { name: 'Sign out' })
    this.userAvatarButton = page.getByRole('button', { name: 'User avatar' })
    this.addNewTransactionButton = page.getByRole('link', {
      name: 'Add new transaction',
    })
  }

  async goToDashboardPage() {
    await this.page.goto('/app')
  }

  async checkIfDashboardPageIsLoaded() {
    await expect(this.page).toHaveTitle('Dashboard')
  }

  async verifyDashboardElementsAfterLogin() {
    await expect(this.signInButton).not.toBeVisible()
    await this.checkIfDashboardPageIsLoaded()
    await expect(this.userAvatarButton).toBeVisible()
    await expect(this.page.getByTestId('balance-card')).toBeVisible()
  }

  async openUserProfileMenu() {
    await this.userAvatarButton.click()
  }

  async clickOnAddNewTransaction() {
    await this.addNewTransactionButton.click()
  }

  async clickSignOutButton() {
    await this.signOutButton.click()
  }
}
