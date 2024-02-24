import { Locator, Page, expect } from '@playwright/test'

export default class AccountPage {
  readonly page: Page

  readonly addNewAccountButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addNewAccountButton = page.getByRole('link', {
      name: /Add new account/,
    })
  }

  async clickOnAddNewAccount() {
    await this.addNewAccountButton.click()
  }

  async checkIfAccountExists(accountName: string) {
    await expect(
      this.page.getByRole('link', { name: accountName })
    ).toBeVisible()
  }
}
