"use client"

import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constants";
import { ROUTERS } from "@/lib/routers";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, FormEvent, useState } from "react";

interface SearchInputProps {
  className?: string
}

const SearchInput: FC<SearchInputProps> = (props) => {
  const { className } = props;
  const router = useRouter();
  const [value, setValue] = useState<string>("");

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = new URL(`${ROUTERS.SEARCH}`, APP_URL ? `https://${APP_URL}` : "http://localhost:3000")
    const newQuery = value.trim();

    url.searchParams.set("query", encodeURIComponent(newQuery));
    if (newQuery === "") url.searchParams.delete("query");

    setValue(newQuery);
    router.push(url.toString());
  }

  return (
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-[600px]"
    >
      <div
        className="relative w-full"
      >
        <input
          name="search"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search"
          className="w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500"
        />
        {
          value && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setValue("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
            >
              <XIcon
                className="text-gray-500"
              />
            </Button>
          )
        }
      </div>
      <button
        type="submit"
        disabled={!value.trim()}
        className="px-5 py-2.5 bg-gray-100 border border-l-0 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SearchIcon
          className="size-5"
        />
      </button>
    </form>
  )
}

export { SearchInput }