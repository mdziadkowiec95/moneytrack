import { Locator, Page } from '@playwright/test'

export default class AddAccountPage {
  readonly page: Page

  readonly nameInput: Locator
  readonly saveButton: Locator
  readonly typeSelect: Locator

  constructor(page: Page) {
    this.page = page

    this.nameInput = page.getByLabel('Name')
    this.saveButton = page.getByRole('button', { name: 'Save' })
    this.typeSelect = page.getByRole('combobox', { name: 'Choose Account' })
  }

  async addNewAccount({
    name,
    type = 'Cash',
  }: {
    name: string
    type?: 'Cash' | 'Bank' | 'Investment'
  }) {
    await this.nameInput.pressSequentially(name)

    await this.typeSelect.click()
    await this.page.getByLabel(type).click()

    await this.saveButton.click()
  }
}
