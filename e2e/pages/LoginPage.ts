import { Locator, Page, expect } from '@playwright/test'
import { TestUserE2E } from '../utils/users'

export default class LoginPage {
  readonly page: Page

  readonly userAvatarButton: Locator

  constructor(page: Page) {
    this.page = page

    this.userAvatarButton = page.getByRole('button', { name: 'User avatar' })
  }

  async signIn(user: TestUserE2E) {
    // Expect a title "to contain" a substring.
    await expect(this.page).toHaveTitle('Sign In')
    await this.page.getByLabel('Email').pressSequentially(user.email)
    await this.page.getByLabel('Password').pressSequentially(user.password)
    await this.page
      .getByRole('button', { name: 'Sign in with Credentials' })
      .click()

    await this.page.waitForURL('/app')
  }
}
