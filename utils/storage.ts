export enum LocalStorageKeys {
  TRANSACTION_FILTERS_SELECTED_ACCOUNT_ID = 'transactionFilters.selectedAccountId',
}

export const actOnStorageValueChange = async (
  event: StorageEvent,
  key: LocalStorageKeys,
  callback: (newValue: StorageEvent['newValue']) => Promise<void> | void
) => {
  if (event.key === key) {
    await callback(event.newValue)
  }
}

export const updateLocalStorageItem = (
  key: LocalStorageKeys,
  value: string
) => {
  localStorage.setItem(key, value)
}

export const getLocalStorageItem = (key: LocalStorageKeys) => {
  return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
}
