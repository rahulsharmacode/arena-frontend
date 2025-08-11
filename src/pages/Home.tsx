import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner.';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from '@/context/AuthContext';
import { useInfiniteScroller } from '@/hooks/index.hook';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { usePostData } from '@/utils/query/index.query';
import {
  ArrowUp
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import ConversationCard from './event/invitepreview/home/convertation';
import { ArenaEventSkeleton } from '@/components/skeleton';
import { useUser } from '@/utils/state/index.state';

interface Participant {
  name: string;
  username: string;
  avatar?: string;
  bio: string;
}

interface Conversation {
  id: string;
  mainTopic: string;
  otherTopics: string[];
  participants: Participant[];
  engagement: {
    views: number;
    loves: number;
    comments: number;
  };
  likedBy?: { name: string; username: string; time: string }[];
  commentedBy?: { name: string; username: string; time: string }[];
  isNewDiscussion?: boolean;
  postContent?: string;
}

const sampleConversations: Conversation[] = [
  {
    id: '1',
    mainTopic: "The Future of Podcast is Text",
    otherTopics: [
      "Text podcasts let you read at your own pace",
      "Every message is searchable and quotable",
      "Join the conversation anytime, anywhere"
    ],
    participants: [
      {
        name: "Rick Harris",
        username: "rickharris",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        bio: "Rick Harris is a digital strategist and podcast innovator, passionate about the intersection of technology and storytelling. With over a decade of experience, he helps creators build communities, amplify voices, and shape the future of public conversations online.",
      },
      {
        name: "Sam Chen",
        username: "samc",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        bio: "Tech writer & builder • Former product manager at Twitter • Passionate about the intersection of technology, media, and human connection",
      }
    ],
    engagement: {
      views: 1234,
      loves: 10,
      comments: 5
    },
    likedBy: [
      { name: "Alex Chen", username: "alexchen", time: "Jul 13, 11:01 AM" },
      { name: "Maria Rodriguez", username: "mariarod", time: "Jul 13, 10:56 AM" },
      { name: "David Kim", username: "davidkim", time: "Jul 13, 10:51 AM" },
      { name: "Sarah Johnson", username: "sarahj", time: "Jul 13, 10:46 AM" },
      { name: "Michael Brown", username: "mikebrown", time: "Jul 13, 10:41 AM" },
      { name: "Emily Davis", username: "emilyd", time: "Jul 13, 10:36 AM" }
    ],
    commentedBy: [
      { name: "Alex Chen", username: "alexchen", time: "Jul 13, 11:01 AM" },
      { name: "Maria Rodriguez", username: "mariarod", time: "Jul 13, 10:56 AM" },
      { name: "David Kim", username: "davidkim", time: "Jul 13, 10:51 AM" },
      { name: "Sarah Johnson", username: "sarahj", time: "Jul 13, 10:46 AM" },
      { name: "Michael Brown", username: "mikebrown", time: "Jul 13, 10:41 AM" }
    ]
  },
  {
    id: '1.5',
    mainTopic: "",
    otherTopics: [
      "AI-generated content and human creativity",
      "Job displacement vs. new opportunities",
      "Ethical considerations in AI art"
    ],
    participants: [
      {
        name: "Alex Johnson",
        username: "alexj",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        bio: "Creative director and AI enthusiast • Exploring the intersection of human creativity and artificial intelligence • Passionate about ethical AI development",
      }
    ],
    engagement: {
      views: 0,
      loves: 0,
      comments: 0
    },
    isNewDiscussion: true,
    postContent: "I've been thinking a lot about how AI is reshaping the creative landscape. As someone who's worked in design for over a decade, I'm both excited and concerned about what's happening. On one hand, AI tools are democratizing creativity - anyone can now create stunning visuals, write compelling copy, or compose music. But I'm also seeing talented artists struggle as their skills become commoditized. The question isn't just about job displacement, but about what it means to be 'creative' in an age where machines can generate art that rivals human work. I believe the future belongs to those who can collaborate with AI rather than compete against it. We need to focus on the uniquely human aspects of creativity - emotional intelligence, cultural context, and the ability to tell stories that resonate. What do you think? Are we heading toward a creative renaissance or a creative crisis?"
  },
  {
    id: '2',
    mainTopic: "Why Public Text Debates Matter",
    otherTopics: [
      "Open debates foster transparency and trust",
      "Public text threads create lasting knowledge bases",
      "Everyone can participate, not just the loudest voices"
    ],
    participants: [
      {
        name: "Alex Rivera",
        username: "alexr",
        avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face",
        bio: "Community builder • Web3 explorer • Passionate about open, inclusive online spaces",
      },
      {
        name: "Priya Singh",
        username: "priyasingh",
        avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face",
        bio: "Debate moderator • Remote work advocate • Believer in the power of public discourse",
      }
    ],
    engagement: {
      views: 987,
      loves: 54,
      comments: 17
    },
    commentedBy: [
      { name: "John Smith", username: "johnsmith", time: "Jul 13, 11:15 AM" },
      { name: "Lisa Wang", username: "lisawang", time: "Jul 13, 11:10 AM" },
      { name: "Tom Johnson", username: "tomjohnson", time: "Jul 13, 11:05 AM" },
      { name: "Emma Davis", username: "emmadavis", time: "Jul 13, 11:00 AM" },
      { name: "Chris Wilson", username: "chriswilson", time: "Jul 13, 10:55 AM" },
      { name: "Anna Lee", username: "annalee", time: "Jul 13, 10:50 AM" },
      { name: "Mike Chen", username: "mikechen", time: "Jul 13, 10:45 AM" },
      { name: "Rachel Green", username: "rachelgreen", time: "Jul 13, 10:40 AM" },
      { name: "Kevin Park", username: "kevinpark", time: "Jul 13, 10:35 AM" },
      { name: "Sophie Kim", username: "sophiekim", time: "Jul 13, 10:30 AM" },
      { name: "Daniel Brown", username: "danielbrown", time: "Jul 13, 10:25 AM" },
      { name: "Jessica White", username: "jessicawhite", time: "Jul 13, 10:20 AM" },
      { name: "Ryan Taylor", username: "ryantaylor", time: "Jul 13, 10:15 AM" },
      { name: "Amanda Clark", username: "amandaclark", time: "Jul 13, 10:10 AM" },
      { name: "Brian Miller", username: "brianmiller", time: "Jul 13, 10:05 AM" },
      { name: "Nicole Garcia", username: "nicolegarcia", time: "Jul 13, 10:00 AM" },
      { name: "Steven Martinez", username: "stevenmartinez", time: "Jul 13, 9:55 AM" }
    ]
  },
  {
    id: '3',
    mainTopic: "Reimagining Social Platforms",
    otherTopics: ["Community Building", "Creator Economy", "Digital Identity"],
    participants: [
      {
        name: "Alex Rivera",
        username: "alexr",
        bio: "Product Designer • Web3 Explorer",
      },
      {
        name: "Sarah Kim",
        username: "sarahk",
        bio: "Community Lead • Digital Anthropologist",
      }
    ],
    engagement: {
      views: 856,
      loves: 67,
      comments: 15
    },
    commentedBy: [
      { name: "Mark Wilson", username: "markwilson", time: "Jul 13, 11:20 AM" },
      { name: "Jennifer Lee", username: "jenniferlee", time: "Jul 13, 11:15 AM" },
      { name: "Robert Chen", username: "robertchen", time: "Jul 13, 11:10 AM" },
      { name: "Michelle Park", username: "michellepark", time: "Jul 13, 11:05 AM" },
      { name: "Andrew Kim", username: "andrewkim", time: "Jul 13, 11:00 AM" },
      { name: "Stephanie Brown", username: "stephaniebrown", time: "Jul 13, 10:55 AM" },
      { name: "Jason Davis", username: "jasondavis", time: "Jul 13, 10:50 AM" },
      { name: "Melissa Johnson", username: "melissajohnson", time: "Jul 13, 10:45 AM" },
      { name: "Eric Wilson", username: "ericwilson", time: "Jul 13, 10:40 AM" },
      { name: "Catherine Lee", username: "catherinelee", time: "Jul 13, 10:35 AM" },
      { name: "Patrick Chen", username: "patrickchen", time: "Jul 13, 10:30 AM" },
      { name: "Rebecca Park", username: "rebeccapark", time: "Jul 13, 10:25 AM" },
      { name: "Gregory Kim", username: "gregorykim", time: "Jul 13, 10:20 AM" },
      { name: "Vanessa Brown", username: "vanessabrown", time: "Jul 13, 10:15 AM" },
      { name: "Timothy Davis", username: "timothydavis", time: "Jul 13, 10:10 AM" }
    ]
  },
  {
    id: '4',
    mainTopic: "The Rise of Remote Work",
    otherTopics: ["Work From Home", "Digital Nomads", "Future of Offices"],
    participants: [
      {
        name: "Priya Singh",
        username: "priyasingh",
        bio: "Remote work advocate • Tech lead",
      },
      {
        name: "John Doe",
        username: "johndoe",
        bio: "HR specialist • Workplace futurist",
      }
    ],
    engagement: {
      views: 642,
      loves: 45,
      comments: 12
    },
    commentedBy: [
      { name: "Laura Wilson", username: "laurawilson", time: "Jul 13, 11:25 AM" },
      { name: "James Chen", username: "jameschen", time: "Jul 13, 11:20 AM" },
      { name: "Ashley Park", username: "ashleypark", time: "Jul 13, 11:15 AM" },
      { name: "Michael Kim", username: "michaelkim", time: "Jul 13, 11:10 AM" },
      { name: "Sarah Brown", username: "sarahbrown", time: "Jul 13, 11:05 AM" },
      { name: "David Davis", username: "daviddavis", time: "Jul 13, 11:00 AM" },
      { name: "Emily Johnson", username: "emilyjohnson", time: "Jul 13, 10:55 AM" },
      { name: "Christopher Wilson", username: "christopherwilson", time: "Jul 13, 10:50 AM" },
      { name: "Amanda Lee", username: "amandalee", time: "Jul 13, 10:45 AM" },
      { name: "Jonathan Chen", username: "jonathanchen", time: "Jul 13, 10:40 AM" },
      { name: "Rachel Park", username: "rachelpark", time: "Jul 13, 10:35 AM" },
      { name: "Kevin Kim", username: "kevinkim", time: "Jul 13, 10:30 AM" }
    ]
  },
  {
    id: '5',
    mainTopic: "Building Sustainable Tech",
    otherTopics: ["Green Computing", "Eco Startups", "Tech for Good"],
    participants: [
      {
        name: "Maria Lopez",
        username: "marialopez",
        bio: "Sustainability champion • Startup founder",
      },
      {
        name: "David Kim",
        username: "davidkim",
        bio: "Engineer • Green tech enthusiast",
      }
    ],
    engagement: {
      views: 512,
      loves: 38,
      comments: 9
    },
    commentedBy: [
      { name: "Thomas Wilson", username: "thomaswilson", time: "Jul 13, 11:30 AM" },
      { name: "Natalie Chen", username: "nataliechen", time: "Jul 13, 11:25 AM" },
      { name: "Brandon Park", username: "brandonpark", time: "Jul 13, 11:20 AM" },
      { name: "Hannah Kim", username: "hannahkim", time: "Jul 13, 11:15 AM" },
      { name: "Justin Brown", username: "justinbrown", time: "Jul 13, 11:10 AM" },
      { name: "Megan Davis", username: "megandavis", time: "Jul 13, 11:05 AM" },
      { name: "Aaron Johnson", username: "aaronjohnson", time: "Jul 13, 11:00 AM" },
      { name: "Katherine Wilson", username: "katherinewilson", time: "Jul 13, 10:55 AM" },
      { name: "Sean Lee", username: "seanlee", time: "Jul 13, 10:50 AM" }
    ]
  },
];

const Home: React.FC = () => {
  const {user}=useUser();

  const handleShare = async (conversationId: string) => {
    try {
      await navigator.share({
        title: 'Check out this conversation on Arena',
        text: 'Join the discussion about the future of communication',
        url: `${window.location.origin}/conversation/${conversationId}`,
      });
    } catch (error) {
      // Fallback to copying to clipboard
      const url = `${window.location.origin}/conversation/${conversationId}`;
      navigator.clipboard.writeText(url);
      // You might want to show a toast notification here
    }
  };
  // For auto-resizing textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  // Add state and modal for likes at the top of the Home component:
  const [showLikesModal, setShowLikesModal] = useState<string | null>(null);
  const [showCommentsModal, setShowCommentsModal] = useState<string | null>(null);

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    status,
    fetchNextPage,
    refetch,
  } = useInfiniteScroller({
    endpoint: endpoint["feeds"],
    filter: {eventStatus:"open"},
    enabled: true,
    key: `${"arena-scroller"}-async`,
  });
  const { ref, inView } = useInView();
  let allScrolledData = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.data) || [];
  }, [data]);
 
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);


  const { mutate } = usePostData();
  /* new convertation liked */
  const handleNewConvertation = () => {
    mutate({
      endpoint: endpoint["new-conversation"],
      data: { content: textareaRef.current?.value },
      method: METHODS.POST
    }, {
      onSuccess: ({ status }) => {
        if ([201].includes(status)) {
          toast.success("New Post added");
          if (textareaRef.current) {
            textareaRef.current.value = '';
          }
          refetch();
        };
      }
    })
  };

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-28 pb-4 overflow-visible">
        <div className="max-w-full w-full mx-auto px-2 sm:px-4 lg:px-8 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)_minmax(180px,220px)] gap-6 justify-center overflow-visible">
            {/* Trending Sidebar */}
            <aside className="lg:col-span-1 pt-2 flex flex-col items-end min-w-[180px] max-w-[220px]">
              <Card className="w-full bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 overflow-visible">
                <div className="sticky top-32 w-full p-4">
                  <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-foreground dark:text-white">TRENDING</h3>
                  <ul className="space-y-4 w-full">
                    {[
                      {
                        people: [
                          { name: 'Elon Musk', avatar: '', bio: 'CEO of Tesla, SpaceX, Neuralink, and Twitter. Innovator, entrepreneur, and advocate for interplanetary life and sustainable energy.' },
                          { name: 'Sam Altman', avatar: '', bio: 'CEO of OpenAI, former president of Y Combinator, investor, and thought leader in artificial intelligence, startups, and the future of technology.' }
                        ], topic: 'Winning AI race with advanced neural networks, global data, regulatory challenges, AGI safety, open source, the future of work, machine learning, ethics, automation, global impact, policy, innovation.', recentReply: 'AI will change everything.', views: '1.2k'
                      },
                      {
                        people: [
                          { name: 'Sundar Pichai', avatar: '', bio: 'CEO of Google. Leading innovation in search, cloud, and AI. Passionate about technology for everyone, everywhere.' },
                          { name: 'Satya Nadella', avatar: '', bio: 'CEO of Microsoft. Champion for cloud, AI, and empowering every person and organization on the planet to achieve more.' }
                        ], topic: 'Cloud wars: Google vs Microsoft, cloud infrastructure, AI integration, enterprise solutions, developer tools, global reach.', recentReply: 'Cloud is the new battleground.', views: '1.1k'
                      },
                      {
                        people: [
                          { name: 'Mark Zuckerberg', avatar: '', bio: 'CEO of Meta (Facebook). Building the metaverse, social platforms, and advancing privacy and connectivity.' },
                          { name: 'Tim Cook', avatar: '', bio: 'CEO of Apple. Focused on privacy, innovation, and creating products that enrich people\'s lives.' }
                        ], topic: 'Privacy in the social era, data protection laws, user experience, business models, encryption, transparency, user trust.', recentReply: 'Privacy is a fundamental right.', views: '1.0k'
                      },
                      {
                        people: [
                          { name: 'Gaurab Boli', avatar: '', bio: 'Founder of Arena. Exploring the future of digital communication, collaboration, and online communities.' },
                          { name: 'Sam Chen', avatar: '', bio: 'Tech enthusiast, writer, and builder in public. Passionate about the intersection of technology and society.' }
                        ], topic: 'The future of digital communication, messaging apps, real-time collaboration, voice tech, privacy, global reach.', recentReply: 'Excited for what\'s next!', views: '900'
                      },
                      {
                        people: [
                          { name: 'Alex Rivera', avatar: '', bio: 'Product designer and Web3 explorer. Building communities and designing for the next generation of the internet.' },
                          { name: 'Sarah Kim', avatar: '', bio: 'Community lead and digital anthropologist. Studying online culture, engagement, and digital identity.' }
                        ], topic: 'Reimagining social platforms, community building, creator economy, digital identity, engagement, monetization.', recentReply: 'Communities are the future.', views: '800'
                      },
                    ].map((item, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <li className="py-1 px-2 rounded-lg w-full flex flex-col items-start transition-all duration-200 cursor-pointer hover:bg-muted/80 hover:shadow-lg hover:rounded-xl hover:px-3 hover:py-2 hover:scale-[1.03]">
                              <div className="text-sm font-medium text-foreground/90 leading-tight w-full">{item.people[0].name}</div>
                              <div className="text-sm text-foreground/70 leading-tight w-full">with {item.people[1].name}</div>
                            </li>
                          </TooltipTrigger>
                          <TooltipContent side="right" align="center" className="z-[9999] rounded-xl px-5 py-4 max-w-xs bg-muted shadow-xl">
                            <div className="flex flex-col gap-1.5">
                              {[0, 1].map(i => (
                                <div key={i} className="text-base font-medium text-foreground/90">
                                  <span className="font-semibold mr-1">{item.people[i].name}:</span>
                                  <span className="text-sm text-foreground/80 font-normal">{item.people[i].bio}</span>
                                </div>
                              ))}
                              <Separator className="my-2 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                              <div className="text-base font-medium text-foreground/90 mb-0.5">
                                <span className="font-semibold mr-1">Topics:</span>
                                <span className="text-sm text-foreground/80">
                                  {item.topic.split(/[,•|]/).map((topic, idx, arr) => (
                                    <span key={idx}>{topic.trim()}{idx < arr.length - 1 ? ', ' : ''}</span>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </ul>
                </div>
              </Card>
            </aside>

            {/* Center Content */}
            <main className="lg:col-span-1 flex flex-col items-center space-y-4">

              {/* Discussion Input Card */}
              <Card className="w-full max-w-[1400px] mx-auto bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-sm rounded-xl border border-border/30 z-0 overflow-visible transition-all duration-300 ease-out hover:shadow-lg hover:scale-[1.01] hover:border-primary/20 hover:-translate-y-0.5">


                <CardContent className="p-1 flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="bg-primary/80 text-white text-base font-bold">
                      {user?.fullName?.split(' ').map(n => n[0]).join('') || (user?.email as string)?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <textarea
                    ref={textareaRef}
                    placeholder="Start a new discussion..."
                    className="flex-1 min-h-[1.5rem] max-h-[10rem] bg-transparent border-0 outline-none resize-none text-[15px] font-normal text-foreground placeholder:text-foreground/80 dark:placeholder:text-white/80 rounded-xl px-1 py-0 leading-[1.5] focus:ring-1 focus:ring-primary/20 transition-shadow overflow-y-auto"
                    style={{ boxShadow: 'none', overflow: 'hidden' }}
                    rows={1}
                    onInput={handleTextareaInput}
                  />
                  <button type="button" onClick={handleNewConvertation} className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted/70 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/20">
                    <ArrowUp className="h-5 w-5 text-foreground/80 dark:text-white/80" />
                  </button>
                </CardContent>
              </Card>


              {/* Main Conversations */}
              <div className="space-y-2 w-full max-w-[1400px] mx-auto">
                <ConversationCard isPending={(status==="pending" as any)?true:false} data={allScrolledData ?? []} />
              </div>
              <button ref={ref}><Spinner /></button>




              {/* <li ref={ref} className="flex flex-col space-y-2">
                    {isFetchingNextPage ? (
                      <>
                        {Array.from({ length: 4 }).map((_, key) => (
                          <Skeleton
                            className="h-[30px] w-full rounded-[4px] bg-[red]"
                            key={key}
                          />
                        ))}
                      </>
                    ) : hasNextPage ? (
                      Array.from({ length: 4 }).map((_, key) => (
                        <Skeleton
                          className="h-[30px] w-full rounded-[4px] bg-[red]"
                          key={key}
                        />
                      ))
                    ) : //@ts-ignore
                    // data?.pages[0]?.count <= options.length ? (
                    //   <p className="text-center text-gray-500 py-2">
                    //     You have reached the end ~
                    //   </p>
                    // ) : 
                    (
                      <Skeleton className="h-[30px] w-full rounded-[4px] mt-5 bg-[red]" />
                    )}
                  </li> */}
            </main>

            {/* Happening Sidebar */}
            <aside className="lg:col-span-1 pt-2 flex flex-col items-end min-w-[180px] max-w-[220px]">
              <Card className="w-full bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
                <div className="sticky top-32 w-full p-4">
                  <h3 className="text-sm font-semibold tracking-wider uppercase mb-4 text-foreground dark:text-white">HAPPENING</h3>
                  <ul className="space-y-4 w-full">
                    {[
                      {
                        people: [
                          { name: 'Ada Lovelace', bio: 'Mathematician, writer, and the world\'s first computer programmer. Pioneer for women in STEM.' },
                          { name: 'Grace Hopper', bio: 'Computer scientist, US Navy rear admiral, and inventor of the first compiler. Advocate for accessible programming.' }
                        ], topic: 'Women in tech, breaking barriers, inspiring leaders, STEM education, programming history, legacy.'
                      },
                      {
                        people: [
                          { name: 'Steve Jobs', bio: 'Co-founder of Apple. Visionary leader in personal computing, design, and digital media.' },
                          { name: 'Bill Gates', bio: 'Co-founder of Microsoft. Philanthropist, software pioneer, and global health advocate.' }
                        ], topic: 'Personal computing revolution, software innovation, entrepreneurship, philanthropy, digital transformation.'
                      },
                      {
                        people: [
                          { name: 'Larry Page', bio: 'Co-founder of Google. Innovator in search, AI, and internet technology.' },
                          { name: 'Sergey Brin', bio: 'Co-founder of Google. Leader in search, data, and technology for good.' }
                        ], topic: 'Search engines, the web, data science, AI, global connectivity, information access.'
                      },
                      {
                        people: [
                          { name: 'Brian Kernighan', bio: 'Computer scientist, co-creator of Unix, and author. Influential in software development and education.' },
                          { name: 'Dennis Ritchie', bio: 'Computer scientist, co-creator of Unix and C. Pioneer in operating systems and programming languages.' }
                        ], topic: 'Unix, operating systems, open source, C programming, software development, tech legacy.'
                      },
                      {
                        people: [
                          { name: 'Linus Torvalds', bio: 'Creator of Linux and Git. Advocate for open source and collaborative software.' },
                          { name: 'Guido van Rossum', bio: 'Creator of Python. Champion for readable, accessible programming and open source.' }
                        ], topic: 'Open source, Python, Linux, software collaboration, programming languages, tech community.'
                      },
                      {
                        people: [
                          { name: 'Sheryl Sandberg', bio: 'COO of Facebook, author, and advocate for women in leadership and workplace equality.' },
                          { name: 'Susan Wojcicki', bio: 'Former CEO of YouTube. Leader in digital media, advertising, and tech policy.' }
                        ], topic: 'Leadership, Silicon Valley, digital media, workplace equality, tech policy, women in business.'
                      },
                    ].map((item, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <li className="py-1 px-2 rounded-lg w-full flex flex-col items-start transition-all duration-200 cursor-pointer hover:bg-muted/80 hover:shadow-lg hover:rounded-xl hover:px-3 hover:py-2 hover:scale-[1.03]">
                              <div className="text-sm font-medium text-foreground/90 leading-tight w-full">{item.people[0].name}</div>
                              <div className="text-sm text-foreground/70 leading-tight w-full">with {item.people[1].name}</div>
                            </li>
                          </TooltipTrigger>
                          <TooltipContent side="right" align="center" className="z-[9999] rounded-xl px-5 py-4 max-w-xs bg-muted shadow-xl">
                            <div className="flex flex-col gap-1.5">
                              {[0, 1].map(i => (
                                <div key={i} className="text-base font-medium text-foreground/90">
                                  <span className="font-semibold mr-1">{item.people[i].name}:</span>
                                  <span className="text-sm text-foreground/80 font-normal">{item.people[i].bio}</span>
                                </div>
                              ))}
                              <Separator className="my-2 bg-gradient-to-r from-transparent via-muted-foreground/30 to-transparent" />
                              <div className="text-base font-medium text-foreground/90 mb-0.5">
                                <span className="font-semibold mr-1">Topics:</span>
                                <span className="text-sm text-foreground/80">
                                  {item.topic.split(/[,•|]/).map((topic, idx, arr) => (
                                    <span key={idx}>{topic.trim()}{idx < arr.length - 1 ? ', ' : ''}</span>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </ul>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </TransitionWrapper>
      {showLikesModal && sampleConversations.find(c => c.id === showLikesModal)?.likedBy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowLikesModal(null)}>
          <div className="bg-background rounded-xl shadow-xl p-6 min-w-[340px] max-w-[95vw] max-h-[80vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-2xl text-muted-foreground hover:text-primary focus:outline-none" onClick={() => setShowLikesModal(null)} aria-label="Close">×</button>
            <h3 className="text-lg font-semibold mb-4">Reactions</h3>
            <ul className="divide-y divide-muted-foreground/10">
              {sampleConversations.find(c => c.id === showLikesModal)?.likedBy?.map(user => (
                <li key={user.username} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-base font-semibold text-muted-foreground">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-base leading-tight">{user.name}</div>
                      <div className="text-sm text-muted-foreground leading-tight">@{user.username}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">{user.time}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {showCommentsModal && sampleConversations.find(c => c.id === showCommentsModal)?.commentedBy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCommentsModal(null)}>
          <div className="bg-background rounded-xl shadow-xl p-6 min-w-[340px] max-w-[95vw] max-h-[80vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-2xl text-muted-foreground hover:text-primary focus:outline-none" onClick={() => setShowCommentsModal(null)} aria-label="Close">×</button>
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            <ul className="divide-y divide-muted-foreground/10">
              {sampleConversations.find(c => c.id === showCommentsModal)?.commentedBy?.map(user => (
                <li key={user.username} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-base font-semibold text-muted-foreground">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-base leading-tight">{user.name}</div>
                      <div className="text-sm text-muted-foreground leading-tight">@{user.username}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">{user.time}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;

