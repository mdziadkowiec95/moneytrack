import AccountManagementForm from '@/components/AccountManagementForm/AccountManagementForm'
import {
  getAvailableCurrencies,
  getProfileBaseCurrency,
} from '@/utils/currency'

const AddNewAccount = async () => {
  const availableCurrencies = await getAvailableCurrencies()
  const baseCurrency = await getProfileBaseCurrency()

  return (
    <div>
      <AccountManagementForm
        availableCurrencies={availableCurrencies}
        baseCurrency={baseCurrency}
      />
    </div>
  )
}

export default AddNewAccount
