import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, LogIn, UserPlus, Heart, MessageSquare, Eye, Share2, Cookie } from 'lucide-react';
import TransitionWrapper from '@/components/TransitionWrapper';
import Navbar from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Cookies from 'js-cookie';

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
    }
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
    }
  }
];

const Index: React.FC = () => {
  const scrollToDiscussions = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

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
    }
  };

  return <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen">
        {/* Hero Section */}
        <section className="relative flex min-h-screen items-center justify-center pt-0 -mt-16">
          <div className="w-full max-w-6xl px-4 py-12 text-center sm:px-6 mx-px lg:px-[34px] my-[7px]">
            <TransitionWrapper animation="slide-up" className="space-y-6">
              <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm">
                <span className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  New
                </span>
                <span className="text-muted-foreground">Public Text Event Platform</span>
              </div>
              
              <h1 className="font-display text-balance text-4xl font-medium tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                <span>Discuss or Debate</span> <span className="text-primary">in Public</span>
                <br />
                <span></span>
              </h1>
              
              <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">Create topics, Invite guests, exchange ideas and convert text to PODCAST</p>
              
              <div className="flex flex-col items-center justify-center space-y-4 pt-6 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Link to={Cookies.get("access") ? `/invite` : "/register"}>
                  <Button size="lg" className="group relative overflow-hidden rounded-full px-8 py-6 transition-all duration-300 hover:shadow-md">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </TransitionWrapper>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-0 right-0 mx-auto flex justify-center cursor-pointer animate-bounce" onClick={scrollToDiscussions} aria-label="Scroll to past discussions">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Past Discussions</span>
              <ChevronDown className="h-6 w-6 text-primary" />
            </div>
          </div>
        </section>

        {/* Past Discussions Section */}
        <section id="past-discussions" className="py-16 flex flex-col items-center justify-center min-h-screen bg-muted/5 dark:bg-background">
          <div className="w-full px-4 max-w-4xl mx-auto">
            <TransitionWrapper animation="fade" className="w-full">
              <div className="space-y-2 w-full max-w-[1400px] mx-auto">
                {sampleConversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className="overflow-hidden transition-all duration-300 ease-out bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 cursor-pointer hover:bg-muted/80 hover:shadow-xl hover:scale-[1.02] hover:border-primary/20 hover:-translate-y-1"
                    onClick={() => {
                      window.location.href = '/register';
                    }}
                  >
                    <div className="p-0">
                      {/* Main Topic as Header */}
                      <div className="bg-transparent px-6 pt-2 pb-2 border-0 border-b border-muted/20">
                        {conversation.mainTopic && (
                          <>
                            <h2 className="text-lg font-medium tracking-tight text-foreground/90 dark:text-white/90 mb-1">
                              {conversation.mainTopic}
                            </h2>
                            <hr className="border-foreground/10 mb-2" />
                          </>
                        )}

                        {conversation.isNewDiscussion ? (
                          <div className="mb-6">
                            <div className="flex items-center gap-4 w-full min-h-[4rem]">
                              <div className="group">
                                <Avatar className="h-20 w-20 rounded-xl flex-shrink-0 transition-transform group-hover:ring-2 group-hover:ring-primary group-hover:scale-105">
                                  {conversation.participants[0].avatar ? (
                                    <AvatarImage src={conversation.participants[0].avatar} alt={conversation.participants[0].name} className="rounded-xl" />
                                  ) : (
                                    <AvatarFallback className="rounded-xl text-lg font-semibold bg-muted text-muted-foreground">
                                      {conversation.participants[0].name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              </div>
                              <div className="flex flex-col justify-center h-full min-h-[4rem] w-full">
                                <div className="font-semibold text-sm text-foreground tracking-tight mb-0.5 whitespace-nowrap transition-colors">
                                  {conversation.participants[0].name}
                                </div>
                                <span className="text-xs text-foreground/60 break-words w-full" style={{maxWidth: '280ch'}}>
                                  {conversation.participants[0].bio.length > 140 ? conversation.participants[0].bio.slice(0, 140) + '…' : conversation.participants[0].bio}
                                </span>
                              </div>
                            </div>
                            {conversation.postContent && (
                              <div className="mt-4 mb-4">
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                  {conversation.postContent.length > 200 
                                    ? conversation.postContent.slice(0, 200) + '...'
                                    : conversation.postContent
                                  }
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 mb-6">
                            {conversation.participants.map((participant, index) => (
                              <div key={participant.username} className="flex items-center gap-4 w-full min-h-[4rem]">
                                <div className="group">
                                  <Avatar className="h-20 w-20 rounded-xl flex-shrink-0 transition-transform group-hover:ring-2 group-hover:ring-primary group-hover:scale-105">
                                    {participant.avatar ? (
                                      <AvatarImage src={participant.avatar} alt={participant.name} className="rounded-xl" />
                                    ) : (
                                      <AvatarFallback className="rounded-xl text-lg font-semibold bg-muted text-muted-foreground">
                                        {participant.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                </div>
                                <div className="flex flex-col justify-center h-full min-h-[4rem] w-full">
                                  <div className="font-semibold text-sm text-foreground tracking-tight mb-0.5 whitespace-nowrap transition-colors">
                                    {participant.name}
                                  </div>
                                  <span className="text-xs text-foreground/60 break-words w-full" style={{maxWidth: '280ch'}}>
                                    {participant.bio.length > 140 ? participant.bio.slice(0, 140) + '…' : participant.bio}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Topics Section */}
                        <div className="mb-4 flex items-center gap-2 w-full" style={{minHeight: '1.5rem'}}>
                          <span className="text-sm font-medium text-foreground/90 mr-1 whitespace-nowrap flex items-center">Topics:</span>
                          <div className="relative flex-1 overflow-x-hidden flex items-center" style={{height: '1.5rem'}}>
                            <style>{`
                              @keyframes arena-scroll-left {
                                0% { transform: translateX(0); }
                                100% { transform: translateX(-50%); }
                              }
                            `}</style>
                            <div
                              className="flex items-center gap-1 flex-nowrap whitespace-nowrap"
                              style={{
                                animation: 'arena-scroll-left 16s linear infinite',
                                willChange: 'transform',
                                minWidth: '100%',
                              }}
                            >
                              {conversation.otherTopics.concat(conversation.otherTopics).map((topic, idx) => (
                                <span key={idx} className="text-sm text-foreground/90 font-normal cursor-pointer px-1 flex items-center" style={{lineHeight: '1.5rem'}}>
                                  {topic}{idx < conversation.otherTopics.length * 2 - 1 ? ' | ' : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Engagement Metrics */}
                        <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                          <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2 group cursor-pointer hover:opacity-70 transition-opacity">
                              <Eye className="h-4 w-4 text-muted-foreground/50" />
                              <span className="text-xs font-medium text-muted-foreground tracking-tight">
                                {formatNumber(conversation.engagement.views)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-pointer hover:opacity-70 transition-opacity">
                              <Heart className="h-4 w-4 text-rose-400" />
                              <span className="text-xs font-medium text-rose-500/90 tracking-tight">
                                {formatNumber(conversation.engagement.loves)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 group cursor-pointer hover:opacity-70 transition-opacity">
                              <MessageSquare className="h-4 w-4 text-blue-400" />
                              <span className="text-xs font-medium text-blue-500/90 tracking-tight">
                                {formatNumber(conversation.engagement.comments)}
                              </span>
                            </div>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors h-7 px-2.5"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare(conversation.id);
                                  }}
                                >
                                  <Share2 className="h-4 w-4" />
                                  Share
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Share conversation</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TransitionWrapper>
          </div>
        </section>
      </TransitionWrapper>
    </>;
};

export default Index;
