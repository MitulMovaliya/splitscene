import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      <div className="">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          SplitScene
        </h1>
      </div>
    </>
  );
}
