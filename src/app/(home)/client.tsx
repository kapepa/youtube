"use client"

import { trpc } from "@/trpc/client";
import { FC } from "react";

const PageClient: FC = () => {
  const [data] = trpc.hello.useSuspenseQuery({ text: "Karma" })

  return (
    <div>
      {data.greeting}
    </div>
  )
}

export { PageClient }