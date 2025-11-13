import { useEffect, useRef, useState } from "react"

const useIntersectionObserver = (options: IntersectionObserverInit) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [isIntersection, setIsIntersection] = useState<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersection(entry.isIntersecting)
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current)
    }

    return () => observer.disconnect();
  }, [options]);

  return { targetRef, isIntersection }
}

export { useIntersectionObserver }