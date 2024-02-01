import { db } from "@/utils/db";
import Image from "next/image";

export default async function Home() {
  // await db.transaction.create({
  //   data: {
  //     title: "New car",
  //     date: new Date(),
  //   },
  // });

  return <div>home</div>;
}
