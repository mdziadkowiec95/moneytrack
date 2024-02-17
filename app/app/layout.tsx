import AppNavbar from '@/components/Navbar/AppNavbar'
import { DashboardIcon, LoopIcon, MaskOffIcon } from '@radix-ui/react-icons'
import { Box, Container, Grid, IconButton } from '@radix-ui/themes'
import { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
}

const ICON_MAP = {
  dashboard: DashboardIcon,
  transactions: LoopIcon,
  accounts: MaskOffIcon,
}

type SidebarItemProps = {
  href: string
  name: keyof typeof ICON_MAP
  children: string
}

const SidebarItem: React.FC<SidebarItemProps> = ({ children, name, href }) => {
  const IconComponent = ICON_MAP[name]

  return (
    <li>
      <Link href={href} className="py-3 flex flex-col items-center">
        <IconButton
          radius="full"
          variant="ghost"
          size="4"
          className="cursor-pointer"
        >
          <IconComponent width="22px" height="22px" />
        </IconButton>
        <p className="mt-4 text-sm">{children}</p>
      </Link>
    </li>
  )
}

// @ts-expect-error - connect wit ESLINT
const DashboardLayout = ({ children }) => {
  const SIDEBAR_ITEMS: SidebarItemProps[] = [
    { name: 'dashboard', href: '/app', children: 'Overview' },
    {
      name: 'transactions',
      href: '/app/transactions',
      children: 'Transactions',
    },
    { name: 'accounts', href: '/app/accounts', children: 'Accounts' },
  ]
  return (
    <Grid rows="100px 1fr" columns="200px 1fr" className="grid-flow-col">
      <header className="bg-indigo-dark fixed top-0 left-0 h-24 row-span-2">
        <AppNavbar />
      </header>

      <Box
        asChild
        className="bg-indigo-dark fixed top-0 left-0 h-screen p-5 pt-[100px]"
      >
        <aside>
          <nav>
            <ul>
              {SIDEBAR_ITEMS.map((item, index) => (
                <SidebarItem key={index} href={item.href} name={item.name}>
                  {item.children}
                </SidebarItem>
              ))}
            </ul>
          </nav>
        </aside>
      </Box>

      <Container className="col-start-2 row-start-2 py-5">
        <div>{children}</div>
      </Container>
    </Grid>
  )
}

export default DashboardLayout
