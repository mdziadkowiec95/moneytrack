import AuthProvider from "@/components/AuthProvider/AuthProvider";
import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
} from "@radix-ui/themes";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Component } from "react";

type WithAuth = (Component: React.FC) => NextPage<any>;

const Dashboard = () => {
  return (
    <div>
      <Heading>Dashboard</Heading>
      <Button asChild>
        <Link href="/app/transactions/addNew">Add New</Link>
      </Button>

      <Grid columns="2" className="pt-4">
        <Card size="1" style={{ width: 350 }} asChild>
          <Link href="/app/transactions">
            {" "}
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
      </Grid>
    </div>
  );
};

export default Dashboard;
