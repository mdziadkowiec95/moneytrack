import { Locator, Page, expect } from '@playwright/test'

export default class EditTransactionPage {
  readonly page: Page

  readonly deleteButton: Locator

  constructor(page: Page) {
    this.page = page

    this.deleteButton = page.getByRole('button', { name: 'Delete' })
  }

  async checkIfPageIsLoaded() {
    await expect(this.page).toHaveTitle('Edit Transaction')
  }

  async clickOnDeleteButton() {
    await this.deleteButton.click()
  }
}
