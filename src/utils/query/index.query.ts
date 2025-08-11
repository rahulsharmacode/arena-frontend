
import { getOptions, useAxiosCall } from "@/services/api.services";
import { METHODS } from "@/services/interface.services";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import axios from "axios";

/* post */
const usePostData = (): UseMutationResult<any, Error, any> => {
  return useMutation({
    mutationFn: async ({
      data,
      endpoint,
      method = METHODS.POST,
    }: {
      data: any;
      endpoint: string;
      method: METHODS;
    }) => {
      return await useAxiosCall({
        endpoint,
        body: data,
        method,
        id: [METHODS.PATCH, METHODS.PUT].includes(method) && data.id,
      });
    },
  });
};

/* list */
type UseListProps = {
  params?: object;
  id?: number | string;
  endpoint: string;
  key: string;
  window?: boolean;
  enabled?: boolean;
};

interface errorProps {
  status: number ,
  data: {detail:string}
};
interface ApiResponse<TData = any> {
  data: TData;
  status: number;
}
const useListData = <T>({
  params,
  id,
  endpoint,
  key = "datalisting",
  window = false,
  enabled = true,
}: UseListProps): UseQueryResult<T,errorProps> => {
  return useQuery<ApiResponse<T>>({
    queryKey: params ?  [key, params] : [key],
    queryFn: async () =>{
      return await useAxiosCall({
        params,
        id,
        endpoint,
        method: METHODS.GET
      })},
    refetchOnWindowFocus: window,
    enabled: enabled,
    staleTime:0,
    retry(failureCount, error) {
        console.log("🚀 ~ retry ~ failureCount, error:", failureCount, error)
    },
  });
};

/* delete */
const useDeleteData = (): UseMutationResult<any, Error, any> => {
  return useMutation({
    mutationFn: async ({ id, endpoint }) =>
      await useAxiosCall({ endpoint, id, method: METHODS.DELETE }),
  });
};

/* bulk delete */
const useBlukDeleteData = (): UseMutationResult<any, Error, any> => {
  return useMutation({
    mutationFn: async ({ data, endpoint }) =>
      await axios.post(import.meta.env.VITE_API + endpoint, data, getOptions()),
  });
};

export { useBlukDeleteData, useDeleteData, useListData, usePostData };
