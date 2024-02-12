import BalanceChart from '@/components/BalanceChart/BalanceChart'
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
} from '@radix-ui/themes'
import Link from 'next/link'

const Dashboard = () => {
  return (
    <div>
      <Heading>Dashboard</Heading>
      <Button asChild>
        <Link href="/app/transactions/addNew">Add New</Link>
      </Button>

      <Grid columns="3" className="pt-4" gap="2">
        <Card size="2" asChild>
          <Link href="/app/accounts">
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="A" color="indigo" />
              <Box>
                <Text size="2" weight="bold">
                  Accounts
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>

        <Card size="2" asChild>
          <Link href="/app/transactions">
            {' '}
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="T" color="indigo" />
              <Box>
                <Text size="2" weight="bold">
                  Transactions
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>

        <Card size="2" asChild>
          <Link href="/app/balance">
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="B" color="indigo" />
              <Box>
                <Text size="2" weight="bold">
                  Balance
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>
      </Grid>

      <Grid>
        <BalanceChart />
      </Grid>
    </div>
  )
}

export default Dashboard
