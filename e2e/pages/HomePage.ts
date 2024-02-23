import { Page } from '@playwright/test'

export default class HomePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goToHomePage() {
    await this.page.goto('/')
  }

  async clickSignInButton() {
    await this.page.getByRole('button', { name: 'Sign in' }).click()
  }
}
