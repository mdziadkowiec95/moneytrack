import { Locator, Page, expect } from '@playwright/test'

export default class DashboardPage {
  readonly page: Page

  readonly signOutButton: Locator
  readonly signInButton: Locator
  readonly userAvatarButton: Locator
  readonly accountsNavItem: Locator

  constructor(page: Page) {
    this.page = page
    this.signInButton = page.getByRole('button', { name: 'Sign in' })
    this.signOutButton = page.getByRole('link', { name: 'Sign out' })
    this.userAvatarButton = page.getByRole('button', { name: 'User avatar' })
    this.accountsNavItem = page.getByRole('link', { name: /Accounts/ })
  }

  async goToDashboardPage() {
    await this.page.goto('/app')
  }

  async verifyDashboardElementsAfterLogin() {
    await expect(this.signInButton).not.toBeVisible()
    await expect(this.page).toHaveTitle('Dashboard')
    await expect(this.userAvatarButton).toBeVisible()
    await expect(this.page.getByTestId('balance-card')).toBeVisible()
  }

  async clickOnAccountsNavItem() {
    await this.accountsNavItem.click()
  }

  async openUserProfileMenu() {
    await this.userAvatarButton.click()
  }

  async clickSignOutButton() {
    await this.signOutButton.click()
  }
}
