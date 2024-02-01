import TransactionManagementForm from "@/components/transactions/TransactionManagementForm/TransactionManagementForm";
import { db } from "@/utils/db";
import { Transaction } from "@prisma/client";
import { Button, Grid } from "@radix-ui/themes";
import Link from "next/link";

const EditTransaction = async ({ params }: { params: { id: string } }) => {
  // @TODO Validate user
  const transaction: Transaction = await db.transaction.findUnique({
    where: { id: params.id },
  });

  return (
    <>
      <Button asChild>
        <Link href="/app/transactions">Cancel</Link>
      </Button>
      <Grid className="py-6">
        <TransactionManagementForm initialData={transaction} />
      </Grid>
    </>
  );
};

export default EditTransaction;
