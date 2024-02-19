'use client'

import React from 'react'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { useSession } from 'next-auth/react'
import { Avatar, Button, IconButton, Popover } from '@radix-ui/themes'
import { User } from '@prisma/client'
import Link from 'next/link'

type UserAvatarProps = {
  user: User
}

const UserAvatarMenu: React.FC<UserAvatarProps> = ({ user }) => {
  const userInitials = `${user.firstName.charAt(0)} ${user.lastName.charAt(0)}`

  return (
    <div className="ml-4">
      {user.image && <Avatar src={user.image} fallback={userInitials} />}

      <Popover.Root>
        <Popover.Trigger>
          <IconButton variant="ghost" aria-label="User avatar">
            <Avatar fallback={userInitials} />
          </IconButton>
        </Popover.Trigger>
        <Popover.Content style={{ width: 360 }}>
          <ul>
            <li>
              <Button asChild>
                <Link href="/api/auth/signout">Sign out</Link>
              </Button>
            </li>
          </ul>
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}

const AppNavbar = () => {
  const session = useSession()
  const user = session.data?.user

  return (
    <NavigationMenu.Root className="relative z-[1] flex w-screen justify-end items-center h-full px-6">
      <NavigationMenu.List className="flex gap-4 items-center h-full ml-auto">
        {/* {routes.map(({ href, name }) => (
          <NavigationMenu.Item key={name}>
            <NavigationMenu.Link href={href}>
              <Button>{name}</Button>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        ))} */}

        {/* <NavigationMenu.Indicator className="data-[state=visible]:animate-fadeIn data-[state=hidden]:animate-fadeOut top-full z-[1] flex h-[10px] items-end justify-center overflow-hidden transition-[width,transform_250ms_ease]">
          <div className="relative top-[70%] h-[10px] w-[10px] rotate-[45deg] rounded-tl-[2px] bg-white" />
        </NavigationMenu.Indicator> */}
      </NavigationMenu.List>

      {user && <UserAvatarMenu user={user} />}

      <div className="perspective-[2000px] absolute top-full left-0 flex w-full justify-center">
        <NavigationMenu.Viewport className="data-[state=open]:animate-scaleIn data-[state=closed]:animate-scaleOut relative mt-[10px] h-[var(--radix-navigation-menu-viewport-height)] w-full origin-[top_center] overflow-hidden rounded-[6px] bg-white transition-[width,_height] duration-300 sm:w-[var(--radix-navigation-menu-viewport-width)]" />
      </div>
    </NavigationMenu.Root>
  )
}

export default AppNavbar
