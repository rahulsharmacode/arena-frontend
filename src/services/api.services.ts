import Cookies from "js-cookie";
import axiosInstance from "./index.services";
import { axiosCallProp, endpointProp } from "./interface.services";

export const getOptions = () => {
  const accessToken =
    (Cookies.get("access") || sessionStorage.getItem("access")) ?? "no-token";
  if (Cookies.get("access") || sessionStorage.getItem("access")) {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }
};

const endpoint: endpointProp = {
  auth: {
    login: "/auth/login/",
    register: "/auth/register/",
    getOtp: "/password-reset-get-otp/",
    verifyOtp: "/verify-token/",
    resetPassword: "/password-reset/",
  },
  "user": "/user/",
  "user-profile": "/user/profile/",
  "users": "/users/",
  "verify-image": "/verify-image",
  "arena": "/arena/",
  "feeds": "/feeds/",
  "userfeeds": "/feeds/user/",
  "arena-messages": "/arena/messages/",
  "arena-guest-accept": "arena/guest-accept/",
  "bookmark": "/arena/bookmarks/",
  "liked": "/arena/like/",
  "new-conversation": "/arena/new-conversation/",
  "comment": "/arena/comment/",
  "notification": "/notification/",
  "notification-read-all": "/notification/mark-all-read",
  "arena-likeby": "/arena/likeby/",
  "follows": "/follows/",
  "view": "/arena/view/",

};

/* get custom query */
const getQuery = (params: { [key: string]: any }) => {
  if (params === undefined) return "";
  const queryString = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join("&");
  return queryString ? `?${queryString}` : "";
};

/* get custom param */
const getParam = (id: number | string | undefined) => {
  return id ? `${id}/` : "";
};

const getBody = (body: any) => {
  const isFile = (value: any) => value instanceof File || value instanceof Blob;
  const isFileArray = (value: any) =>
    Array.isArray(value) && value.every(isFile);

  if (body instanceof Array) {
    const formData = new FormData();
    body.forEach((item, itemIndex) => {
      if (typeof item === "object" && item !== null) {
        // Iterate over each key in the object
        Object.keys(item).forEach((key) => {
          if (isFile(item[key])) {
            formData.append(`data[${itemIndex}][${key}]`, item[key]);
          } else if (isFileArray(item[key])) {
            // If the value is an array of files
            item[key].forEach((file: File | Blob, fileIndex: number) => {
              formData.append(`data[${itemIndex}][${key}][${fileIndex}]`, file);
            });
          } else if (Array.isArray(item[key])) {
            // Handle arrays of non-file values inside objects
            item[key].forEach((value, valueIndex) => {
              formData.append(
                `data[${itemIndex}][${key}][${valueIndex}]`,
                value
              );
            });
          } else {
            // Handle normal values
            formData.append(`data[${itemIndex}][${key}]`, item[key]);
          }
        });
      }
    });
    return formData;
  } else {
    Object.keys(body).forEach((key) => {
      if (body[key] === undefined) {
        delete body[key];
      }
    });
    const containsFile = Object.values(body).some(
      (value) => isFile(value) || isFileArray(value)
    );
    if (containsFile) {
      const formData = new FormData();
      Object.keys(body).forEach((key) => {
        if (isFileArray(body[key])) {
          body[key].forEach((file: File | Blob, index: number) => {
            formData.append(`${key}[${index}]`, file);
          });
        } else if (isFile(body[key])) {
          formData.append(key, body[key]);
        } else {
          formData.append(key, body[key]);
        }
      });
      return formData;
    }
    return body;
  }
};
const controller = new AbortController();
/* api useAxiosCall */
const useAxiosCall = async ({
  params,
  endpoint,
  method,
  id,
  body
}: axiosCallProp) => {
  try {
    const query = getQuery(params);
    const param = getParam(id);
    const requestbody = body && getBody(body);

    if (!endpoint) {
      throw new Error("Endpoint is required");
    }
    switch (method?.toUpperCase()) {
      case "GET": {
        let { data, status } = await axiosInstance.get(
          endpoint + param + query,
         {...getOptions(), signal : controller.signal}
     
        );
        return { data, status };
      }

      case "POST": {
        let { data, status } = await axiosInstance.post(
          endpoint + param + query,
          requestbody,
          getOptions()
        );
        return { data, status };
      }

      case "PUT": {
        let { data, status } = await axiosInstance.put(
          endpoint + param + query,
          requestbody,
          getOptions()
        );
        return { data, status };
      }

      case "PATCH": {
        let { data, status } = await axiosInstance.patch(
          endpoint + param + query,
          requestbody,
          getOptions()
        );
        return { data, status };
      }

      case "DELETE": {
        let { data, status } = await axiosInstance.delete(
          endpoint + param + query,
          getOptions()
        );
        return { data, status };
      }

      default:
        return;
    }
  } catch (err: any) {
    throw err?.response?.data;
  }
};

export { endpoint, useAxiosCall };
