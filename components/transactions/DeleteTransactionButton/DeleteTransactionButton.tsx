'use client'

import { deleteTransaction } from '@/app/actions'
import { TrashIcon } from '@radix-ui/react-icons'
import { IconButton } from '@radix-ui/themes'

export const DeleteTransactionButton = ({ id }: { id: string }) => {
  const onTransactionDelete = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()

    await deleteTransaction(id)
  }

  return (
    <IconButton onClick={onTransactionDelete}>
      <TrashIcon width="18" height="18" />
    </IconButton>
  )
}
