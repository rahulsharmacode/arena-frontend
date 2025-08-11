import { useInfiniteScroller } from "@/hooks/index.hook";
import { cn } from "@/lib/utils";
import { METHODS, SelectProps } from "@/services/interface.services";
import { formatSelectData } from "@/utils/helper/index.helper";
import { useDeleteData, usePostData } from "@/utils/query/index.query";

import {
    Check,
    ChevronsUpDown,
    Edit,
    Save,
    Trash2,
    XIcon
} from "lucide-react";
import React, {
    useEffect,
    useMemo,
    useState
} from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Skeleton } from "../ui/skeleton";
import { Tooltip } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { Spinner } from "../ui/spinner.";

type DNDProps = {
  onChange: (e: any) => void;
  cropperHeight?: number;
  cropperWidth?: number;
  error?: string | boolean;
  isMulti?: boolean;
  cropperHeightPlaceholder?: number;
  cropperWidthPlaceholder?: number;
  type?: "image" | "video";
  value?: any;
};
interface SelectComponentProps {
  endpoint?: string;
  format?: {
    value: string;
    key: string;
    mutate?: string;
  };

  settings?: {
    add?: boolean;
    update?: boolean;
    remove?: boolean;
    creatable?: boolean;
    debounce?: number;
  };
  onChange?: (value: any) => void;
  error?: boolean | string | undefined;
  isMulti?: boolean;
  defaultValue?: SelectProps[];
  defaultOptions?: SelectProps[];
  placeholder?: string;
  [key: string]: any;
}
const AsyncSelect: React.FC<SelectComponentProps> = ({
  endpoint,
  format = { value: "id", key: "name", mutate: "name" },
  settings = {
    add: false,
    update: false,
    creatable: true,
    remove: false,
    debounce: 1000,
  },
  disabled,
  onChange,
  error,
  isMulti = false,
  defaultValue = [],
  defaultOptions = [],
  placeholder = "Search ...",
  ...props
}) => {
  const { add, remove, update, creatable } = settings;
  /* -- api calls -- */
  const { ref, inView } = useInView();
  // console.log("default valuesssss", defaultValue);
  const [search, setSearch] = useState<string>("");
  const [edit, setEdit] = useState<SelectProps | null>(null);
  const [debouncedText, setDebouncedText] = useState<string>("");
  let [options, setOptions] = useState<any[]>(endpoint ? [] : defaultOptions);
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    status,
    fetchNextPage,
    refetch,
  } = useInfiniteScroller({
    endpoint,
    filter: { search: debouncedText, ...props.filter },
    enabled: endpoint ? true : false,
    key: `${endpoint}-async`,
  });

  let allScrolledData = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.data) || [];
  }, [data]);
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue);

  useEffect(() => {
    if (Array.isArray(allScrolledData) && endpoint) {
      const formatData = formatSelectData(
        Array.isArray(allScrolledData) ? allScrolledData : [],
        format.key,
        format.value
      );
      setOptions(() => formatData);
    }
  }, [allScrolledData]);
  useEffect(() => {
    if (defaultValue.length > 0) {
      // console.log("defaultValue", defaultValue);
      setValue(defaultValue);
    }
  }, [defaultValue]);
  // console.log("value", value);
  useEffect(() => {
    const debounce = setTimeout(() => {
      setDebouncedText(() => search);
    }, 1000);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleSetValue = (val: any) => {
    if (!isMulti) {
      setValue([val]);
      onChange?.([val]);
      return;
    }
    let findItem = value?.some(
      (item: SelectProps) => item["value"] === val["value"]
    );
    if (!findItem) {
      setValue((prev: SelectProps[]) => [...prev, val]);
      onChange?.([...value, val]);
    } else {
      let removed = value?.filter(
        (item: SelectProps) => item["value"] !== val["value"]
      );
      setValue(() => removed);
    }
  };

  /* */
  const { mutate: deleteMutate, isPending: deletePending } = useDeleteData();
  const onDelete = ({ item }: { item: SelectProps }) => {
    deleteMutate(
      {
        id: item["value"],
        endpoint,
      },
      {
        // @ts-ignore
        onSuccess: ({ status, data: updateData }, data) => {
          setValue((prev: SelectProps[]) => {
            const exists = prev.findIndex((s) => s?.value === item.value);
            if (exists !== -1) {
              return [...prev.slice(0, exists), ...prev.slice(exists + 1)];
            }
            return prev;
          });
          refetch();

          // console.log("🚀 ~ onDelete ~ updateData:", data)
          // setValue((prev) =>
          //   prev.filter((item: any) => item["value"] !== data["id"])
          // );
        },
      }
    );
  };

  const { mutate, isPending: mutatePending } = usePostData();

  const onSubmit = () => {
    if (creatable) {
      let newData = {
        label: search,
        value: search,
        isNew:true
      };
      setOptions(() => [newData]);
      setValue((prev: SelectProps[]) => [newData]);
      setSearch("");
      onChange?.([newData]);
      return;
    } else {
      mutate(
        {
          // @ts-ignore
          data: { [format.mutate]: search },
          endpoint: endpoint,
        },
        {
          // @ts-ignore
          onSuccess: ({ status, data: updateData }) => {
            let newData = {
              label: updateData[format.mutate],
              value: updateData["id"],
            };
            isMulti
              ? setValue((prev: SelectProps[]) => [...prev, newData])
              : setValue(() => [newData]);
            // allScrolledData.unshift(updateData);
            onChange?.(isMulti ? [...value, newData] : [newData]);
            refetch();
          },
        }
      );
    }
  };
  const onUpdate = () => {
    mutate(
      {
        // @ts-ignore
        data: { [format.mutate]: edit?.label, id: edit?.value },
        endpoint: endpoint,
        method: METHODS.PATCH,
      },
      {
        // @ts-ignore
        onSuccess: ({ status, data: updateData }) => {
          let newData = options.map((sitem) =>
            sitem.value == edit?.value ? edit : sitem
          );
          setOptions(() => newData);
          setValue((prev: SelectProps[]) =>
            prev?.map((item) => (item.value === edit?.value ? edit : item))
          );
          setEdit(null);
        },
      }
    );
  };

  return (
    <div
      className={cn([
        "w-full",
        props.className,
        `${disabled && "cursor-not-allowed"}`,
      ])}
    >
      <Popover open={open} modal={false} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            className={cn(
              [" w-full justify-between h-fit"],
              `${error && "border-red-500"}`,
              `${disabled && "cursor-not-allowed"}`
            )}
            onClick={() => {
              setOpen((prev) => !prev);
            }}
          >
            {open && value?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {" "}
                {value?.slice(0, 5).map((item: SelectProps, index: number) => (
                  <span
                    key={index}
                    className="text-white flex justify-center cursor-pointer items-center gap-2 rounded-full text-[14px] px-2 bg-[#1da077] max-w-[250px] truncate"
                  >
                    {item.label}
                  </span>
                ))}
                {value?.length > 5 && (
                  <Badge className="cursor-pointer bg-[#a7aba9] text-white hover:bg-[#1aa178] transition-all">
                    +{value?.length - 5} more
                  </Badge>
                )}
              </div>
            ) : (
              placeholder
            )}

            {isFetchingNextPage ? (
              <Spinner />
            ) : (
              <ChevronsUpDown className="opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className=" border-none p-0 !w-[var(--radix-popper-anchor-width)]"
        >
          <div className="relative w-full  p-[10]">
            <Input
              type="text"
              value={search}
              maxLength={90}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none shadow-none focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
            />

            <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg max-h-[250px] overflow-y-auto border border-gray-200 z-50">
              {options?.length > 0
                ? options?.map((framework) => (
                    <li
                      key={framework.value}
                      className="flex items-center group px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        !edit && handleSetValue(framework);
                      }}
                    >
                      {edit && framework.value === edit.value ? (
                        <input
                          className="outline-none max-w-[500px] border-b border-[#1aa178]"
                          type="text"
                          autoFocus
                          maxLength={90}
                          value={edit.label}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEdit((prev: any) => ({
                              ...prev,
                              ["label"]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault(); // prevent form submission
                              if (edit && edit.label) onUpdate();
                            }
                          }}
                        />
                      ) : (
                        framework.label
                      )}

                      <Check
                        className={cn(
                          "ml-auto h-4 w-4 transition-opacity",
                          value?.some(
                            (item: SelectProps) =>
                              item["value"] === framework.value
                          )
                            ? "opacity-100 text-green-500"
                            : "opacity-0"
                        )}
                      />
                      {defaultOptions.length == 0 && update && (
                        <div
                          className="ml-2 bg-slate-100 text-slate-600  group-hover:flex hidden items-center justify-center h-5 w-5 rounded cursor-pointer hover:bg-slate-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEdit(framework);
                          }}
                        >
                          {mutatePending ? (
                            <Spinner className="h-3.5 w-3.5 text-slate-500" />
                          ) : edit && framework.value === edit.value ? (
                            <Save
                              onClick={() =>
                                edit && !edit.label
                                  ? () => alert("must have value")
                                  : onUpdate()
                              }
                              className="h-3.5 w-3.5 text-slate-500"
                            />
                          ) : (
                            <Edit className="h-3.5 w-3.5 text-slate-500" />
                          )}
                        </div>
                      )}
                      {defaultOptions.length == 0 && remove && (
                        <div
                          className="ml-2     items-center justify-center h-5 w-5  group-hover:flex hidden rounded cursor-pointer transition-all "
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete({ item: framework });
                          }}
                        >
                          {deletePending ? (
                            <Spinner className="h-3.5 w-3.5 text-red-500 group-hover:bg-red-100 transition-all" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 text-red-500  group-hover:bg-red-100 transition-all" />
                          )}
                        </div>
                      )}
                    </li>
                  ))
                : null}

              {endpoint && defaultOptions.length == 0 && (
                <>
                  <li ref={ref} className="flex flex-col space-y-2">
                    {isFetchingNextPage ? (
                      <>
                        {Array.from({ length: 4 }).map((_, key) => (
                          <Skeleton
                            className="h-[30px] w-full rounded-[4px]"
                            key={key}
                          />
                        ))}
                      </>
                    ) : hasNextPage ? (
                      Array.from({ length: 4 }).map((_, key) => (
                        <Skeleton
                          className="h-[30px] w-full rounded-[4px]"
                          key={key}
                        />
                      ))
                    ) : //@ts-ignore
                    data?.pages[0]?.count <= options.length ? (
                      <p className="text-center text-gray-500 py-2">
                        You have reached the end ~
                      </p>
                    ) : (
                      <Skeleton className="h-[30px] w-full rounded-[4px] mt-5" />
                    )}
                  </li>
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {["pending"].includes(status) ? (
                      "Searching..."
                    ) : ["success"].includes(status) && options.length === 0 ? (
                      <span>
                        No record found {search && `'${search}'`}
                        {add && search && endpoint && (
                          <>
                            ,{" "}
                            <i
                              className="cursor-pointer underline text-blue-600 hover:text-blue-800"
                              onClick={onSubmit}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === "Enter") onSubmit();
                              }}
                            >
                              {mutatePending ? "creating..." : "create new"}
                            </i>
                          </>
                        )}
                      </span>
                    ) : (
                      options.length === 0 && "No framework found."
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {!open && value?.length > 0 && (
        <div className="flex flex-wrap gap-2 my-2">
          {value?.slice(0, 5).map((item: SelectProps, index: number) => (
            <span
              key={index}
              onClick={() => {
                setValue((prev: SelectProps[]) => {
                  const exists = prev.findIndex((s) => s?.value === item.value);
                  if (exists !== -1) {
                    onChange?.(prev.filter((s) => s?.value !== item.value));
                    return [
                      ...prev.slice(0, exists),
                      ...prev.slice(exists + 1),
                    ];
                  }
                  return prev;
                });
              }}
              className="text-white flex justify-center cursor-pointer items-center  gap-2 rounded-full text-[14px] px-2 bg-[#1da077] max-w-[250px] truncate"
            >
              <span className="block w-fit max-w-[100px] truncate">
                {item.label}
              </span>{" "}
              <XIcon size={12} className="cursor-pointer" />
            </span>
          ))}
          {value?.length > 5 && (
            <Badge className="cursor-pointer bg-[#1da077] text-white hover:bg-[#1aa178] transition-all">
              +{value?.length - 5} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export {
    AsyncSelect
}