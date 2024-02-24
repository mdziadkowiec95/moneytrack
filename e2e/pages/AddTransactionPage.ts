import { Locator, Page, expect } from '@playwright/test'
import { TransactionType } from '@prisma/client'

export default class AddTransactionPage {
  readonly page: Page

  readonly addNewTransactionButton: Locator
  readonly accountSelect: Locator
  readonly categorySelect: Locator
  readonly outcomeTypeButton: Locator
  readonly incomeTypeButton: Locator
  readonly titleInput: Locator
  readonly amountInput: Locator
  readonly datePicker: Locator
  readonly timePicker: Locator
  readonly saveButton: Locator

  constructor(page: Page) {
    this.page = page

    this.addNewTransactionButton = page.getByRole('link', { name: 'Add new' })
    this.accountSelect = page.getByRole('combobox', { name: 'Choose Account' })
    this.categorySelect = page.getByRole('combobox', {
      name: 'Choose Category',
    })
    this.incomeTypeButton = page.getByLabel('Select income transaction type')
    this.outcomeTypeButton = page.getByLabel('Select outcome transaction type')
    this.titleInput = page.getByLabel('title')
    this.amountInput = page.getByLabel('amount')
    this.datePicker = page.getByPlaceholder('YYYY-MM-DD')
    this.timePicker = page.getByLabel('Time')
    this.saveButton = page.getByRole('button', { name: 'Save' })
  }

  async clickOnAddNewTransaction() {
    await this.addNewTransactionButton.click()
  }

  async checkIfPageIsLoaded() {
    await expect(this.page).toHaveTitle('Add new transaction')
  }

  private async selectCategory(name: string) {
    await this.categorySelect.click()
    await this.page.getByLabel(name).click()
  }

  private async selectAccount(name: string) {
    await this.accountSelect.click()
    await this.page.getByLabel(name).click()
  }

  private async fillDateAndTime(date: string, time: string) {
    await this.datePicker.fill(date)
    await this.datePicker.blur()

    await this.timePicker.fill(time)
  }

  async fillNewTransactionForm({
    transactionType = TransactionType.INCOME,
    amount,
    accountName,
    title,
    category,
    date,
    time,
  }: {
    transactionType: TransactionType
    amount: string
    accountName: string
    title: string
    category: string
    date: string
    time: string
  }) {
    if (transactionType === TransactionType.INCOME) {
      await this.incomeTypeButton.click()
    } else {
      await this.outcomeTypeButton.click()
    }

    await this.amountInput.pressSequentially(amount)

    await this.selectAccount(accountName)

    await this.titleInput.pressSequentially(title)

    await this.selectCategory(category)

    await this.fillDateAndTime(date, time)
  }

  async saveTransaction() {
    await this.saveButton.click()
  }
}
