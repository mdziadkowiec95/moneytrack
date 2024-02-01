import TransactionManagementForm from "@/components/transactions/TransactionManagementForm/TransactionManagementForm";
import { Button, Grid } from "@radix-ui/themes";
import Link from "next/link";

const AddNew = () => {
  return (
    <>
      <Button asChild>
        <Link href="/app/transactions">Cancel</Link>
      </Button>

      <Grid className="py-6">
        <TransactionManagementForm />
      </Grid>
    </>
  );
};

export default AddNew;
