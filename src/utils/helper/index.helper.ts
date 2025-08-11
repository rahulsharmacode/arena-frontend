import CryptoJS from "crypto-js";
import { format, formatDistance, isValid, parseISO } from "date-fns";
import React from "react";
import { toast } from "sonner";

interface SelectProps {
    label:string;
    value:number|string|object
}

const isFn = (fn: unknown): fn is (...args: any[]) => any =>
  typeof fn === "function";

type ToastProps = {
  title: string;
  description: string;
  type: "success" | "error" | "warning";
};
interface NamedItem {
  id: string | number;
  name: string;
}

const isNullCheck = (data: string | object | number | null): string | object | number => {
  return !data ? "N/A" : data;
};

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!name || !domain || name.length <= 3) return email;
  const visible = name.slice(0, 3);
  const masked = "*".repeat(Math.max(name.length - 3, 1));
  return `${visible}${masked}@${domain}`;
}

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

// Encrypt data
const encryptData = (data: unknown): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
};

// Decrypt data
const decryptData = (cipherText: string): any => {
  if (!cipherText) return;
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedData);
};

const removeHttpPrefix = (url: string): string => {
  return url.replace(/^(https?:\/\/)/, "");
};


const formatSelectData = (
  data: Record<string, any> | Record<string, any>[],
  key = "title",
  value = "id"
): object[] => {
  if (!key || !value) return [];
  if (!data || (Array.isArray(data) && data.length === 0)) return [];

  if (!Array.isArray(data)) {
    return [{ label: isNullCheck(data[key]), value: data[value] }];
  }

  return data.map((item) => ({
    label: isNullCheck(item[key]),
    value: item[value],
  }));
};

const throwErrorAlert = (data: Record<string, string[] | string>) => {
  Object.entries(data).forEach(([key, value]) => {
    const messages = Array.isArray(value) ? value : [value];
    messages.forEach((message) => {
      toast.error(message, {
        description: format(new Date(), "EEEE, MMMM dd, yyyy 'at' h:mm a"),
        style: { color: "red" },
      });
    });
  });
};

const createURl = (file: File | string): string => {
  return typeof file === "string" ? file : URL.createObjectURL(file);
};

const refineNull = (obj: Record<string, any>): Record<string, any> => {
  return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== null));
};

const refineObjType = ({
  data,
  keys,
  type,
}: {
  data: Record<string, any>;
  keys: string[];
  type: "string" | "object" | "number" | "boolean";
}): Record<string, any> => {
  const cleanedData = { ...data };
  keys.forEach((key) => {
    if (typeof cleanedData[key] === type) {
      delete cleanedData[key];
    }
  });
  return cleanedData;
};

const getMapedValue = <T>(data: T[], key: keyof T): (T[keyof T])[] => {
  return data?.map((item) => item[key]);
};

function formatDate(date: Date | string|any): string | null {
  if (date instanceof Date && isValid(date)) {
    return format(date, "yyyy-MM-dd");
  }
  const parsedDate = parseISO(date);
  return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd") : null;
}

function timeAgo(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true });
}

function getUniqueArray<T extends { id: string | number }>(array: T[]): T[] {
  const seen = new Set();
  return array?.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function getUrlObj(obj: Record<string, any>): string | null {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
  for (const key in obj) {
    if (typeof obj[key] === "string" && urlRegex.test(obj[key])) {
      return key;
    }
  }
  return null;
}

function getServerFileDetails(url: string): {
  filename: string;
  extension: string;
  file: string;
} {
  if (!url) return { filename: "", extension: "", file: "" };

  const segments = url.split("/");
  const lastSegment = segments.pop() || "";
  const dotIndex = lastSegment.lastIndexOf(".");

  if (dotIndex === -1) {
    return { filename: lastSegment, extension: "", file: lastSegment };
  }

  return {
    filename: lastSegment.substring(0, dotIndex),
    extension: lastSegment.substring(dotIndex + 1),
    file: lastSegment,
  };
}

function ensureProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

const getSubmitAction = ({
  searchParams,
  isPending,
  sufix,
}: {
  searchParams: URLSearchParams;
  isPending?: boolean;
  sufix: string;
}): string => {
  const type = searchParams.get("mode") || searchParams.get("page");
  if (isPending) return "Submitting ...";
  if (type === "add") return `Add ${sufix}`;
  if (type === "edit") return `Save ${sufix}`;
  return `Add ${sufix}`;
};

const getIconInfo = ({
  searchParams,
  icon,
}: {
  searchParams: URLSearchParams;
  icon: React.ReactElement;
}): React.ReactElement | null => {
  const type = searchParams.get("mode") || searchParams.get("page");
  return type === "edit" ? null : icon;
};

const getChipInfo = (level: string): string => {
  const levelColors: Record<string, string> = {
    phd: "green",
    master: "yellow",
    masters: "yellow",
    bachelors: "orange",
    bachelor: "orange",
  };
  return levelColors[level.toLowerCase()] ?? "gray";
};

const showToast = ({ title, description, type }: ToastProps) => {
  const baseOptions = {
    description,
    closeButton: true,
    classNames: {
      description: "!text-black",
      closeButton: "!absolute !right-0",
      icon: "!mr-10",
    },
  };

  switch (type) {
    case "success":
      return toast.success(title, baseOptions);
    case "error":
      return toast.error(title, baseOptions);
    case "warning":
      return toast.warning(title, baseOptions);
    default:
      return toast.error(title, baseOptions);
  }
};

const getObjQuery = (data: object): string => {
  if (!data || Object.keys(data).length === 0) return "";
  return Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
};

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

    const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };


export {
    createURl, decryptData, encryptData, ensureProtocol, formatDate, formatSelectData, getChipInfo, getIconInfo, getMapedValue, getServerFileDetails, getSubmitAction, getUniqueArray, getUrlObj, isFn, isNullCheck, maskEmail, refineNull,
    refineObjType, removeHttpPrefix, showToast, throwErrorAlert, timeAgo,
    getObjQuery,
    formatNumber,
    formatTimestamp
};

