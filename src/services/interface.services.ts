interface axiosGetProp {limit?:number,offset?:number,search?:string,university?:string}
interface axiosCallProp{
    params?: axiosGetProp|any;
    endpoint: string;
    method?: any;
    id?: number|string| undefined;
    body?: any;
  }

  enum METHODS  {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE",
  }

  interface endpointProp {[key : string] : string|object|any}


  interface SelectProps  {
    label : string, value : string|number
  }




  export{METHODS}
  export type {axiosGetProp,axiosCallProp,endpointProp,SelectProps}