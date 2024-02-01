import { getAuthServerSession } from "@/utils/auth";
import { db } from "@/utils/db";
import { Transaction, TransactionType } from "@prisma/client";
import { Avatar, Box, Button, Card, Flex, Grid, Text } from "@radix-ui/themes";
import Link from "next/link";
import { redirect } from "next/navigation";

const Transactions = async () => {
  const session = await getAuthServerSession();

  if (!session?.user.id) {
    return redirect("/api/auth/signin");
  }

  const transactions: Transaction[] = await db.transaction.findMany({
    where: { userId: session.user.id },
  });

  return (
    <>
      <Button asChild>
        <Link href="/app/transactions/addNew">Add transaction</Link>
      </Button>
      <Grid className="my-6">
        {transactions.map((transaction) => (
          <Card asChild>
            <Link href={`/app/transactions/edit/${transaction.id}`}>
              <Flex gap="3" align="center">
                <Avatar
                  size="3"
                  // src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
                  radius="full"
                  fallback="T"
                />
                <Box>
                  <Text as="p" size="2" weight="bold">
                    {transaction.title}
                  </Text>
                  <Text as="p" size="2" color="gray">
                    {transaction.type === TransactionType.INCOME ? "+" : "-"}{" "}
                    {transaction.amount} PLN
                  </Text>
                </Box>
              </Flex>
            </Link>
          </Card>
        ))}
      </Grid>
    </>
  );
};

export default Transactions;
