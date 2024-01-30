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

  const res = await fetch("http://localhost:3000/api/user/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "test1@moneytrack.app",
      password: "test1234",
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(await res.text());

  return <div>home</div>;
}
