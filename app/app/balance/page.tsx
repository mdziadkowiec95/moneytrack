import { getAuthServerSession } from "@/utils/auth";
import { db } from "@/utils/db";
import { Transaction } from "@prisma/client";
import { redirect } from "next/navigation";

const BalancePage = async () => {
  const session = await getAuthServerSession();

  if (!session?.user.id) {
    return redirect("/api/auth/signin");
  }

  const transactions = (await db.transaction.findMany({
    where: { userId: session.user.id },
  })) as Transaction[];

  console.log({ transactions });
  return (
    <div>
      <h1>Balance Page</h1>

      {/* Add your balance-related components and logic here */}
    </div>
  );
};

export default BalancePage;
