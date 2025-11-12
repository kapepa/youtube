"use client"

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { FC } from "react";

const StudioUploadModal: FC = () => {
  return (
    <Button
      variant="secondary"
    >
      <PlusIcon />
      Create
    </Button>
  )
}

export { StudioUploadModal }