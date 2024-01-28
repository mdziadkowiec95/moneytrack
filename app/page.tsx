import { db } from "@/utils/db";
import Image from "next/image";

export default async function Home() {
  // await db.transaction.create({
  //   data: {
  //     title: "New car",
  //     date: new Date(),
  //   },
  // });

  const transactions = await db.transaction.findMany();

  console.log(transactions);

  return <div>home</div>;
}
