import { Button, Heading } from "@radix-ui/themes";
import Link from "next/link";

const Dashboard = () => {
  return (
    <div>
      <Heading>Dashboard</Heading>
      <Button asChild>
        <Link href="/transactions/addNew">Add New</Link>
      </Button>
    </div>
  );
};

export default Dashboard;
