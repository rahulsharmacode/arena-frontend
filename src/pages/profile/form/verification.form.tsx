import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { VerifySocialMedia, VerifySocialMediaProps } from '@/utils/interface/form.interface';
import { usePostData } from '@/utils/query/index.query';
import { useSocialVerification } from '@/utils/state/index.state';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Copy, CopyIcon, Edit3, UserIcon } from 'lucide-react';
import React, { useEffect, useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Props = {}

const VerificationForm = ({setIsEditing,setIsPending}) => {
    const otp = useMemo(()=>Math.floor(1000 + Math.random() * 9000) , []);

    const {platform,setPlatform,clear} = useSocialVerification();

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
      } = useForm<VerifySocialMediaProps>({
        resolver: zodResolver(VerifySocialMedia),
        mode: "onChange",
      });

      /* mutation */
      const queryClient = useQueryClient();
      const { mutate, isPending } = usePostData();
          useEffect(()=> setIsPending(()=>isPending),[isPending]);
    
      /* submit */
      console.log(errors, "err")
      const onSubmit: SubmitHandler<VerifySocialMediaProps> = (data) => {
        if (data.screenshot) { data = { ...data, screenshot: data["screenshot"]?.[0], expectedCode:otp,platformName:platform } }
    
        mutate({
          endpoint: endpoint["verify-image"],
          method: METHODS.POST,
          data,
        }, {
          onSuccess: (response) => {
            if (response.status === 200) {
              queryClient.invalidateQueries({queryKey:["user-profile"]})
              setIsEditing("profile")
              return toast.success("Updated successfully!");
              
            } else {
              return toast.error(response.response.data.message || "Failed to register");
            }
          },
          onError: (data) => {
            toast.error(data?.message)
          }
        })
      }

        const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Verification code copied!');
  };


  return (<>
    {/* <p>OTP: <strong>{otp}</strong> </p>
    <p>Please open your {platform} profile, and type otp in searchbox </p>
    <p>eg. https://{platform}.com/loremipsum</p>


<form id="verification-update-form" onSubmit={handleSubmit(onSubmit)} className="space-y-2 py-1">


            <div className="">
              <input type="file" {...register("screenshot")} id="profile-image" className="hidden" />
              <div className="relative group cursor-pointer">
                <Avatar className="h-[120px] w-[120px] !rounded-[4px]">
                  <AvatarImage
                    src={watch("screenshot")?.[0] instanceof File ? URL.createObjectURL(watch("screenshot")?.[0]) : "" || undefined}
            
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback>
                    File
                  </AvatarFallback>
                </Avatar>
                <div onClick={() => document.getElementById("profile-image")?.click()} className="absolute inset-0 w-[120px] flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {watch("screenshot") ? (
                    <Edit3 className="h-3 w-3 text-white" />
                  ) : (
                    <Camera className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
       
            </div>

            
    </form> */}


<div className="space-y-6 max-w-md mx-auto bg-white rounded-lg">

  <form id="verification-update-form" onSubmit={handleSubmit(onSubmit)}
   >

<Card className="bg-background rounded-2xl border-none shadow-none">
         
            <CardContent className="flex flex-col gap-6">
              <div className="w-full bg-muted/60 rounded-xl py-5 px-4 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Step 1</span>
                  <div className="flex items-center gap-1">
                    <CopyIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">Copy this verification code</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono px-5 py-2 text-xs font-medium bg-background border border-border rounded-lg shadow select-all">
                      {otp || ''}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg px-3 py-1 font-medium h-7 text-xs inline-flex items-center gap-1"
                      onClick={() => {
                        if (platform) {
                        navigator.clipboard.writeText(otp?.toString() || '');
                          toast.success('Verification code copied! Go to your social profile to paste it in the URL.');
                        }
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="w-full border-t border-border my-2" />
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Step 2</span>
                  <span className="text-xs font-medium text-foreground text-center">
                    Go to your {platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'social'} profile, paste the verification code into the URL, and take a screenshot showing the full URL and your profile page.
                  </span>
                </div>
                <div className="w-full border-t border-border my-2" />
                <div className="flex flex-col items-center gap-1 w-full">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Step 3</span>
                  <span className="text-xs font-medium text-foreground">Upload the screenshot:</span>
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("screenshot")}
                    className="mt-2 w-full text-center border border-border rounded-lg font-normal text-xs"
                  />
                </div>
              </div>
            </CardContent>
          
          </Card>


    {/* <div className="flex flex-col items-center">
      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Screenshot</label>
      <input type="file" {...register("screenshot")} id="profile-screenshot" className="hidden" accept="image/*" />
      <div className="relative group cursor-pointer w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
        <Avatar className="h-full w-full !rounded-lg">
          <AvatarImage
            src={watch("screenshot")?.[0] instanceof File ? URL.createObjectURL(watch("screenshot")?.[0]) : ""}
            alt="Profile Screenshot Preview"
            className="object-cover w-full h-full rounded-lg"
          />
          <AvatarFallback className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No file chosen
          </AvatarFallback>
        </Avatar>
        <div onClick={() => document.getElementById("profile-screenshot")?.click()} className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
          {watch("screenshot") ? (
            <Edit3 className="h-6 w-6 text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
          <span className="ml-2 text-white text-sm">
            {watch("screenshot") ? "Change" : "Upload"}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">Upload a screenshot of your {platform} profile with the OTP.</p>
    </div> */}
  
  </form>
</div>


  </>)
}

export default VerificationForm