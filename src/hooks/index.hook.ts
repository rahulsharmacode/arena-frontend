import { getOptions } from "@/services/api.services";
import { baseURL } from "@/services/index.services";
import { getObjQuery } from "@/utils/helper/index.helper";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// interface ApiResponse<T> {
//   count: number;
//   next: string | null;
//   previous: string | null;
//   results: T[];
// }

const useInfiniteScroller = ({
  endpoint = "",
  filter = {},
  enabled = false,
  key = "",
}) => {
  const fetchRequest = async ({ pageParam = 1 }): Promise<any> => {
    const size = 10;
    const res = await fetch(
      `${baseURL}${endpoint}?page=${pageParam}&size=${size}&ordering=order&${getObjQuery(
        filter
      )}`,
      getOptions()
    );
    if (!res.ok) throw new Error("Failed to fetch universities");
    return res.json();
  };
  const pathname = usePathname();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isPending,
    refetch,
  } = useInfiniteQuery<any, Error>({
    queryKey: key ? [key] : [`${pathname}-listing-scroll`, filter],
    // @ts-ignore
    queryFn: fetchRequest,
    initialPageParam: 1,
  getNextPageParam: (lastPage) => {
  const currentPage = lastPage.currentPage ?? 1;
  const totalPages = lastPage.totalPages;

  if (currentPage < totalPages) {
    return currentPage + 1;
  }
  return undefined;
},
    enabled,
  });

  return {
    status,
    data,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isPending,
    refetch,
  };
};
const useDebounce = ({
  initalValue,
  delay,
}: {
  initalValue: string;
  delay: number;
}): string => {
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setValue(initalValue);
    }, delay);
    return () => clearTimeout(timer);
  }, [initalValue]);
  return value;
};


const usePathname = () => {
  const location = useLocation();
  let data = location.pathname?.split("/");
  if (data.length > 2) return data.slice(1).join("-");
  return data[1] ?? "";
};
export { useDebounce, useInfiniteScroller,usePathname };
