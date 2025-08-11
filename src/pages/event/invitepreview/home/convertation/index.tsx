import CustomDialog from '@/components/dialog';
import { ArenaEventSkeleton } from '@/components/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { formatNumber, formatTimestamp } from '@/utils/helper/index.helper';
import { EventAreanData, IndividualQuery, MessageCommentData, PostlikedByData, QueryData } from '@/utils/interface/index.interface';
import { useListData, usePostData } from '@/utils/query/index.query';
import { useUser } from '@/utils/state/index.state';
import {
    Bookmark,
    Eye,
    Heart,
    MessageSquare,
    Pin,
    Share2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { date } from 'zod';

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

type Props = {
    data: EventAreanData[],
    isPending?:boolean
}

const ConversationCard: React.FC<Props> = ({ data = [] ,isPending=false}) => {
    let [eventData, seteventData] = useState<any[]>(data ?? []);
    useEffect(() => { seteventData(data) }, [data]);
    const { user } = useUser();

    /* api calls */
    const { mutate, isPending:commentMutatePending } = usePostData();

    /* post bookmarked */
    const handleBookmark = ({ postId }: { postId: string }) => {
             let newData = eventData.map((item) => item._id == postId ? ({ ...item, bookmark: !item.bookmark }) : item);
 seteventData(newData);

        mutate({
            endpoint: endpoint["bookmark"],
            data: { id: postId },
            method: METHODS.PATCH
        }, {
            onSuccess: ({ status }) => {

               

                if ([200].includes(status)) {
                    // toast.success("Post unmarked");
                    // let newData = eventData.map((item) => item._id == postId ? ({ ...item, bookmark: false }) : item);
                   
                }; if ([201].includes(status)) {
                    // toast.success("Post bookmarked");
                    // let newData = data.map((item) => item._id == postId ? ({ ...item, bookmark: true }) : item);
                    // seteventData(newData);

                };
            }
        })
    };

    /* post liked */
    const handleLiked = ({ postId,liked }: { postId: string,liked:boolean }) => {
           let newData = eventData.map((item) => item._id == postId ? ({ ...item, liked: !item.liked, like: liked ? item["like"] - 1 :  item["like"] + 1 }) : item);
                    seteventData(newData);

        mutate({
            endpoint: endpoint["liked"],
            data: { id: postId, parent: postId },
            method: METHODS.PATCH
        }, {
            onSuccess: ({ status }) => {
                if ([200].includes(status)) {
                    // toast.success("Post unliked");
                    // let newData = eventData.map((item) => item._id == postId ? ({ ...item, liked: false, like: item["like"] - 1 }) : item);
                    // seteventData(newData);

                }; if ([201].includes(status)) {
                    // toast.success("Post liked");
                    // let newData = eventData.map((item) => item._id == postId ? ({ ...item, liked: true, like: item["like"] + 1 }) : item);
                    // seteventData(newData);

                };
            }
        })
    };


    /* comments by */
    const [showComments, setShowComments] = useState<string | null>(null);
    const [commentInput, setCommentInput] = useState('');
    const [showLoveReactions, setShowLoveReactions] = useState<string | null>(null);
    const [replyToReply, setReplyToReply] = useState<Comment | null>(null);


    let { data: commentsData, isPending: commentsPending } = useListData<QueryData<MessageCommentData>>({
        endpoint: endpoint["comment"],
        enabled: !!showComments,
        key: "comments" + showComments as any,
        id: showComments as string,
        window: true
    });

    /* liked by */
    const { data: likedByData, isPending: likedByPending } = useListData<QueryData<PostlikedByData>>({
        endpoint: endpoint["arena-likeby"],
        enabled: !!showLoveReactions,
        key: "likedby" + showLoveReactions as any,
        id: showLoveReactions as any,
        window: true
    });

    /* new comment liked */
    const handleComment = ({ type = "post", content }: { type: "message" | "post", content: string }) => {
        mutate({
            endpoint: endpoint["comment"] + `${showComments}`,
            data: { content, type, parent: showComments },
            method: METHODS.POST
        }, {
            onSuccess: ({ status, data }) => {
                if ([200].includes(status)) {
                    toast.success("comment updated");
                    commentsData["data"]["data"] = [...commentsData?.data.data, data?.data];

                }; if ([201].includes(status)) {
                    toast.success("comment added");
                    commentsData["data"]["data"] = [...commentsData?.data.data, data?.data];
                    let newEvent = eventData?.map((item) => item._id == showComments ? ({ ...item, comments: item["comments"] + 1 }) : item);
                    seteventData(() => newEvent);
                };
                setCommentInput(() => "")
            }
        })
    };

    return (<>
        <div className="space-y-2 w-full max-w-[1400px] mx-auto">

          
            {

            isPending ?    Array.from({length:5}).map((_,i:number) =><ArenaEventSkeleton key={i} self={i%2!=0}  />) :
            
            eventData?.map((conversation: EventAreanData,idx:number) => {
                return (
                    <>
                        <ConversationItem
                        key={idx}
                            conversation={conversation}
                            handleBookmark={handleBookmark}
                            handleComment={handleComment}
                            handleLiked={handleLiked}
                            showLoveReactions={showLoveReactions}
                            setShowLoveReactions={setShowLoveReactions}
                            setShowComments={setShowComments}
                            user={user}


                            likedByPending={likedByPending}
                            commentsPending={commentsPending}

                        />
         
                    </>
                )
            })}
        </div>


        <CustomDialog title={"Reactions"} open={showLoveReactions !== null} onClose={() => setShowLoveReactions(null)}>
            <div className="max-h-96 overflow-y-auto">
                {showLoveReactions && (
                                        likedByPending ? Array.from({length:4}).map((_,i:number) =><Skeleton key={i} className='h-[50px] bg-slate-200 w-full !mb-[6px]' />) :
                        likedByData?.data?.data?.map((reaction) => (
                    <div key={reaction?._id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={reaction?.user?.image?.url || ""} />
                            <AvatarFallback className="text-xs">
                                {reaction?.user?.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{reaction?.user.fullName}</p>
                            <p className="text-xs text-muted-foreground">@{reaction?.user.username}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {new Date(reaction.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            })}
                        </span>
                    </div>
                ))
                )}
            </div>
        </CustomDialog>



        <CustomDialog title={"Comments"} open={showComments !== null} className={"lg:min-w-[600px]"} onClose={() => {
            setShowComments(null);
            setCommentInput('');
        }}>
            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="max-h-[70vh] overflow-y-auto">
                    {showComments && (
                                            commentsPending ? Array.from({length:4}).map((_,i:number) =><Skeleton key={i} className='h-[60px] bg-slate-200 w-full !mb-[6px]' />) :
                            
                                            commentsData?.data?.data?.length===0 ? <div className='text-slate-400 text-center italic'>Be first to comment!</div> :
                                            commentsData?.data?.data?.map((comment) => (
                        <div key={comment?._id} className="space-y-3">
                            <div className="relative">
                                <div
                                    className="flex gap-3 cursor-pointer p-2 rounded-lg hover:bg-muted/30 transition-colors"
                                >
                                    <Avatar className="h-8 w-8 flex-shrink-0">
                                        <AvatarFallback className="text-xs">
                                            {comment?.user?.fullName?.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-semibold text-foreground">{comment?.user?.fullName}</span>
                                            {comment?.user?._id === data?.data?.data?.author?._id && (
                                                <Badge variant="secondary" className="text-xs">Host</Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {formatTimestamp(comment?.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{comment?.content}</p>
                                        {/* <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                                <Heart className="h-3.5 w-3.5" />
                                                <span>0</span>
                                            </button>
                                            <button className="flex items-center gap-1 hover:text-primary transition-colors">
                                                <MessageSquare className="h-3.5 w-3.5" />
                                                <span>{0}</span>
                                            </button>
                                            <div className="flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" />
                                                <span>0</span>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                    ) }
                </div>
                <div className="ml-11 flex gap-2 py-2">
                    <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleComment({ type: "message", content: commentInput.trim() })}
                        placeholder={replyToReply ? `Reply to ${replyToReply.user.name}...` : `Enter your comment?...`}
                        className="flex-1 text-sm px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button size="sm" onClick={() => handleComment({ type: "post", content: commentInput.trim() })} disabled={!commentInput.trim()||commentMutatePending}>
                        {replyToReply ? "Reply" : commentMutatePending? "Posting..." : "Post Comment"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setReplyToReply(null); setCommentInput(''); }}>
                        Cancel
                    </Button>
                </div>
            </div>

        </CustomDialog>

    </>)
}

export default ConversationCard;



const ConversationItem = ({ conversation, handleBookmark, commentsPending,likedByPending, handleLiked, showLoveReactions, setShowLoveReactions, setShowComments, user }: any) => {
    const [expandedContent, setExpandedContent] = useState<string | null>(null);

    const { ref, inView } = useInView({
        threshold: 0.5, // Trigger when 50% is visible
        triggerOnce: true, // Only fire once
    });

    /* api logic */
    const { mutate } = usePostData();
    useEffect(() => {
        if (inView && !conversation.viewed) {
            mutate({
                endpoint: endpoint["view"] + conversation._id,
                data: { id: conversation._id, type: "post", parent: conversation._id }
            }, {
                onSuccess: ({ data, status }) => {
                    console.log({ data, status })
                }
            })
        }
    }, [inView]);



    const navigate = useNavigate();

      const handleShare = (id:string) => {
        navigator.clipboard.writeText(`${window.location.origin}/conversation/${id}`);
        toast.success("Copied to clipboard")
      };
    return (<>
        <div
            ref={ref}
            key={conversation._id}
            className="overflow-hidden transition-all duration-300 ease-out bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 cursor-pointer hover:bg-muted/80 hover:shadow-xl hover:scale-[1.02] hover:border-primary/20 hover:-translate-y-1"
            onClick={() => {
                if (conversation._id) {
                  conversation?.isNewDiscussion ? null :  navigate(`/conversation/${conversation._id}`);
                }
            }}
        >
            <div className="p-0">

                <div className="bg-transparent px-6 pt-2 pb-2 border-0 border-b border-muted/20">
                    {conversation.topics && !conversation.isNewDiscussion && (
                        <>
                            <h2 className="text-lg text-start font-medium tracking-tight text-foreground/90 dark:text-white/90 mb-1">
                                {conversation.topics[conversation.mainTopicIndex]}
                            </h2>
                            <hr className="border-foreground/10 mb-2" />
                        </>
                    )}

                    {conversation?.isNewDiscussion ? (
                        <div className="mb-6">
                            <div className="flex items-center gap-4 w-full min-h-[4rem] text-start">
                                <Link
                                    to={`/profile/${conversation.author.username}`}
                                    className="group"
                                    onClick={e => e.stopPropagation()}
                                    tabIndex={0}
                                    aria-label={`View ${conversation.author.fullName}'s profile`}
                                >
                                    <Avatar className="h-20 w-20 rounded-xl flex-shrink-0 transition-transform group-hover:ring-2 group-hover:ring-primary group-hover:scale-105">
                                        {conversation.author?.image?.url ? (
                                            <AvatarImage src={conversation.author?.image?.url} alt={conversation.author.fullName} className="rounded-xl" />
                                        ) : (
                                            <AvatarFallback className="rounded-xl text-lg font-semibold bg-muted text-muted-foreground">
                                                {conversation.author.fullName.split(' ').map((n: any) => n[0]).join('')}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                </Link>
                                <div className="flex flex-col justify-center h-full min-h-[4rem] w-full" >
                                    <Link
                                        to={`/profile/${conversation.author.username}`}
                                        className="font-semibold text-sm text-foreground tracking-tight mb-0.5 whitespace-nowrap transition-colors hover:underline hover:font-bold focus:underline focus:font-bold"
                                        onClick={e => e.stopPropagation()}
                                        tabIndex={0}
                                        aria-label={`View ${conversation.author.fullName}'s profile`}
                                    >
                                        {conversation.author.fullName}
                                    </Link>
                                    <span className="text-xs text-foreground/60 break-words w-full" style={{ maxWidth: '280ch' }}>
                                        {conversation?.author?.bio?.length > 140 ? conversation?.author?.bio?.slice(0, 140) + '…' : conversation?.author?.bio}
                                    </span>
                                </div>
                            </div>
                            {conversation.content && (
                                <div className="mt-4 mb-4 text-start">
                                    <p className="text-sm text-foreground/90 leading-relaxed">
                                        {expandedContent === conversation._id
                                            ? conversation.content
                                            : conversation.content.length > 200
                                                ? conversation.content.slice(0, 200) + '...'
                                                : conversation.content
                                        }
                                    </p>
                                    {conversation.content.length > 200 && (
                                        <button
                                            type="button"
                                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedContent(expandedContent === conversation._id ? null : conversation._id);
                                            }}
                                        >
                                            {expandedContent === conversation._id ? 'Show less' : 'Read more'}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {[conversation.author, conversation.guest].map((participant, index) =>{
                                if(!participant) return;
                                return (
                                <div key={index}  className="flex items-center text-start gap-4 w-full min-h-[4rem]">
                                    <Link
                                        to={`/profile/${participant?.username}`}
                                        className="group"
                                        onClick={e => e.stopPropagation()}
                                        tabIndex={0}
                                        aria-label={`View ${participant?.fullName}'s profile`}
                                    >
                                        <Avatar className="h-20 w-20 rounded-xl flex-shrink-0 transition-transform group-hover:ring-2 group-hover:ring-primary group-hover:scale-105">
                                            {participant?.image?.url ? (
                                                <AvatarImage src={participant?.image?.url} alt={participant?.fullName} className="rounded-xl object-cover" />
                                            ) : (
                                                <AvatarFallback className="rounded-xl text-lg font-semibold bg-muted text-muted-foreground">
                                                    {participant?.fullName.split(' ')?.map((n: any) => n[0]).join('')}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    </Link>
                                    <div className="flex flex-col justify-center h-full min-h-[4rem] w-full">
                                        <Link
                                            to={`/profile/${participant?.username}`}
                                            className="font-semibold text-sm text-foreground tracking-tight mb-0.5 whitespace-nowrap transition-colors hover:underline hover:font-bold focus:underline focus:font-bold"
                                            onClick={e => e.stopPropagation()}
                                            tabIndex={0}
                                            aria-label={`View ${participant?.fullName}'s profile`}
                                        >
                                            {participant?.fullName}
                                        </Link>
                                        <span className="text-xs text-foreground/60 break-words w-full" style={{ maxWidth: '280ch' }}>
                                            {participant?.bio?.length > 140 ? participant?.bio?.slice(0, 140) + '…' : participant?.bio}
                                        </span>
                                    </div>
                                </div>
                            )
                            })}
                        </div>
                    )}

                    {conversation._id && !conversation.isNewDiscussion && (
                        <div className="mb-4 flex items-center gap-2 w-full" style={{ minHeight: '1.5rem' }}>
                            <span className="text-sm font-medium text-foreground/90 mr-1 whitespace-nowrap flex items-center">Topics:</span>
                            <div className="relative flex-1 overflow-x-hidden flex items-center" style={{ height: '1.5rem' }}>
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
                                    {conversation.topics.concat(conversation.topics).map((topic: string, idx: number) => (
                                        <TooltipProvider key={idx} delayDuration={100}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="text-sm text-foreground/90 font-normal cursor-pointer px-1 flex items-center" style={{ lineHeight: '1.5rem' }}>
                                                        {topic}{idx < conversation.topics.length * 2 - 1 ? ' | ' : ''}
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent side="top" align="center" className="z-[9999] rounded-xl px-4 py-2 max-w-xs bg-muted shadow-xl text-xs text-foreground/90">
                                                    {topic}
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-6 pt-2 border-t border-muted/15">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground tracking-tight">
                                {formatNumber(conversation?.view)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="flex items-center justify-center focus:outline-none"
                                onClick={e => {
                                    e.stopPropagation();
                                    // setLoved(l => {
                                    //   setLovesCount(c => l ? c - 1 : c + 1);
                                    //   return !l;
                                    // });

                                    handleLiked({ postId: conversation._id,liked:conversation.liked })
                                }}
                                aria-label={conversation?.liked ? "Remove love" : "Love this"}
                            >
                                <Heart className={cn(
                                    "h-4 w-4 transition-colors",
                                    conversation.liked ? "text-red-500 fill-red-500" : "text-muted-foreground/50 hover:text-primary"
                                )} />
                            </button>
                            <button
                                type="button"
                                className="text-xs font-medium text-muted-foreground/80 tracking-tight hover:underline focus:underline px-1 bg-transparent"
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowLoveReactions(conversation._id);
                                }}
                                aria-label="View people who liked"
                            >
                                {formatNumber(conversation.like)}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground/50" />
                            <button
                                type="button"
                                className="text-xs font-medium text-muted-foreground/80 tracking-tight hover:underline focus:underline px-1 bg-transparent"
                                onClick={e => {
                                    e.stopPropagation();
                                    setShowComments(conversation._id);
                                }}
                                aria-label="View people who commented"
                            >
                                {formatNumber(conversation.comments)}
                            </button>
                        </div>
                        {conversation?.isNewDiscussion && conversation.author._id !== user._id && (
                            <div className="flex items-center gap-2">
                                <NavLink to={`/invite/?gid=${conversation.author._id}`}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors h-7 px-2.5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        Start a conversation
                                    </Button>
                                </NavLink>
                            </div>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleShare( conversation._id )
                                }}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors h-7 px-2.5"
                            //   onClick={() => handleShare(conversation._id)}
                            >
                                <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                type='button'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleBookmark({ postId: conversation._id })
                                }}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors h-7 px-2.5"
                            >
                                <Bookmark className={cn(
                                    "h-4 w-4 transition-colors",
                                    conversation.bookmark ? "text-slate-500 fill-slate-500" : "text-muted-foreground/50 hover:text-primary"
                                )} />
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </>)
}