import { getAuthServerSession } from "@/utils/auth";
import { db } from "@/utils/db";
import { FinanceSource } from "@prisma/client";
import { Avatar, Button, Card, Flex, Grid, Text, Box } from "@radix-ui/themes";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const AccountsPage = async () => {
  const session = await getAuthServerSession();

  if (!session?.user.id) {
    return redirect("/api/auth/signin");
  }

  const financeSources = (await db.financeSource.findMany({
    where: {
      userId: session.user.id,
    },
  })) as FinanceSource[];

  console.log({ financeSources });

  return (
    <div>
      <Grid columns="2">
        <Button asChild>
          <Link href="/app/transactions/addNew">Add account</Link>
        </Button>
        <Button asChild>
          <Link href="/app/">Dashboard</Link>
        </Button>
      </Grid>

      <Grid className="my-6" gap="2" columns="3">
        {financeSources.map((financeSource) => (
          <Card key={financeSource.id} asChild>
            <Link href={`/app/accounts/edit/${financeSource.id}`}>
              <Flex gap="3" align="center">
                <Avatar size="3" radius="full" fallback="T" />
                <Box>
                  <Text as="p" size="2" weight="bold">
                    {financeSource.name}
                  </Text>
                  <Text as="p" size="2" color="gray">
                    {financeSource.type}
                  </Text>
                </Box>
              </Flex>
            </Link>
          </Card>
        ))}

        <Card key="add-new-account" asChild>
          <Link href={`/app/accounts/addNew`}>
            <Flex gap="3" align="center">
              <Avatar size="3" radius="full" fallback="+" />
              <Box>
                <Text as="p" size="2" weight="bold">
                  + Add new account
                </Text>
              </Box>
            </Flex>
          </Link>
        </Card>
      </Grid>
    </div>
  );
};

export default AccountsPage;
