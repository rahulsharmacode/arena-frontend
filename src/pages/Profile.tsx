import { TikTokIcon, XIcon } from '@/assets/icon/index.icon';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/utils/state/index.state';
import { Check, Facebook, Instagram, Linkedin, Mic, Settings, Twitter, User as UserIcon, Youtube } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EditProfile } from './profile/edit';
import { useListData } from '@/utils/query/index.query';
import { EventAreanData, QueryData } from '@/utils/interface/index.interface';
import { endpoint } from '@/services/api.services';
import ConversationCard from './event/invitepreview/home/convertation';
import Cookies from 'js-cookie';
import { ArenaEventSkeleton } from '@/components/skeleton';
import EmptyData from '@/components/empty';


interface ProfileProps { }
  const socialIcons = [
    { name: 'linkedin' as const, Icon: Linkedin, label: 'LinkedIn' },
    { name: 'twitter' as const, Icon: Twitter, label: 'Twitter/X' },
    { name: 'facebook' as const, Icon: Facebook, label: 'Facebook' },
    { name: 'instagram' as const, Icon: Instagram, label: 'Instagram' },
    { name: 'youtube' as const, Icon: Youtube, label: 'YouTube' },
  ] as const;


const Profile: React.FC<ProfileProps> = () => {

  // **** *///
  const [isEditing,setIsEditing] = useState<string>("")
  const { user,clear,isPending } = useUser();

  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showPodcastDialog, setShowPodcastDialog] = useState(false);


  const handleLogout = async () => {
    try {
      clear();
        Cookies.remove("access");
                      Cookies.remove("uid");
                      Cookies.remove("username");
                      Cookies.remove("email");
                      Cookies.remove("profileImage");
                      Cookies.remove("fullName");
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  /* api calls */
  const [tab,setTab] = useState<"activity"|"bookmarks">("activity")
  let { data: homeData, isPending: homePending, refetch } = useListData<QueryData<EventAreanData[]>>({
    endpoint: endpoint["userfeeds"],
    key: "userfeedsactivity",
    params : {bookmark:tab==="bookmarks"?true:null},
    id: user?._id,
    enabled: !!user,
    window: true
  });


  if(isPending){
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <EmptyData
            img='/images/profile.png'
            title='Profile Loading...'
            />
            {/* <h1 className="text-2xl font-semibold mb-4">Profile Loading...</h1> */}
          </div>
        </TransitionWrapper>
      </>
    );
  }
  if (!user) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Profile Not Available</h1>
            <p className="mb-6">Please log in to view your profile</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl mt-16">
        <Card className="mb-8 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 dark:border-muted/40">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative w-full">
              <div className="relative">
                <Avatar className="h-24 w-24 shadow-md border-4 border-background">
                  <AvatarImage
                    src={user.image || undefined}
                    alt={user.fullName}
                    className="object-cover rounded-full"
                  />
                  <AvatarFallback>
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-medium font-sans tracking-tight leading-tight text-foreground">{user.fullName}</span>
                </div>
                <span className="text-base font-medium text-muted-foreground font-sans">@{user.username}</span>
                {user.bio && (
                  <p className="mt-2 text-sm text-foreground/80 font-sans text-center sm:text-left max-w-xl">{user.bio}</p>
                )}
                <div className="w-full border-t border-border/40 my-4"></div>
                <div className="w-full">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide uppercase">Verified Accounts</h3>
                  <div className="flex flex-row gap-3 justify-center sm:justify-start">

                     <VerifiedIcons
                    isVerified={user?.isFacebookVerified}
                      link={user?.isFacebookVerified ||null}
                    platform='facebook'
                  />
                  <VerifiedIcons
                    isVerified={user?.isInstagramVerified}
                      link={user?.isInstagramVerified ||null}
                    platform='instagram'
                  />
                  <VerifiedIcons
                    isVerified={user?.isLinkedinVerified}
                      link={user?.isLinkedinVerified ||null}
                    platform='linkedin'
                  />
                  <VerifiedIcons
                    isVerified={user?.isTiktokVerified}
                      link={user?.isTiktokVerified ||null}
                    platform='tiktok'
                  />
                  <VerifiedIcons
                    isVerified={user?.isXVerified}
                      link={user?.isXVerified ||null}
                    platform='twitter'
                  />
                  <VerifiedIcons
                    isVerified={user?.isYoutubeVerified}
                      link={user?.isYoutubeVerified ||null}
                    platform='youtube'
                  />
                  <VerifiedIcons
                    isVerified={user?.isTiktokVerified}
                    link={user?.isTiktokVerified ||null}
                    platform='tiktok'
                  />

                  </div>
                </div>
              </div>
         
              {/* Restore actions at top-right */}
              <div className="absolute top-0 right-0 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type='button'
                  onClick={() => setIsEditing(()=>"profile")}
                  className="h-8 px-3 text-xs font-medium border-foreground/20 dark:border-white/20 text-foreground/80 dark:text-white/80 hover:text-foreground dark:hover:text-white hover:border-foreground/40 dark:hover:border-white/40 transition-all duration-200 hover:shadow-sm bg-background/50 dark:bg-white/10 backdrop-blur-sm"
                >
                  Edit Profile
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowPodcastDialog(true)}
                  className="h-8 px-3 text-xs font-medium bg-foreground/10 dark:bg-white/20 hover:bg-foreground/20 dark:hover:bg-white/30 text-foreground/80 dark:text-white/80 hover:text-foreground dark:hover:text-white border border-foreground/20 dark:border-white/20 transition-all duration-200 hover:shadow-sm backdrop-blur-sm"
                >
                  <Mic className="h-3 w-3 mr-1" />
                  Podcast
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 transition-all duration-200 hover:shadow-sm"
                      aria-label="Settings"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                                        onClick={() => setIsEditing(()=>"changepassword")}

                    >
                      Change Password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                    >
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
           
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={(e:"activity"|"bookmarks"|any)=>setTab(e)}>
          <TabsList className="mb-6">
            <TabsTrigger value="activity" className="px-4">Activity</TabsTrigger>
            <TabsTrigger value="bookmarks" className="px-4">Bookmarks</TabsTrigger>

          </TabsList>

          <TabsContent value="activity">
            <TransitionWrapper animation="slide-up">
                  {
                  homePending ?    Array.from({length:5}).map((_,i:number) =><ArenaEventSkeleton key={i}  />) :

                    homeData?.data?.data?.length === 0 ?
                                          <EmptyData /> 
 :
                      <ConversationCard data={homeData?.data?.data ?? []} />
                  }
           
            </TransitionWrapper>
          </TabsContent>

          <TabsContent value="bookmarks">
            <TransitionWrapper animation="slide-up">
                  {
                  homePending ?    Array.from({length:5}).map((_,i:number) =><ArenaEventSkeleton key={i}  />) :
                    homeData?.data?.data?.length === 0 ?
                    <EmptyData title='No Bookmarked yet' />  
                    :
                      <ConversationCard data={homeData?.data?.data ?? []} />
                  }
           
            </TransitionWrapper>
          </TabsContent>
        </Tabs>
      </div>
           <Dialog open={showPodcastDialog} onOpenChange={setShowPodcastDialog}>
        <DialogContent className="sm:max-w-[425px] p-0 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
          <Card className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium mb-1">Podcast Feature</CardTitle>
              <CardDescription className="text-xs text-muted-foreground text-center">
                Transform your content into AI-generated podcasts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="w-full bg-muted/50 dark:bg-muted/30 rounded-xl py-6 px-4 flex flex-col items-center gap-3 border border-muted/20">
                <Mic className="h-8 w-8 text-primary" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Audio and Video clone will be available soon
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload your content and let AI convert it into professional podcasts with multiple voices, background music, and chapter markers.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="w-full mt-2">
              <Button size="sm" className="w-full h-8 text-xs" onClick={() => setShowPodcastDialog(false)}>
                Got it
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog>

      {/* <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent className="sm:max-w-[425px] p-0 bg-background rounded-2xl shadow-xl border border-border">
          <Card className="bg-background rounded-2xl border-none shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium mb-1">Verify your {selectedPlatform ? selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1) : 'Social Account'}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground text-center">
                Complete the steps below to verify your social account.
              </CardDescription>
            </CardHeader>
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
                      {selectedPlatform && verificationStatus[selectedPlatform]?.code || ''}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-lg px-3 py-1 font-medium h-7 text-xs inline-flex items-center gap-1"
                      onClick={() => {
                        if (selectedPlatform) {
                          navigator.clipboard.writeText(verificationStatus[selectedPlatform]?.code || '');
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
                    Go to your {selectedPlatform ? selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1) : 'social'} profile, paste the verification code into the URL, and take a screenshot showing the full URL and your profile page.
                  </span>
                </div>
                <div className="w-full border-t border-border my-2" />
                <div className="flex flex-col items-center gap-1 w-full">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Step 3</span>
                  <span className="text-xs font-medium text-foreground">Upload the screenshot:</span>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="mt-2 w-full text-center border border-border rounded-lg font-normal text-xs"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="w-full mt-2">
              <Button size="sm" className="w-full h-7 text-xs" onClick={handleVerificationSubmit} disabled={!selectedPlatform || verificationScreenshots.length === 0}>
                Submit for Verification
              </Button>
            </CardFooter>
          </Card>
        </DialogContent>
      </Dialog> */}

 
{/* 
      <Dialog open={imageEditor.isOpen} onOpenChange={(open) => setImageEditor(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{photoURL ? 'Edit Profile Picture' : 'Upload Profile Picture'}</DialogTitle>
            <DialogDescription>
              {photoURL ? 'Make adjustments to your profile picture or upload a new one' : 'Choose a photo that represents you best'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!tempImage ? (
              <div className="space-y-4">
                {photoURL && (
                  <div className="flex justify-center">
                    <div className="relative">
                      <Avatar className="h-32 w-32">
                        <AvatarImage
                          src={photoURL}
                          alt="Current profile picture"
                          className="object-cover"
                        />
                      </Avatar>
                    </div>
                  </div>
                )}
                <div
                  className="border-2 border-dashed rounded-lg p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-primary/10 p-4">
                      <ImagePlus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Click to {photoURL ? 'change' : 'upload'} or drag and drop</p>
                      <p className="text-xs text-muted-foreground">JPEG, PNG, or HEIC (max 5MB)</p>
                    </div>
                  </div>
                </div>
                {photoURL && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleImageDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Profile Picture
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <AvatarEditor
                      ref={editorRef}
                      image={tempImage}
                      width={250}
                      height={250}
                      border={50}
                      borderRadius={125}
                      color={[0, 0, 0, 0.6]}
                      scale={imageEditor.scale}
                      rotate={0}
                    />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted-foreground">
                      Drag to reposition
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Zoom</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(imageEditor.scale * 100)}%</span>
                    </div>
                    <Slider
                      value={[imageEditor.scale]}
                      min={1}
                      max={3}
                      step={0.1}
                      onValueChange={([value]) => setImageEditor(prev => ({ ...prev, scale: value }))}
                      className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setImageEditor(prev => ({ ...prev, isOpen: false }));
              setTempImage(null);
            }}>
              Cancel
            </Button>
            {tempImage && (
              <Button onClick={handleEditorSave}>
                Save Changes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog> */}

      {/* <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/jpg,image/heic"
        onChange={(e) => {
          console.log('File input changed');
          const file = e.target.files?.[0];
          if (file) {
            console.log('File selected:', file.name, file.type, file.size);
            handleImageEdit(file);
          }
        }}
      /> */}
{/* 
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Edit Profile</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Profile Picture</Label>
              <div className="flex flex-col items-center gap-1">
                <div className="relative group cursor-pointer" onClick={() => {
                  if (photoURL) {
                    fetch(photoURL)
                      .then(res => res.blob())
                      .then(blob => {
                        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
                        handleImageEdit(file);
                      })
                      .catch(error => {
                        console.error('Error loading image:', error);
                        toast.error('Failed to load image for editing');
                      });
                  } else {
                    fileInputRef.current?.click();
                  }
                }}>
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={photoURL || undefined}
                      alt={user.fullName}
                      className="object-cover rounded-full"
                    />
                    <AvatarFallback>
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {photoURL ? (
                      <Edit3 className="h-3 w-3 text-white" />
                    ) : (
                      <Camera className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-6 px-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoURL ? 'Change' : 'Upload'}
                  </Button>
                  {photoURL && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-6 px-2 text-red-500 hover:text-red-600"
                      onClick={handleImageDelete}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-medium">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="username" className="text-xs font-medium">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Your username"
                className="h-7 text-xs"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio" className="text-xs font-medium">Bio</Label>
                <span className="text-[10px] text-muted-foreground">
                  {formData.bio.length}/280
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={2}
                maxLength={280}
                className="resize-none text-xs min-h-[64px]"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium">Social Verification</Label>
              <div className="grid grid-cols-6 gap-1">
                {socialIcons.map(({ name, Icon }) => {
                  const platformName = name;
                  const statusInfo = verificationStatus[platformName] || { status: 'unverified' as const };
                  const isVerified = statusInfo.status === 'verified';
                  const isPending = statusInfo.status === 'pending';
                  return (
                    <Button
                      key={platformName}
                      variant={isVerified ? "ghost" : "outline"}
                      size="icon"
                      className={cn(
                        isVerified
                          ? "relative p-0 rounded-full text-black hover:text-gray-800 hover:bg-gray-100"
                          : "h-10 w-10 rounded-full relative",
                        !isVerified && !isPending && "text-muted-foreground"
                      )}
                      onClick={() => handleVerificationStart(platformName)}
                      disabled={isVerified}
                    >
                      <Icon className="h-4 w-4" />
                      {isVerified && (
                        <CheckIcon className="h-3 w-3 bg-background rounded-full p-0.5 text-black absolute -top-1 -right-1" />
                      )}
                    </Button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">At least one social verification required</p>
            </div>
          </div>
          <DialogFooter className="gap-1 sm:gap-0 mt-2">
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 text-xs" onClick={handleSaveProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Friends</DialogTitle>
            <DialogDescription>
              Share Arena with your friends and start debating together.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <a
              href={`/profile/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={user.image || undefined}
                        alt={user.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback>
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{user.fullName}</h3>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </a>

            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/register?referral=${currentUser?.username}`}
                  readOnly
                />
                <Button onClick={copyInviteLink}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}


           <EditProfile
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        user={user}
        socialIcons={socialIcons}
      />
  
    </>
  );
};

export default Profile;



interface VerifiedSocialProps {
  platform: "twitter" | "tiktok" | "linkedin" | "facebook" | "instagram" | "youtube" | "github" |
  "discord",
  isVerified?: string|null,
  edit?: boolean,
  link: string|null,
  onVerification?: () => void
}
export const VerifiedIcons: React.FC<VerifiedSocialProps> = ({ platform = 'twitter', onVerification, link = "", isVerified = false, edit = false }) => {

  const Icon = platform === 'twitter' ? XIcon :
    platform === 'tiktok' ? TikTokIcon :
      platform === 'linkedin' ? Linkedin :
          platform === 'facebook' ? Facebook :
            platform === 'instagram' ? Instagram :
                platform === 'youtube' ? Youtube : UserIcon;

                const compoenent =     <Button
      onClick={isVerified ? () => { } : () => onVerification && onVerification()}
      variant="ghost"
      size="icon"
      type='button'
      className="relative p-0 text-black hover:text-gray-800 hover:bg-gray-100"
    >
      <Icon className="h-4 w-4 text-black" />
      {isVerified && <div className="absolute -top-1 -right-1">
        <Check className="h-3 w-3 bg-background rounded-full p-0.5 text-black" />
      </div>}
    </Button>

  if (!isVerified && !edit) return;
  // if(link && isVerified) return(<>
  //    <a
  //                       key={platform}
  //                       href={link || ''}
  //                       target="_blank"
  //                       rel="noopener noreferrer"
  //                       className="block"
  //                     >
  //  <div className="relative flex items-center justify-center">
  //                     <span className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
  //                      {compoenent}
  //                     </span>
  //                     { (
  //                       <span className="absolute -top-1 -right-1 h-4 w-4 bg-white rounded-full flex items-center justify-center border border-border shadow">
  //                         <Check className="h-3 w-3 text-primary" />
  //                       </span>
  //                     )}
  //                   </div>

   
   
  //   </a>





  // </>)
  return (<>{compoenent}

  </>)
}