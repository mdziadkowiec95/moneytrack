import { test } from '@playwright/test'
import { USERS } from '@/e2e/utils/users'

import { TransactionType } from '@prisma/client'
import { DEFAULT_ACCOUNT } from '@/e2e/utils/defaults'
import { withPages } from '@/e2e/utils/pages'

test(
  'sign in and sign out',
  withPages(async (pages) => {
    const { Home, Login, Dashboard } = pages

    await Home.goToHomePage()
    await Home.clickSignInButton()

    await Login.signIn(USERS.STANDARD)

    await Dashboard.verifyDashboardElementsAfterLogin()
    await Dashboard.openUserProfileMenu()
    await Dashboard.clickSignOutButton()
  })
)

test(
  'add account',
  withPages(async (pages) => {
    const { Home, AppNavbar, Login, Accounts, AddAccount } = pages

    await Home.goToHomePage()
    await Home.clickSignInButton()

    await Login.signIn(USERS.STANDARD)

    await AppNavbar.clickOnAccountsNavItem()

    await Accounts.clickOnAddNewAccount()

    await AddAccount.addNewAccount({ name: 'Test Add New Account' })

    await Accounts.checkIfAccountExists('Test Add New Account')
  })
)

test(
  'add transaction and remove transaction',
  withPages(async (pages) => {
    const {
      Home,
      Dashboard,
      Transactions,
      Login,
      AddTransaction,
      EditTransaction,
    } = pages

    await Home.goToHomePage()
    await Home.clickSignInButton()

    await Login.signIn(USERS.STANDARD)

    await Dashboard.checkIfDashboardPageIsLoaded()

    await Dashboard.clickOnAddNewTransaction()

    await AddTransaction.checkIfPageIsLoaded()
    await AddTransaction.fillNewTransactionForm({
      title: 'First test transaction',
      amount: '100',
      date: '2024-01-07',
      time: '15:30',
      category: 'Car',
      transactionType: TransactionType.OUTCOME,
      accountName: DEFAULT_ACCOUNT,
    })
    await AddTransaction.saveTransaction()

    await Transactions.checkIfPageIsLoaded()
    await Transactions.verifyExistingTransactionContent({
      transactionName: 'First test transaction',
      dateTimeText: '1/7/2024, 3:30:00 PM',
    })

    await Transactions.clickOnTransaction('First test transaction')
    await EditTransaction.checkIfPageIsLoaded()
    await EditTransaction.clickOnDeleteButton()

    await Transactions.checkIfPageIsLoaded()
    await Transactions.checkIfTransactionDoesNotExist('First test transaction')
  })
)
