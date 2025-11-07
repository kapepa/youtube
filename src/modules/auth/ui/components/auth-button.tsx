"use client"

import { Button } from "@/components/ui/button";
import { UserCircleIcon } from "lucide-react";
import { FC } from "react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

const AuthButton: FC = () => {
  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton
          mode="modal"
        >
          <Button
            variant="outline"
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border-blue-500/20 rounded-full shadow-none"
          >
            <UserCircleIcon />
            Sing in
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  )
}

export { AuthButton }