import { TikTokIcon, XIcon } from '@/assets/icon/index.icon';
import CustomDialog from '@/components/dialog';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VerificationStatus as ContextVerificationStatus, ExtendedUser } from '@/context/AuthContext';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { EventAreanData, FollowData, IndividualQuery, QueryData, UserData } from '@/utils/interface/index.interface';
import { useListData, usePostData } from '@/utils/query/index.query';
import { useUser } from '@/utils/state/index.state';
import { Calendar, Facebook, Instagram, Linkedin, MessageSquare, User as UserIcon, Users, Youtube } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import ConversationCard from './event/invitepreview/home/convertation';
import EmptyData from '@/components/empty';

// Declare global window property
declare global {
  interface Window {
    _verifiedProfiles: {
      [username: string]: boolean;
    } | undefined;
  }
}

interface SocialLinks {
  [key: string]: string;
}

interface ProfileUser {
  name: string;
  username: string;
  bio: string;
  photoURL: string;
  verificationStatus?: {
    [key: string]: ContextVerificationStatus;
  };
  socialLinks?: SocialLinks;
}

interface DebateHistory {
  id: string;
  title: string;
  description: string;
  participants: number;
  messages: number;
  status: 'active' | 'completed';
  category: string;
  date: string;
}

// Mock data for Rick Harris
const RICK_HARRIS_PROFILE: ExtendedUser = {
  uid: 'rick-harris-mock',
  name: 'Rick Harris',
  username: 'rickharris',
  email: 'rick@example.com',
  bio: 'Rick Harris is a digital strategist and podcast innovator, passionate about the intersection of technology and storytelling. With over a decade of experience, he helps creators build communities, amplify voices, and shape the future of public conversations online.',
  photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/rickharris',
    twitter: 'https://twitter.com/rickharris',
    facebook: 'https://facebook.com/rickharris',
    instagram: 'https://instagram.com/rickharris',
    youtube: 'https://youtube.com/@rickharris',
    tiktok: ''
  },
  verificationStatus: {
    linkedin: { status: 'verified' },
    twitter: { status: 'verified' },
    facebook: { status: 'verified' },
    instagram: { status: 'verified' },
    youtube: { status: 'verified' },
    tiktok: { status: 'unverified' }
  },
  updatedAt: new Date().toISOString(),
  displayName: 'Rick Harris',
  emailVerified: true,
  isAnonymous: false
};

const RICK_HARRIS_DEBATES: DebateHistory[] = [
  {
    id: '1',
    title: 'The Future of Podcast is Text',
    description: 'Exploring how text-based conversations are reshaping the podcast landscape and creating new opportunities for engagement.',
    participants: 24,
    messages: 158,
    status: 'active',
    category: 'Technology',
    date: '2024-01-15'
  },
  {
    id: '2',
    title: 'Community Building in the Digital Age',
    description: 'How online platforms are changing the way we build and maintain communities.',
    participants: 36,
    messages: 242,
    status: 'completed',
    category: 'Social Media',
    date: '2024-01-10'
  },
  {
    id: '3',
    title: 'The Evolution of Content Creation',
    description: 'From traditional media to digital platforms - how creators are adapting to new technologies.',
    participants: 18,
    messages: 89,
    status: 'active',
    category: 'Content Creation',
    date: '2024-01-08'
  },
  {
    id: '4',
    title: 'Digital Storytelling Techniques',
    description: 'Modern approaches to storytelling in the digital landscape.',
    participants: 42,
    messages: 187,
    status: 'completed',
    category: 'Storytelling',
    date: '2024-01-05'
  }
];



export default function PublicProfile() {
  const { username } = useParams();
  // const [profileUser, setProfileUser] = useState<ExtendedUser | null>(null);
  // const [isVerified, setIsVerified] = useState(false);


  // const renderSocialLinks = () => {

  //   const socialIcons = {
  //     linkedin: <Linkedin className="h-4 w-4" />,
  //     twitter: <XIcon className="h-4 w-4" />,
  //     facebook: <Facebook className="h-4 w-4" />,
  //     instagram: <Instagram className="h-4 w-4" />,
  //     youtube: <Youtube className="h-4 w-4" />,
  //     tiktok: <TikTokIcon className="h-4 w-4" />
  //   };

  //   return (
  //     <div className="flex flex-wrap gap-2">
  //       {Object.entries(profileUser.socialLinks).map(([platform, url]) => {
  //         if (!url) return null;

  //         const isVerified = profileUser.verificationStatus?.[platform]?.status === 'verified';

  //         return (
  //           <a
  //             key={platform}
  //             href={url}
  //             target="_blank"
  //             rel="noopener noreferrer"
  //             className={cn(
  //               "flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
  //               "bg-gray-100 hover:bg-gray-200 text-gray-700",
  //               isVerified && "bg-blue-50 hover:bg-blue-100 text-blue-700"
  //             )}
  //           >
  //             {socialIcons[platform as keyof typeof socialIcons]}
  //             <span className="capitalize">{platform}</span>
  //             {isVerified && <Check className="h-3 w-3" />}
  //           </a>
  //         );
  //       })}
  //     </div>
  //   );
  // };

  const renderDebateCard = (debate: DebateHistory) => (
    <Card key={debate.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{debate.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{debate.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {debate.participants}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {debate.messages}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(debate.date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge
              variant={debate.status === 'active' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {debate.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {debate.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );



  /* api logic */
  //   interface InviteParams { 
  //     username?:string
  //   }
  // const { username } = useParams() as InviteParams;
  const { user } = useUser();
  const { data, isPending, refetch: userRefetch } = useListData<IndividualQuery<UserData>>({
    endpoint: endpoint["user-profile"],
    // params:{search:username},
    enabled: !!username,
    key: username as any,
    id: username,
    window: true
  });

  const [openFollows, setOpenFollows] = useState<null | "follower" | "following">(null)
  const { data: followsData, isPending: followsPending } = useListData<IndividualQuery<FollowData>>({
    endpoint: endpoint["follows"],
    key: "followsctivity" + data?.data.data._id,
    params: { type: openFollows },
    id: data?.data.data._id,
    enabled: !!openFollows,
    window: true
  });


  /* api calls */
  let { data: homeData, isPending: homePending, refetch } = useListData<QueryData<EventAreanData[]>>({
    endpoint: endpoint["userfeeds"],
    key: "userfeedsactivity" + data?.data.data._id,
    id: data?.data.data._id,
    enabled: !!data,
    window: true
  });


  const { mutate, isPending: followPending } = usePostData();
  const handleFollow = () => {
    mutate({
      endpoint: endpoint["follows"] + data?.data?.data?._id,
      data: { id: data?.data?.data?._id },
      method: METHODS.POST
    },
      {
        onSuccess: ({ status, data }) => {
          if ([200].includes(status)) {
            userRefetch();
            toast.success(`Succesfully, ${data?.action}`)
          }
        }
      })
  }


  // If loading, show a loading state (WITH Navbar)
  if (isPending) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <EmptyData
              img='/images/profile.png'
              title='Profile Loading...'
            />
            {/* <h1 className="text-2xl font-semibold mb-4">Loading profile...</h1> */}
          </div>
        </div>
      </>
    );
  }

  // If no user is found and no verification, show a message (WITH Navbar)
  if (!data?.data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-20 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Profile Not Found</h1>
            <p>The user you're looking for doesn't exist.</p>
          </div>
        </div>
      </>
    );
  }

  if (data?.data) {
    // Create a custom profile component for Rick Harris with his specific data
    const rickHarrisData = {
      uid: data.data.data._id,
      name: data?.data?.data?.fullName,
      username: data?.data?.data?.username,
      email: data?.data?.data?.isEmailVerified,
      bio: data?.data?.data?.bio,
      photoURL: data?.data?.data?.image,
      socialLinks: {
        linkedin: data?.data?.data?.isLinkedinVerified,
        twitter: data?.data?.data?.isXVerified,
        facebook: data?.data?.data?.isFacebookVerified,
        instagram: data?.data?.data?.isInstagramVerified,
        youtube: data?.data?.data?.isYoutubeVerified,
        tiktok: data?.data?.data?.isTiktokVerified,
      },
      verificationStatus: {
        linkedin: { status: 'verified' },
        twitter: { status: 'verified' },
        facebook: { status: 'verified' },
        instagram: { status: 'verified' },
        youtube: { status: 'verified' },
        tiktok: { status: 'unverified' }
      },
      updatedAt: new Date().toISOString(),
      displayName: 'Rick Harris',
      emailVerified: true,
      isAnonymous: false,
      following: data?.data?.data?.following,
      followers: data?.data?.data?.follower,
      isFollowed: data?.data?.data?.isFollowed
    };



    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl mt-16">
          <Card className="mb-8 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative w-full">
                <div className="relative">
                  <Avatar className="h-24 w-24 shadow-md border-4 border-background">
                    <AvatarImage
                      src={rickHarrisData.photoURL || undefined}
                      alt={rickHarrisData.name}
                      className="object-cover rounded-full"
                    />
                    <AvatarFallback>
                      {rickHarrisData.name ? rickHarrisData.name.charAt(0).toUpperCase() : <UserIcon className="h-12 w-12" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 flex flex-col items-center sm:items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-medium font-sans tracking-tight leading-tight text-foreground">{rickHarrisData.name}</span>
                  </div>
                  <span className="text-base font-medium text-muted-foreground font-sans">@{rickHarrisData.username}</span>

                  {/* Follower count */}
                  <div className="flex items-center gap-4 mt-1">
                    <span onClick={() => setOpenFollows("follower")} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{rickHarrisData.followers}</span> followers
                    </span>
                    <span onClick={() => setOpenFollows("following")} className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{rickHarrisData.following}</span> following
                    </span>
                  </div>

                  {rickHarrisData.bio && (
                    <p className="mt-2 text-sm text-foreground/80 font-sans text-center sm:text-left max-w-xl">{rickHarrisData.bio}</p>
                  )}
                  <div className="w-full border-t border-foreground/20 my-4"></div>
                  <div className="w-full">
                    <h3 className="text-xs font-semibold text-muted-foreground mb-2 tracking-wide uppercase">Verified Accounts</h3>
                    <div className="flex flex-row gap-3 justify-center sm:justify-start">
                      {/* LinkedIn */}
                      {rickHarrisData.socialLinks.linkedin && <NavLink to={rickHarrisData.socialLinks.linkedin as string}>
                        <div className="relative group">
                          <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                            <Linkedin className="h-4 w-4 text-foreground/80" />
                          </span>
                        </div>
                      </NavLink>}

                      {/* Twitter */}
                      {rickHarrisData.socialLinks.twitter && <NavLink to={rickHarrisData.socialLinks.twitter as string}>
                        <div className="relative group">
                          <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                            <XIcon className="h-4 w-4 text-foreground/80" />
                          </span>
                        </div>
                      </NavLink>}

                      {/* Facebook */}
                      {rickHarrisData.socialLinks.facebook && <NavLink to={rickHarrisData.socialLinks.facebook as string}>

                        <div className="relative group">
                          <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                            <Facebook className="h-4 w-4 text-foreground/80" />
                          </span>
                        </div>
                      </NavLink>}


                      {/* Instagram */}
                      {rickHarrisData.socialLinks.instagram && <NavLink to={rickHarrisData.socialLinks.instagram as string}>

                        <div className="relative group">
                          <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                            <Instagram className="h-4 w-4 text-foreground/80" />
                          </span>
                        </div>
                      </NavLink>}

                      {/* Youtube */}
                      {rickHarrisData.socialLinks.youtube && <NavLink to={rickHarrisData.socialLinks.youtube as string}>

                        <div className="relative group">
                          <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                            <Youtube className="h-4 w-4 text-foreground/80" />
                          </span>
                        </div>
                      </NavLink>}

                      {/* TikTok */}
                      {rickHarrisData.socialLinks.tiktok && <NavLink to={rickHarrisData.socialLinks.tiktok as string}>

                        <div className="relative group">
                          <span className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20 transition-all bg-muted/5 shadow-sm">
                            <TikTokIcon className="h-4 w-4 text-foreground/80" />
                          </span>
                        </div>
                      </NavLink>}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {rickHarrisData.uid !== user?._id && <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollow()}
                    className="h-8 px-3 text-xs font-medium border-foreground/20 text-foreground/80 hover:text-foreground hover:border-foreground/40 transition-all duration-200 hover:shadow-sm bg-background/50 backdrop-blur-sm"
                  >
                    {rickHarrisData?.isFollowed ? "Unfollow" : "Follow"}
                  </Button>
                  <NavLink to={`/invite?gid=${rickHarrisData.uid}`}>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3 text-xs font-medium bg-foreground/10 hover:bg-foreground/20 text-foreground/80 hover:text-foreground border border-foreground/20 transition-all duration-200 hover:shadow-sm backdrop-blur-sm"
                    >
                      Invite
                    </Button>
                  </NavLink>
                </div>}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Empty content - removed duplicate social media icons */}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="activity">
            <TabsList className="mb-6">
              <TabsTrigger value="activity" className="px-4">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              <TransitionWrapper animation="slide-up">
                <div className="text-center py-12 bg-muted/50 rounded-lg">
                  {
                    homeData?.data?.data?.length === 0 ?
                      // <h3 className="text-lg font-medium mb-2">No Conversations Yet</h3>
                      <EmptyData

                      />
                      :
                      <ConversationCard data={homeData?.data?.data ?? []} />
                  }
                </div>
              </TransitionWrapper>
            </TabsContent>
          </Tabs>
        </div>

        <CustomDialog title={openFollows as string} open={openFollows !== null} onClose={() => setOpenFollows(null)}>
          <div className="max-h-96 overflow-y-auto">
            {openFollows && Array.isArray(followsData?.data?.data) && followsData?.data?.data?.map((follow) => (
              <div key={follow?._id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={follow?.user?.image?.url || ""} />
                  <AvatarFallback className="text-xs">
                    {follow?.[`${openFollows === "follower" ? "following" : "follower"}`]?.fullName?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{follow?.[`${openFollows === "follower" ? "following" : "follower"}`]?.fullName}</p>
                  <p className="text-xs text-muted-foreground">@{follow?.[`${openFollows === "follower" ? "following" : "follower"}`]?.username}</p>
                </div>
                {/* <span className="text-xs text-muted-foreground">
                          {new Date(follow.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span> */}
              </div>
            ))}
          </div>
        </CustomDialog>


      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen dark:bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl mt-16">
          {/* Profile Header */}
          {/* {username !== 'rickharris' && (
            <Card className="mb-8 border overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 dark:border-muted/40">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24 shadow-md border-4 border-background">
                    <AvatarImage src={profileUser?.photoURL || undefined} alt={profileUser?.name} />
                    <AvatarFallback>
                      <UserIcon className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-medium font-sans tracking-tight leading-tight text-foreground">{profileUser?.name}</h1>
                      {isVerified && (
                        <Badge variant="default" className="bg-blue-500">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <p className="text-base font-medium text-muted-foreground font-sans mb-1">@{profileUser?.username}</p>
                    <p className="text-sm text-foreground/80 font-sans mb-4">{profileUser?.bio}</p>

                    {renderSocialLinks()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Tabs */}
          <Tabs defaultValue="debates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="debates">Debates</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="debates" className="mt-6">
              <div className="space-y-4">
                {RICK_HARRIS_DEBATES.map(renderDebateCard)}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Started debate "The Future of Podcast is Text"</span>
                      <span className="text-xs text-gray-400 ml-auto">2 days ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Completed debate "Community Building in the Digital Age"</span>
                      <span className="text-xs text-gray-400 ml-auto">1 week ago</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Joined 5 new debates</span>
                      <span className="text-xs text-gray-400 ml-auto">2 weeks ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">About Rick Harris</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Experience</h4>
                      <p className="text-gray-600 text-sm">
                        Over a decade of experience in digital strategy, podcast innovation, and community building.
                        Specializes in helping creators build engaged audiences and monetize their content effectively.
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Expertise</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Digital Strategy</Badge>
                        <Badge variant="outline">Podcast Innovation</Badge>
                        <Badge variant="outline">Community Building</Badge>
                        <Badge variant="outline">Content Creation</Badge>
                        <Badge variant="outline">Technology</Badge>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Stats</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{RICK_HARRIS_DEBATES.length}</div>
                          <div className="text-xs text-gray-500">Debates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">120</div>
                          <div className="text-xs text-gray-500">Participants</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">678</div>
                          <div className="text-xs text-gray-500">Messages</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
} 