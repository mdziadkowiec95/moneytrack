import { Heading } from '@radix-ui/themes'
import React from 'react'

type PageHeaderProps = {
  children: React.ReactNode
}

const PageHeader = ({ children }: PageHeaderProps) => {
  return (
    <Heading size="8" className="mb-6">
      {children}
    </Heading>
  )
}

export default PageHeader
