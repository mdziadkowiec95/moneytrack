'use client'
import { Flex, Heading } from '@radix-ui/themes'
import React from 'react'
import ButtonIcon from '../ButtonIcon/ButtonIcon'

type SectionHeaderProps = {
  children: React.ReactNode
  onAddButtonClick?: () => void
}

const SectionHeader = ({ onAddButtonClick, children }: SectionHeaderProps) => {
  return (
    <Flex justify="between">
      <Heading size="4" className="mb-4">
        {children}
      </Heading>
      <ButtonIcon
        type="add"
        label="Add new transaction"
        onClick={onAddButtonClick}
      />
    </Flex>
  )
}

export default SectionHeader
