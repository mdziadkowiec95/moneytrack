'use client'

import React from 'react'
import { ArrowLeftIcon, PlusIcon } from '@radix-ui/react-icons'
import { IconButton } from '@radix-ui/themes'
import Link from 'next/link'

const buttonIconTypes = new Map([
  ['add', PlusIcon],
  ['back', ArrowLeftIcon],
])

type ButtonIconProps = {
  type: 'add' | 'back'
  href?: string
  label: string
  onClick?: () => void
}

const ButtonIcon = ({ type, label, href = '#', onClick }: ButtonIconProps) => {
  const Icon = buttonIconTypes.get(type)

  const onLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()

    onClick?.()
  }

  return (
    <IconButton className="rounded-full" aria-label={label} asChild>
      <Link href={href} onClick={onClick ? onLinkClick : undefined}>
        {Icon && <Icon width="18" height="18" />}
      </Link>
    </IconButton>
  )
}

export default ButtonIcon
