"use client"

import { FC, useEffect, useState } from "react"
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface FilterCarouselProps {
  value?: string | null,
  isLoading?: boolean,
  onSelect: (value: string | null) => void,
  data: {
    value: string,
    label: string,
  }[],
}

const FilterCarousel: FC<FilterCarouselProps> = (props) => {
  const { data, value, onSelect, isLoading } = props;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    })
  }, [api]);

  console.log("categoryId", value)

  return (
    <div
      className="relative w-full"
    >
      <div
        className={
          cn(
            "absolute left-12 top-0 bottom-0 w-12 z-10 bg-linear-to-r from-white to-transparent pointer-events-none",
            current === 1 && "hidden",
          )
        }
      />
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          dragFree: true,
        }}
        className="w-full px-12"
      >
        <CarouselContent
          className="-ml-3"
        >
          {
            !isLoading && (
              <CarouselItem
                onClick={() => onSelect(null)}
                className="pl-3 basis-auto"
              >
                <Badge
                  variant={!value ? "default" : "secondary"}
                  className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
                >
                  All
                </Badge>

              </CarouselItem>
            )
          }
          {
            isLoading && Array.from({ length: 14 }).map((_, index) => (
              <CarouselItem
                key={index}
                className="pl-3 basis-auto"
              >
                <Skeleton
                  className="rounded-lg px-3 py-1 h-full text-sm w-[100px] font-semibold"
                >
                  &nbsp;
                </Skeleton>
              </CarouselItem>
            ))
          }
          {
            !isLoading && data.map((item) => (
              <CarouselItem
                key={item.value}
                onClick={() => onSelect(item.value)}
                className="pl-3 basis-auto"
              >
                <Badge
                  variant={value === item.value ? "default" : "secondary"}
                  className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
                >
                  {item.label}
                </Badge>
              </CarouselItem>
            ))
          }
        </CarouselContent>
        <CarouselPrevious
          className="left-0 z-20"
        />
        <CarouselNext
          className="right-0 z-20"
        />
      </Carousel>
      <div
        className={
          cn(
            "absolute right-12 top-0 bottom-0 w-12 z-10 bg-linear-to-l from-white to-transparent pointer-events-none",
            current === count && "hidden",
          )
        }
      />
    </div>
  )
}

export { FilterCarousel }