import { TikTokIcon } from '@/assets/icon/index.icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUser } from '@/utils/state/index.state';
import { Check, Copy, Facebook, Instagram, Linkedin, User, X, Youtube } from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';


type Props = {
    setShowPreview : (e:boolean)=>void,
    recipientName : string,
    topics : string[],
    getEventDisplayText : any,
    paymentAmount : string,
    selectedPlatforms : string[],
    generateInviteLink: any,
    canCopyInviteLink:any,
    platforms:any[],
    createAction:()=>void,
    createState:boolean
}

const InvitePreview:React.FC<Props> = ({
    setShowPreview,
    recipientName,
    topics,
    getEventDisplayText,
    paymentAmount,
    selectedPlatforms,
    generateInviteLink,
    canCopyInviteLink,
    platforms,createAction,
    createState=false
}) => {

    const {user} = useUser();

  return (
    <>
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
              <div className="min-h-screen flex flex-col">
                {/* Preview Header */}
                <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 z-10">
                  <div className="max-w-3xl mx-auto px-4 py-6">
                    <div className="text-center">
                      <p className="text-sm font-medium text-muted-foreground">This is how your invitation will appear to the recipient</p>
                    </div>
                  </div>
                </div>
          <div className="flex-1 flex items-center justify-center py-12">
                  <div className="max-w-2xl w-full mx-auto px-4">
                    <Card className="border-primary/20 shadow-2xl relative">
                      {/* Close button positioned on top right of card */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPreview(false)}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2 h-8 w-8 z-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <CardContent className="p-8">
                        <div className="space-y-6">
                          <div className="space-y-3">
                            <h2 className="text-xl font-medium text-foreground">Hi {recipientName },</h2>
                            <p className="text-sm text-muted-foreground">You have been invited to text in public with:</p>
                          </div>

                          {/* Profile Card (from Profile.tsx) */}
                          <NavLink target='_blank' to={`/profile/${user?.username}`}>
                            <div className="bg-background border border-border rounded-lg p-6 shadow-sm mb-4 transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer flex flex-col gap-4">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                              <div className="relative">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage 
                                    src={user?.image || undefined} 
                                    alt={user?.fullName}
                                    className="object-cover"
                                  />
                                  <AvatarFallback>
                                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col gap-0.5 items-center sm:items-start">
                                  <span className="text-xl font-medium text-card-foreground">{user?.fullName}</span>
                                  <span className="text-sm text-muted-foreground">@{user?.username}</span>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {user?.bio || 'Tell us about yourself...'}
                                </p>
                              </div>
                            </div>
                            {/* Verified Accounts Section */}
                            <div>
                              <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-1">Verified Accounts</h3>
                              <div className="flex flex-row gap-3 justify-center sm:justify-start">
                                {/* LinkedIn */}
                                <div className="relative flex items-center justify-center">
                                  <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                    <Linkedin className="h-4 w-4 text-muted-foreground" />
                                  </span>
                                  {user?.isLinkedinVerified && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                                      <Check className="h-2 w-2 text-primary" />
                                    </span>
                                  )}
                                </div>
                                {/* X (Twitter) */}
                                <div className="relative flex items-center justify-center">
                                  <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </span>
                                  {user?.isXVerified && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                                      <Check className="h-2 w-2 text-primary" />
                                    </span>
                                  )}
                                </div>
                                {/* Facebook */}
                                <div className="relative flex items-center justify-center">
                                  <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                    <Facebook className="h-4 w-4 text-muted-foreground" />
                                  </span>
                                  {user?.isFacebookVerified && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                                      <Check className="h-2 w-2 text-primary" />
                                    </span>
                                  )}
                                </div>
                                {/* Instagram */}
                                <div className="relative flex items-center justify-center">
                                  <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                                    <Instagram className="h-4 w-4 text-muted-foreground" />
                                  </span>
                                  {user?.isInstagramVerified && (
                                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                                      <Check className="h-2 w-2 text-primary" />
                                    </span>
                                  )}
                                </div>


                                 {/* Youtube */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <Youtube className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {user?.isYoutubeVerified && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>

                      {/* TikTok */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <TikTokIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {user?.isTiktokVerified && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>


                              </div>
                            </div>
                          </div>
                          </NavLink>

                          {/* Topics Section (moved below profile card) */}
                          <div className="space-y-3 mb-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Topics</h3>
                            <div className="space-y-0.5">
                              {Array.isArray(topics) && topics?.map((topic, index) => (
                                <div key={index} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-b-0">
                                  <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full flex-shrink-0"></div>
                                  <span className="text-sm text-foreground leading-relaxed">{topic}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Event Details Section (no box, like topics) */}
                          <div className="space-y-3 mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event Details</h3>
                            <div className="flex items-center gap-2 py-1">
                              <span className="text-sm text-foreground leading-relaxed">{getEventDisplayText()}</span>
                            </div>
                          </div>

                          {/* Payment Section (compact, like topics/event details) */}
                          <div className="space-y-3 mb-2">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Offer Amount</h3>
                            <div className="flex flex-col gap-1 py-1">
                              <span className="text-sm text-foreground leading-relaxed">${paymentAmount || '0'}</span>
                              <span className="text-xs text-muted-foreground">Subject to 5% platform fee. Amount will be held by Arena immediately after acceptance and will be deposited after successful event completion.</span>
                            </div>
                          </div>

                          {/* Verification requested */}
                          {selectedPlatforms.length > 0 && (
                            <div className="space-y-3 mb-2">
                              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Verification Requested</h3>
                              <div className="flex items-center gap-2 py-1">
                                {selectedPlatforms.map(platformId => {
                                  const platform = platforms.find(p => p.id === platformId);
                                  if (!platform) return null;
                                  const Icon = platform.icon;
                                  return (
                                    <span key={platformId} className="h-8 w-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                                      <Icon className="h-4 w-4" />
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                  {/* Action Buttons */}
                          <div className="flex justify-between items-center pt-4 border-t">
                    <Button 
                      variant="outline"
                              size="sm"
                              className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    >
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      disabled
                              size="sm"
                              className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    >
                      Negotiate
                    </Button>
                    <Button 
                      variant="outline" 
                              size="sm"
                              className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Copy Invite Link Button */}
            <div className="flex justify-center mt-6">
              <Button 
                onClick={createAction}
                disabled={!canCopyInviteLink}
                variant="outline"
                className={cn(
                  "h-11 px-6 font-medium transition-all duration-200",
                  canCopyInviteLink
                    ? "border-primary/30 text-primary hover:bg-primary/5 bg-background"
                    : "border-border text-muted-foreground bg-background cursor-not-allowed"
                )}
              >
                <Copy className="mr-2 h-4 w-4" />
               { createState ? "Copying...": "Copy Invite Link"}
              </Button>
            </div>
                  </div>
                </div>


               </div>
            </div>

    </>
  )
}

export default InvitePreview