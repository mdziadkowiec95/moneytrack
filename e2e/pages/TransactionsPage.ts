import { Page, expect } from '@playwright/test'

export default class TransactionsPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  private getTransactionCardElement(transactionName: string) {
    return this.page.getByRole('link', { name: transactionName })
  }

  async checkIfPageIsLoaded() {
    await expect(this.page).toHaveTitle('Transactions')
  }

  async clickOnTransaction(transactionName: string) {
    await this.getTransactionCardElement(transactionName).click()
  }

  async verifyExistingTransactionContent({
    transactionName,
    dateTimeText,
  }: {
    transactionName: string
    dateTimeText: string
  }) {
    const existingTransactionCard =
      this.getTransactionCardElement(transactionName)

    await expect(existingTransactionCard).toBeVisible()

    await expect(existingTransactionCard.getByText(dateTimeText)).toBeVisible()
  }

  async checkIfTransactionDoesNotExist(transactionName: string) {
    await expect(
      this.getTransactionCardElement(transactionName)
    ).not.toBeVisible()
  }
}
