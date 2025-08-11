import CustomDialog from '@/components/dialog';
import EmptyData from '@/components/empty';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner.';
import { useInfiniteScroller } from '@/hooks/index.hook';
import { cn } from '@/lib/utils';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { formatTimestamp } from '@/utils/helper/index.helper';
import { EventAreanData, IndividualQuery, MessageCommentData, MessageData, PostlikedByData, QueryData } from '@/utils/interface/index.interface';
import { useListData, usePostData } from '@/utils/query/index.query';
import { useUser } from '@/utils/state/index.state';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, CornerUpLeft, Eye, Heart, ImagePlus, MessageSquare, Mic, MicOff } from 'lucide-react';
import React, { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from "socket.io-client";
import { toast } from 'sonner';



const socket: Socket = io(import.meta.env.VITE_SOCKET_API); // Ensure this matches your backend URL

// Add Web Speech API types
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

interface LoveReaction {
  id: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
  };
  timestamp: string;
}

interface Comment {
  id: string;
  content: string;
  user: {
    name: string;
    username: string;
    avatar?: string;
    isHost?: boolean;
  };
  timestamp: string;
  pinned?: boolean;
  replies?: Comment[];
}

interface Message {
  id: string;
  content: string;
  subject?: string;
  sender: {
    name: string;
    username: string;
  };
  timestamp: string;
  topicId: number;
  engagement: {
    loves: number;
    comments: number;
    views: number;
  };
  loveReactions?: LoveReaction[];
  comments?: Comment[];
  images?: string[];
}



const Conversation: React.FC = () => {
  const navigate = useNavigate();

  const [currentTopicId, setCurrentTopicId] = useState(-1);
  // const [messages, setMessages] = useState<Message[]>(topicMessages[1]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedImages, setSelectedImages] = useState<{ url: string; file: File }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [showLoveReactions, setShowLoveReactions] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);
  const [replyToReply, setReplyToReply] = useState<Comment | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setInputValue(transcript);
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const removeImage = (indexToRemove: number) => {
    setSelectedImages(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[indexToRemove].url);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };


  // Pin/unpin comment (host only)
  const handlePinComment = (commentId: string) => {
  };



  /* api logic */
  interface InviteParams {
    id?: string
    arenachat: "text" | "conversation"
  }
  const { id, arenachat } = useParams() as InviteParams;
  const { data, isPending } = useListData<IndividualQuery<EventAreanData>>({
    endpoint: endpoint["arena"],
    enabled: !!id,
    key: id as any,
    id: id,
    window: true
  });




  const handleMessageTopic = (index: number) => {
    setCurrentTopicId(index);
    if (newMessageAlert == index) { setNewMessageAlert(null) };
  };


  /*socket*/

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<MessageData[]>([]);
  const [isTyping, setisTyping] = useState<boolean | any>(false);
  const [newMessageAlert, setNewMessageAlert] = useState<number | null>(null)


  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected");
      setIsConnected(false);
    });

    socket.on("message:receive", (data) => {
      // setMessageList((prev: any) => [...prev, { ...data }]);
      queryClient.setQueryData(
        [`${"arena-message-scroller"}-async` + id],
        (oldData: any) => {
          if (!oldData) return oldData;
          console.log("🚀 ~ Conversation ~ oldData:", oldData)

          const newMessage = { ...data };
          const updatedPages = [...oldData.pages];
          console.log("🚀 ~ Conversation ~ updatedPages:", updatedPages)

          if (updatedPages.length > 0) {
            updatedPages[0] = {
              ...updatedPages[0],
              data: [newMessage, ...updatedPages[0].data], // ✅ push to end
            };
            console.log(updatedPages[updatedPages.length - 1], `updatedPages[updatedPages.length - 1]`)
          } else {
            updatedPages.push({ data: [newMessage] }); // ✅ append new page
          }

          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );

      setSelectedImages(() => []);
      setNewMessageAlert(() => (data?.type === "message" && (data?.topicIndex) !== currentTopicId && data?.user?.uid !== user?._id) ? data?.topicIndex : null)
    });

    socket.on("message:greeting", (data: string) => {
      console.log("New greeting:", data);
      setMessageList((prev: any) => [...prev, { content: data, type: "greeting" }]);
    });

    socket.on("message:user_typing", (data: string) => {
      console.log("user_typing:", data);
      setisTyping(data?.user?.uid);
      setTimeout(() => {
        setisTyping(false);
      }, 3000)
    });


    socket.on("message:joined", (data: { status: boolean, users: any[] }) => {
      console.log("Joined room status:", data);
      console.log("first", data)
      setIsJoined(true);
    });

    socket.on("room:info", (data: { users: any[] }) => {

    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message:receive");
      socket.off("message:greeting");
      socket.off("message:user_typing");

      socket.off("room:info");
      socket.off("message:joined"); // <- corrected
    };
  }, []); // Empty dependency array ensures this runs only once


  /* room join */
  const { user } = useUser();
  const handleJoinRoom = () => {
    if (!isJoined && user) {
      socket.emit("room:join", { user: user?._id, roomId: id });
    }
  };

  useEffect(() => {
    handleJoinRoom();
  }, [isJoined, user]);


  // Handler for sending a chat message
  const fileInputRef = useRef();
  const [currentMessage, setCurrentMessage] = useState<any>({
    content: "",
    file: null
  });
  const handleSocketSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if ((currentMessage.content.trim() || currentMessage.file) && user) {
      // Emit message with user info
      socket.emit("message:send", { ...currentMessage, user: { uid: user._id, roomId: id }, topic: currentTopicId === (-1) ? "introduction" : data?.data.data.topics[currentTopicId], topicIndex: currentTopicId });
      setCurrentMessage({ content: "", file: undefined }); // Clear message and file
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input element
      }
    }
  };

  const handleSocketTypingMessage = () => {
    if ((currentMessage.content.trim() || currentMessage.file) && user) {
      // Emit message with user info
      socket.emit("message:typing", { user: { uid: user._id, roomId: id }, topic: currentTopicId === (-1) ? "introduction" : data?.data.data.topics[currentTopicId], topicIndex: currentTopicId });
    }
  };


  // Handler for message input (text and file)
  const handleMessageInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target;

    if (type === "file") {

      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCurrentMessage((prev: any) => ({
            ...prev,
            file: {
              name: file.name,
              type: file.type,
              data: reader.result as string, // reader.result is string (base64) or ArrayBuffer
            },
          }));
        };
        reader.readAsDataURL(file); // Read file as base64 data URL
        handleImageSelect(e);
      } else {
        setCurrentMessage((prev: any) => ({ ...prev, file: undefined })); // Clear file if no file selected
      }
    } else {
      const value = (e.target as HTMLTextAreaElement).value;
      setCurrentMessage((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Helper function to convert base64 to Blob URL for image display
  const base64ToBlobUrl = (base64: string, contentType: string): string => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }

    const byteArray = new Uint8Array(byteArrays);
    const blob = new Blob([byteArray], { type: contentType });

    return URL.createObjectURL(blob);
  };


  /* */
  const getUserName = (message?: MessageData) => {
    if (message) return message.user.uid === data?.data?.data?.author?._id ? data?.data?.data?.author?.fullName : data?.data?.data?.guest?.fullName;
    else return isTyping === data?.data?.data?.author?._id ? data?.data?.data?.author?.fullName : data?.data?.data?.guest?.fullName;
  };



  /* api calls */
  const queryClient = useQueryClient();
  const {
    data: mData,
    hasNextPage,
    isFetchingNextPage,
    status,
    fetchNextPage,
    refetch,
  } = useInfiniteScroller({
    endpoint: endpoint["arena-messages"] + id,
    filter: { topic: currentTopicId === (-1) ? "introduction" : data?.data.data.topics[currentTopicId] },
    enabled: !!id,
    key: `${"arena-message-scroller"}-async` + id as any,
  });
  const { ref, inView } = useInView();



  let allScrolledData = useMemo(() => {
    let newData = mData?.pages.flatMap((page: any) => page.data) || [];
    return newData;
  }, [mData]);


  const filteredMessages = useMemo(() => {
    // Copy before reversing to avoid mutating state
    return [...(allScrolledData || [])]
      .reverse()
      .filter(m => m.topicIndex == currentTopicId);
  }, [allScrolledData, currentTopicId]);



  useEffect(() => {

    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);


  /* comments by */
  let { data: commentsData, isPending: commentsPending } = useListData<IndividualQuery<MessageCommentData[]>>({
    endpoint: endpoint["comment"],
    enabled: !!showComments,
    key: "comments" + showComments as any,
    id: showComments as string,
    window: true
  });

  /* liked by */
  const { data: likedByData, isPending: likedByPending } = useListData<QueryData<PostlikedByData[]>>({
    endpoint: endpoint["arena-likeby"],
    enabled: !!showLoveReactions,
    key: "likedby" + id as any,
    id: showLoveReactions as any,
    window: true
  });


  const { mutate: likeMutate, isPending: likePending } = usePostData();
  const { mutate: commentMutate, isPending: commentPending } = usePostData();



  /* new convertation liked */
  const handleLiked = ({ postId, type = "message" }: { postId: string, type: string }) => {
    likeMutate({
      endpoint: endpoint["liked"],
      data: { id: postId, parent: id, type },
      method: METHODS.PATCH
    }, {
      onSuccess: ({ status }) => {
        if ([200, 201].includes(status)) {
          // toast.success(status === 200 ? "Message unliked" : "Message liked");

          queryClient.setQueryData([`${"arena-message-scroller"}-async` + id], (oldData: any) => {
            if (!oldData) return oldData;
            const newPages = oldData.pages.map((page: any) => {
              return {
                ...page,
                data: page.data.map((item: any) =>
                  item._id === postId
                    ? {
                      ...item,
                      liked: status === 201,
                      like: item.like + (status === 201 ? 1 : -1),
                    }
                    : item
                ),
              };
            });

            return { ...oldData, pages: newPages };
          });
        }
      }
    });
  };


  /* new comment liked */
  const handleComment = ({ type = "message", content }: { type: "message" | "post", content: string }) => {
    commentMutate({
      endpoint: endpoint["comment"] + `${showComments}`,
      data: { content, type, parent: id },
      method: METHODS.POST
    }, {
      onSuccess: ({ status, data }) => {
        if ([200].includes(status)) {
          toast.success("comment updated");
          commentsData["data"]["data"] = [...commentsData?.data.data, data?.data];

        }; if ([201].includes(status)) {
          toast.success("comment added");
          commentsData["data"]["data"] = [...commentsData?.data.data, data?.data];

          queryClient.setQueryData([`${"arena-message-scroller"}-async` + id], (oldData: any) => {
            if (!oldData) return oldData;
            const newPages = oldData.pages.map((page: any) => {
              return {
                ...page,
                data: page.data.map((item: any) =>
                  item._id === showComments
                    ? { ...item, comments: item["comments"] + 1 }
                    : item
                ),
              };
            });

            return { ...oldData, pages: newPages };
          });

        };
        setCommentInput(() => "")
      }
    })
  };

  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (mData) {
      // Delay ensures DOM has rendered
      const timeout = setTimeout(scrollToBottom, 0);
      return () => clearTimeout(timeout);
    }
  }, [mData, messageList]);




  return (
    <>

      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen bg-background pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            {/* Header */}
            <div className="border-b border-muted/20 bg-muted/50 dark:bg-muted/30 p-4">
              <div className="flex flex-col items-center justify-center relative">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => navigate(arenachat === "text" ? '/messages' : '/home')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-medium">
                  {data?.data?.data?.topics[currentTopicId] || "Introduction"}
                </p>
                {currentTopicId === -1 && (
                  <span className="text-xs text-muted-foreground mt-1">
                    Word count will start from the next topic
                  </span>
                )}



              </div>
            </div>

            <div className="flex">
              {sidebarOpen ? (
                <div className="w-56 p-2 space-y-2 border-r relative">

                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Collapse topics sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h3 className="font-medium mb-2 text-foreground/80 dark:text-white/80">Topics</h3>
                  <div className="space-y-1">

                    <button
                      onClick={() => handleMessageTopic(-1)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        currentTopicId === -1
                          ? "bg-muted/60 text-foreground/90 dark:text-white/90 font-medium"
                          : "hover:bg-muted/40 text-foreground/70 dark:text-white/70"
                      )}
                    >
                      Introduction  {newMessageAlert == -1 && <DotBlink />}
                    </button>
                    {
                      isPending ? Array.from({ length: 4 }).map((_, i: number) => <Skeleton key={i} className='h-[50px] bg-slate-200 w-[200px] !mb-[16px]' />) :
                        data?.data?.data?.topics?.map((topic, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleMessageTopic(index)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex",
                              currentTopicId === index
                                ? "bg-muted/60 text-foreground/90 dark:text-white/90 font-medium"
                                : "hover:bg-muted/40 text-foreground/70 dark:text-white/70"
                            )}
                          >
                            {topic} {newMessageAlert == index && <DotBlink />}
                          </button>
                        ))}
                  </div>
                </div>
              ) : (
                <button
                  className="w-6 h-10 flex items-center justify-center border-r bg-background hover:bg-muted transition-colors"
                  onClick={() => setSidebarOpen(true)}
                  type='button'
                  aria-label="Expand topics sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}

              {/* Messages Area */}
              <div className="flex-1 flex flex-col h-[calc(100vh-16rem)]" >
                <CardContent className="flex-1 p-4 overflow-y-auto" ref={containerRef}>
                  <div className="space-y-6">
                   {filteredMessages.length>0 && <div className="flex justify-center items-center "> {hasNextPage ? <button ref={ref}><Spinner /></button> : <span className='text-slate-400'>No more history</span>}</div>}
                 
                    {
                      (status==="pending" as any || filteredMessages.length==0) ? <EmptyData
                      textClass={"text-[14px] font-medium mb-2"}
                      imgClass={'max-h-[300px] max-w-[300px]'}
                      title={status==="pending" as any ? "loading..." : "No messages"}
                      /> : 
                      filteredMessages?.map((message, idx) => {
                        return (<>
                          <MessageItem
                            activeMessageId={activeMessageId}
                            handleLiked={handleLiked}
                            message={message}
                            setActiveMessageId={setActiveMessageId}
                            setReplyToMessage={setReplyToMessage}
                            setShowComments={setShowComments}
                            setShowLoveReactions={setShowLoveReactions}
                            key={idx}
                            arenaData={data?.data?.data} />


                          {/* <div key={idx} className="mb-4 cursor-pointer" onClick={() => setActiveMessageId(() => message._id)}>
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-sm font-semibold text-foreground">{message.sender === data?.data?.data?.author?._id ? data?.data?.data?.author?.fullName : data?.data?.data?.guest?.fullName}</span>
                              <span className="text-xs text-muted-foreground">{message.createdAt && format(new Date(message.createdAt), 'MMM d, h:mm a')}</span>

                            </div>
                            <span className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{message.content}
                              {message.file && (
                                <img
                                  src={message.file.url}
                                  alt={message.file.s3Key || 'Uploaded Image'}
                                  className="mt-2 max-w-[200px] max-h-[200px] object-contain rounded-lg shadow-md"
                                />
                              )}
                            </span>
                          </>
                          {activeMessageId == message._id && message._id && (
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <button
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleLiked({ postId: message._id });
                                }}
                              >
                                <Heart
                                  className={cn(
                                    "h-4 w-4 transition-colors",
                                    message.liked ? "text-red-500 fill-red-500" : "text-muted-foreground/50 hover:text-primary"
                                  )}
                                />
                                <span onClick={e => {
                                  e.stopPropagation();
                                  if (message?.like > 0) {
                                    setShowLoveReactions(message?._id);
                                  }
                                }}>{message?.like}</span>
                              </button>
                              <button
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                                onClick={e => {
                                  e.stopPropagation();
                                  setShowComments(message._id);
                                }}
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                <span>{message?.comments}</span>
                              </button>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{message?.engagement?.views}</span>
                              </div>
                              <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={e => { e.stopPropagation(); setReplyToMessage(message); }}>
                                <CornerUpLeft className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}


                        </div> */}
                        </>)
                      })
                    }

                    {/* {
                      messageList?.map((message, idx) => {
                        return(<>
                        <MessageItem
                        activeMessageId={activeMessageId}
                        handleLiked={handleLiked}
                        message={message}
                        setActiveMessageId={setActiveMessageId}
                        setReplyToMessage={setReplyToMessage}
                        setShowComments={setShowComments}
                        setShowLoveReactions={setShowLoveReactions}
                        key={idx}
                        arenaData={data?.data?.data} />


                        </>)
                      })
                    } */}

                  </div>
                </CardContent>

                {/* Above the input area, show reply preview if set */}
                {replyToMessage && (
                  <div className="mb-2 p-2 rounded bg-muted/30 border-l-4 border-primary flex items-center justify-between">
                    <div>
                      <span className="font-normal text-primary mr-2 text-sm">Replying to {replyToMessage.sender.name}:</span>
                      <span className="text-xs text-muted-foreground">{replyToMessage.content.slice(0, 60)}{replyToMessage.content.length > 60 ? '...' : ''}</span>
                    </div>
                    <button className="ml-4 text-xs text-muted-foreground hover:text-destructive" onClick={() => setReplyToMessage(null)}>Cancel</button>
                  </div>
                )}

                {/* Input Area */}
                {arenachat !== "conversation" && <form onSubmit={handleSocketSendMessage} className="border-t border-muted/20 p-4">
                  {isTyping && <span className='text-[12px] text-slate-400'>{getUserName()} is typing...</span>}

                  <div className="space-y-3">
                    <div className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm rounded-lg p-3 space-y-2 border border-muted/40 hover:border-primary/50 transition-colors">
                      <textarea
                        name="content"
                        ref={textareaRef}
                        value={currentMessage.content}
                        onChange={(e) => {
                          handleMessageInputChange(e);
                          handleSocketTypingMessage();
                          // Always expand to fit content
                          const textarea = e.target;
                          textarea.style.height = 'auto';
                          textarea.style.height = textarea.scrollHeight + 'px';
                        }}
                        // onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Share your thoughts..."
                        className="w-full bg-transparent text-sm focus:outline-none resize-none min-h-[40px]"
                      />

                      {selectedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 pt-2 max-h-[200px] overflow-y-auto">
                          {selectedImages.map((img, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={img.url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-md"
                              />
                              <button
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            type='button'

                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => document.getElementById('photo-upload')?.click()}
                          >
                            <ImagePlus className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Button>
                          <input
                            type="file"
                            id="photo-upload"
                            accept="image/*"
                            name='file'
                            // multiple
                            className="hidden"
                            onChange={(e) => { handleMessageInputChange(e) }}
                          />
                          {recognition && (
                            <Button
                              variant="ghost"
                              type='button'

                              size="sm"
                              className={cn(
                                "h-7 w-7 p-0",
                                isRecording && "text-red-500 hover:text-red-600"
                              )}
                              onClick={toggleRecording}
                            >
                              {isRecording ? (
                                <MicOff className="h-4 w-4" />
                              ) : (
                                <Mic className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </Button>
                          )}
                        </div>
                        <Button
                          size="sm"
                          // onClick={handleSendMessage}
                          type='submit'
                          className="h-7 w-7 rounded-full p-0"
                          disabled={!currentMessage.content.trim() && selectedImages.length === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>}
              </div>
            </div>
          </Card>
        </div>
      </TransitionWrapper>

      {/* Love Reactions Dialog */}

      <CustomDialog title={"Reactions"} open={showLoveReactions !== null} onClose={() => setShowLoveReactions(null)}>
        <div className="max-h-96 overflow-y-auto">
          {showLoveReactions && likedByData?.data?.data?.map((reaction) => (
            <div key={reaction?._id} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reaction?.user?.image?.url || ""} />
                <AvatarFallback className="text-xs">
                  {reaction?.user?.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{reaction?.user?.fullName}</p>
                <p className="text-xs text-muted-foreground">@{reaction?.user?.username}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(reaction?.createdAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true
                })}
              </span>
            </div>
          ))}
        </div>
      </CustomDialog>



      <CustomDialog title={"Comments"} open={showComments !== null} className={"lg:min-w-[600px]"} onClose={() => {
        setShowComments(null);
        setReplyToComment(null);
        setReplyToReply(null);
        setCommentInput('');
        setActiveCommentId(null);
        setActiveReplyId(null);
      }}>
        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="max-h-[70vh] overflow-y-auto">
            {showComments && Array.isArray(commentsData?.data?.data) && commentsData?.data?.data?.map((comment) => (
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
                        <span className="text-sm font-semibold text-foreground">{comment?.user?.fullName || ""}</span>
                        {comment?.user._id === data?.data?.data?.author?._id && (
                          <Badge variant="secondary" className="text-xs">Host</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(comment?.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{comment?.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
            <Button size="sm" onClick={() => handleComment({ type: "message", content: commentInput.trim() })} disabled={!commentInput.trim()}>
              {commentPending ? "Commenting..." : replyToReply ? "Reply" : "Post Comment"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setReplyToComment(null); setReplyToReply(null); setCommentInput(''); }}>
              Cancel
            </Button>
          </div>
        </div>

      </CustomDialog>
    </>
  );
};

export default Conversation;



const MessageItem = ({ message, setActiveMessageId, arenaData, activeMessageId, handleLiked, setShowLoveReactions, setReplyToMessage, setShowComments }: any) => {

  const { ref, inView } = useInView({
    threshold: 0.5, // Trigger when 50% is visible
    triggerOnce: true, // Only fire once
  });

  /* api logic */
  const { mutate } = usePostData();
  useEffect(() => {
    if (inView && !message?.viewed && message?._id) {
      mutate({
        endpoint: endpoint["view"] + message?._id,
        data: { id: message?._id, type: "message" }
      }, {
        onSuccess: ({ data, status }) => {
          console.log({ data, status })
        }
      })
    }
  }, [inView]);
  return (<>
    <div ref={ref} className="mb-4 cursor-pointer" onClick={() => setActiveMessageId(() => message._id)}>
      <>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">{message.sender === arenaData?.author?._id ? arenaData?.author?.fullName : arenaData?.guest?.fullName}</span>
          <span className="text-xs text-muted-foreground">{message.createdAt && format(new Date(message.createdAt), 'MMM d, h:mm a')}</span>

        </div>
        <span className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed block mt-0.5">{message.content}
          {message.file && (
            <img
              src={message.file.url}
              alt={message.file.s3Key || 'Uploaded Image'}
              className="mt-2 max-w-[200px] max-h-[200px] object-contain rounded-lg shadow-md"
            />
          )}
        </span>
      </>
      {activeMessageId == message._id && message._id && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <button
            className="flex items-center gap-1 hover:text-primary transition-colors"
            onClick={e => {
              e.stopPropagation();
              handleLiked({ postId: message._id, type: "message" });
            }}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                message.liked ? "text-red-500 fill-red-500" : "text-muted-foreground/50 hover:text-primary"
              )}
            />
            <span onClick={e => {
              e.stopPropagation();
              if (message?.like > 0) {
                setShowLoveReactions(message?._id);
              }
            }}>{message?.like}</span>
          </button>
          <button
            className="flex items-center gap-1 hover:text-primary transition-colors"
            onClick={e => {
              e.stopPropagation();
              setShowComments(message._id);
            }}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{message?.comments}</span>
          </button>
          <div className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            <span>{message?.view || 0}</span>
          </div>
          <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={e => { e.stopPropagation(); setReplyToMessage(message); }}>
            <CornerUpLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      )}


    </div>
  </>)
}
const DotBlink = () => {
  return (<>
    <div className="relative w-3 h-3 my-auto ms-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-black opacity-75 animate-ping"></span>
      <span className="absolute inline-flex rounded-full h-3 w-3 bg-black"></span>
    </div>
  </>)
}
