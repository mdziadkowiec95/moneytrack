import { Locator, Page } from '@playwright/test'

export default class AppNavbar {
  readonly page: Page
  readonly accountsNavItem: Locator

  constructor(page: Page) {
    this.page = page

    this.accountsNavItem = page.getByRole('link', { name: /Accounts/ })
  }

  async clickOnAccountsNavItem() {
    await this.accountsNavItem.click()
  }
}
