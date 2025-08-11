import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSocialVerification } from "@/utils/state/index.state";
import { useState } from "react";
import Password from "../form/password.form";
import ProfileUpdate from "../form/profile.form";
import VerificationForm from "../form/verification.form";

const EditProfile: React.FC<any> = ({ isEditing, setIsEditing, user,

}) => {

  const [isPending,setIsPending] = useState<boolean>(false);
       const {platform,setPlatform,clear} = useSocialVerification();
  return (<>

    <Dialog open={ ["profile","changepassword","verification"]?.includes(isEditing)} onOpenChange={() => setIsEditing("")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg">{isEditing !== "verification" && "Edit"} {isEditing==="profile"?"Profile":isEditing==="verification"?platform : "Update Password"}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
           {platform ? `${platform} verification` : <>Update your {isEditing==="profile"?"profile" : "password"} information</>} 
          </DialogDescription>
        </DialogHeader>
        {
          isEditing==="profile" ? 
          <ProfileUpdate user={user} setIsPending={setIsPending} setIsEditing={setIsEditing} />
          : 
               isEditing==="verification" ? 
          <VerificationForm setIsPending={setIsPending} setIsEditing={setIsEditing} />
          : 

        <Password setIsPending={setIsPending} onClose={setIsEditing} />
        }
        
        <DialogFooter className="gap-1 sm:gap-0 mt-2">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing( isEditing==="verification" ? "profile":  false)}>
            Cancel
          </Button>
          <Button type="submit" form={`${isEditing}-update-form`} size="sm" className="h-7 text-xs">
            {isPending ? (isEditing==="verification" ? "Verifying..." :"Updating...") : isEditing==="verification" ? "Verify":  "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>)
}

export {
  EditProfile
};
