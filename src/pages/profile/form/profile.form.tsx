import ErrorLabel from "@/components/ErrorLabel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VerifiedIcons } from "@/pages/Profile";
import { endpoint } from "@/services/api.services";
import { METHODS } from "@/services/interface.services";
import { ProfileFormProps, ProfileSchema } from "@/utils/interface/form.interface";
import {
  usePostData
} from "@/utils/query/index.query";
import { useSocialVerification } from "@/utils/state/index.state";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Edit3, UserIcon } from "lucide-react";
import React, { useEffect, useRef } from 'react';
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {user:any,setIsPending:()=>void,setIsEditing:()=>void}

const ProfileUpdate:React.FC<Props> = ({user,setIsPending,setIsEditing}) => {

      const imageRef = useRef<any>();
      const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
      } = useForm<ProfileFormProps>({
        resolver: zodResolver(ProfileSchema),
        mode: "onChange",
        defaultValues: user
      });
      useEffect(() => {
        if (user) {
          const data: ProfileFormProps = {
            fullName: user.fullName, username: user.username, bio: user.bio,
            image: user.image
          };
          reset(() => data)
        }
      }, [user])
    
      /* mutation */
      const queryClient = useQueryClient();
      const { mutate, isPending } = usePostData();
      useEffect(()=> setIsPending(()=>isPending),[isPending]);
      /* submit */
      console.log(errors, "err")
      const onSubmit: SubmitHandler<ProfileFormProps> = (data) => {
        if (data.image) { data = { ...data, image: data["image"]?.[0] } }
        if(!(data.image instanceof File)) delete data.image;
        // imageRef.current.value="";
        mutate({
          endpoint: endpoint["user"],
          method: METHODS.PUT,
          data: { ...data, id: user._id },
    
        }, {
          onSuccess: (response) => {
            if (response.status === 200) {
              queryClient.invalidateQueries({queryKey:["user-profile"]})
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
    
    
      const {platform,setPlatform,clear} = useSocialVerification();
      // const [isVerification,setIsVerification] = useState<"facebook"|"instagram"|"linkedin"|"x"|"youtube"|"tiktok"|string>("")
      const handleVerification = (type:"facebook"|"instagram"|"linkedin"|"x"|"youtube"|"tiktok") => {
        setPlatform(type);
        setIsEditing("verification")
      }


  return (<>
  
<form id="profile-update-form" onSubmit={handleSubmit(onSubmit)} className="space-y-2 py-1">

          <div className="space-y-1">
            <Label className="text-xs font-medium">Profile Picture</Label>
            <div className="flex flex-col items-center gap-1">
              <input type="file" {...register("image")} id="profile-image" className="hidden" />
              <div className="relative group cursor-pointer">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={watch("image")?.[0] instanceof File ? URL.createObjectURL(watch("image")?.[0]) : watch("image") || undefined}
                    alt={user?.fullName}
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback>
                    {user?.fullName ? user?.fullName.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                  </AvatarFallback>
                </Avatar>
                <div onClick={() => document.getElementById("profile-image")?.click()} className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {watch("image") ? (
                    <Edit3 className="h-3 w-3 text-white" />
                  ) : (
                    <Camera className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  type="button"
                  size="sm"
                  className="text-[10px] h-6 px-2"
                  onClick={() => document.getElementById("profile-image")?.click()}
                >
                  Upload
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs font-medium">Name</Label>
            <Input
              id="name"
              {...register("fullName")}
              placeholder="Your name"
              className="h-7 text-xs"
            />
            {errors.fullName && <ErrorLabel message={errors.fullName.message || ""} />}

          </div>

          <div className="space-y-1">
            <Label htmlFor="username" className="text-xs font-medium">Username</Label>
            <Input
              id="username"
              {...register("username")}

              placeholder="Your username"
              className="h-7 text-xs"
            />
            {errors.username && <ErrorLabel message={errors.username.message || ""} />}

          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio" className="text-xs font-medium">Bio</Label>
              <span className="text-[10px] text-muted-foreground">
                {watch("bio")?.length || 0 }/280
              </span>
            </div>
            <Textarea
              id="bio"
              {...register("bio")}

              placeholder="Tell us about yourself..."
              rows={2}
              maxLength={280}
              className="resize-none text-xs min-h-[64px]"
            />
            {errors.bio && <ErrorLabel message={errors.bio.message || ""} />}

          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Social Verification</Label>
            <div className="grid grid-cols-6 gap-1">
              <VerifiedIcons onVerification={()=>handleVerification("facebook")} link="#" platform="facebook" edit isVerified={user?.isFacebookVerified} />
              <VerifiedIcons onVerification={()=>handleVerification("instagram")}  link="#" platform="instagram" edit isVerified={user?.isInstagramVerified} />
              <VerifiedIcons onVerification={()=>handleVerification("linkedin")}  link="#" platform="linkedin" edit isVerified={user?.isLinkedinVerified} />
              <VerifiedIcons onVerification={()=>handleVerification("x")}  link="#" platform="twitter" edit isVerified={user?.isXVerified} />
              <VerifiedIcons onVerification={()=>handleVerification("youtube")}  link="#" platform="youtube" edit isVerified={user?.isYoutubeVerified} />
              <VerifiedIcons onVerification={()=>handleVerification("tiktok")}  link="#" platform="tiktok" edit isVerified={user?.isTiktokVerified} />

             
            </div>
            <p className="text-[10px] text-muted-foreground">At least one social verification required</p>
          </div>
        </form> 


  </>)
}

export default ProfileUpdate