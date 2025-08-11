import ErrorLabel from "@/components/ErrorLabel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { VerifiedIcons } from "@/pages/Profile";
import { endpoint } from "@/services/api.services";
import { METHODS } from "@/services/interface.services";
import { ChangePasswordFormProps, ChangePasswordSchema, ProfileFormProps, ProfileSchema } from "@/utils/interface/form.interface";
import { usePostData } from "@/utils/query/index.query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Camera, CheckIcon, Edit3, Eye, EyeClosed, UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import React from 'react'

type Props = {setIsPending:()=>void;onClose:()=>void}

const Password:React.FC<Props> = ({setIsPending,onClose}) => {
    const [isShow,setIsShow] = useState({
        password:false,
        confirmPassword:false
    })
      const imageRef = useRef<any>();
      const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
      } = useForm<ChangePasswordFormProps>({
        resolver: zodResolver(ChangePasswordSchema),
        mode: "onChange",
      });
    
      /* mutation */
      const queryClient = useQueryClient();
      const { mutate, isPending } = usePostData();
        useEffect(()=> setIsPending(()=>isPending),[isPending]);
      /* submit */
      console.log(errors, "err")
      const onSubmit: SubmitHandler<ChangePasswordFormProps> = (data) => {
        mutate({
          endpoint: endpoint["user"],
          method: METHODS.PUT,
          data: { ...data, id: Cookies.get("uid") },
    
        }, {
          onSuccess: (response) => {
            if (response.status === 200) {
              queryClient.invalidateQueries({queryKey:["user-profile"]});
              onClose();
              return toast.success("Updated successfully!");
            } else {
              return toast.error(response.response.data.message || "Failed to register");
            }
          },
          onError: (data) => {
            console.log("🚀 ~ data:", data)
          }
        })
      }

  return (<>
  
<form id="changepassword-update-form" onSubmit={handleSubmit(onSubmit)} className="space-y-2 py-1">

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
            <Input
              id="password"
              {...register("password")}
              placeholder="Enter new password"
            type={isShow.password  ? "text" : "password"}
              className="h-7 text-xs"
              endIcon={isShow.password ? <Eye className="cursor-pointer" size={14} onClick={()=>setIsShow((prev)=>({...prev , password : false}))} /> : <EyeClosed className="cursor-pointer" size={14} onClick={()=>setIsShow((prev)=>({...prev , password : true}))} />}
            />
            {errors.password && <ErrorLabel message={errors.password.message || ""} />}

          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm_password" className="text-xs font-medium">Confirm Password</Label>
            <Input
              id="confirm_password"
              {...register("confirm_password")}
            type={isShow.confirmPassword  ? "text" : "password"}
              placeholder="Your confirm password"
              className="h-7 text-xs"
              endIcon={isShow.confirmPassword ? <Eye className="cursor-pointer" size={14} onClick={()=>setIsShow((prev)=>({...prev , confirmPassword : false}))} /> : <EyeClosed className="cursor-pointer" size={14} onClick={()=>setIsShow((prev)=>({...prev , confirmPassword : true}))} />}

            />
            {errors.confirm_password && <ErrorLabel message={errors.confirm_password.message || ""} />}

          </div>
        </form> 


  </>)
}

export default Password