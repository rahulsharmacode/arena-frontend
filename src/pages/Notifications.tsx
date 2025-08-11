import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner.';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInfiniteScroller } from '@/hooks/index.hook';
import { cn } from '@/lib/utils';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { NotificationData, QueryData } from '@/utils/interface/index.interface';
import { useListData, usePostData } from '@/utils/query/index.query';
import { useNotification } from '@/utils/state/index.state';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, MessageSquare, ThumbsUp, User } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { NavLink } from 'react-router-dom';
import { toast } from 'sonner';

const Notifications: React.FC = () => {
  const [tab,setTab] = useState<"all"|"unread"|"message">("all");
  const queryClient  = useQueryClient();



/* api calls */
// const {data,isPending} = useListData<QueryData<NotificationData>>({
//   endpoint : endpoint["notification"],
//   key:"notificationlist",
//   params : {isRead : ["all","messages"].includes(tab) ? null : false,
//     type : ["all","unread"].includes(tab) ? null : "messages"

//    },
//   window:true
// });




  const {
    data:notificationData,
    hasNextPage,
    isFetchingNextPage,
    status,
    fetchNextPage,
    refetch,
  } = useInfiniteScroller({
    endpoint: endpoint["notification"],
    enabled: true,
    filter:{isRead : ["all","messages"].includes(tab) ? "" : false,
    type : ["all","unread"].includes(tab) ? "" : "messages"
   },
    // key: `notification-scroller-async`,
  });
  const { ref, inView } = useInView();
  let allScrolledData = useMemo(() => {
    return notificationData?.pages.flatMap((page: any) => page.data) || [];
  }, [notificationData]);
  console.log("🚀 ~ Notifications ~ allScrolledData:", allScrolledData,notificationData)
 
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);




const {mutate,isPending:markPending} = usePostData();
const { notifications,setNotifications} = useNotification();
const handleRead =  ({type="all",id=null}) => {
  mutate({
    endpoint: type==="all"? endpoint["notification-read-all"] : endpoint["notification"]+id,
    data:{isRead:true},
    method: id ? METHODS.PATCH : METHODS.POST
  },{
    onSuccess: ({status})=> {
      if([200].includes(status)){
        setNotifications((prev) => ({...prev,unReadData:0}));
        queryClient.invalidateQueries({queryKey:["notification-read-all"]});
        toast.success(`Notification Read ${type==="all" ? "All" :""}`);
      }
    }
  });
}

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Notifications</h1>
            {  Array.isArray((allScrolledData)) && (allScrolledData as any)?.length> 0 && notifications?.unReadData>0 && (
              <Button disabled={markPending} variant="outline" size="sm" onClick={()=>{handleRead({type:"all"})}}>
                {markPending ? "Marking..." : "Mark all as read"}
              </Button>
            )}
          </div>
          
          <Tabs value={tab} onValueChange={(e:any)=>setTab(e)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    <NotificationItems isPending={status==="pending" as string} data={(allScrolledData)??[]} action={handleRead} />
                                  
                    
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="unread">
              <Card>
                <CardContent className="p-0">
                  <NotificationItems isPending={status==="pending" as string} data={(allScrolledData)??[]} action={handleRead} />
                                
                  
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="messages">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                  <NotificationItems isPending={status==="pending" as string} data={(allScrolledData)??[]} type ={ 'message'} action={handleRead} />
                                
                  
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          <div className={cn(["flex justify-center items-center text-slate-400 text-[14px]", hasNextPage ? "" : "mt-[20px]" ])}>
           { hasNextPage ?  <button ref={ref}><Spinner /></button> : allScrolledData.length>0 && "No more notifications"}
          </div>
          </Tabs>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Notifications;


const NotificationItems:React.FC<{data:NotificationData[],isPending:boolean,type?:"common"|"message",action:(e:any) => void}> = ({data=[],isPending=false,type="common",action}) => {
    const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'reply':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'like':
        return <ThumbsUp className="h-4 w-4 text-purple-500" />;
      case 'invitation':
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return(<>

  
 {
 isPending ? Array.from({length:5}).map((_,i:number) =><Skeleton key={i} className='h-[76.8px] w-full mb-2' />) :
 Array.isArray((data)) && (data as any)?.length > 0 ? (
                      Array.isArray((data)) && (data)?.map((notification) => (
                        <NavLink
                          key={notification._id}
                          
                          to={ notification.event?.isNewDiscussion ? "#" : notification.event?.eventStatus==="pending" ?  `/invite/${notification.event._id}` : `/text/${notification.event._id}` || '#'}
                         
                          className={`block p-4 hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-muted/40' : ''}`}
                        >
                          <div className="flex items-start gap-3"  onClick={() => action({type:"single",id:notification._id})}>
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                <User className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium">{notification.title}</h3>
                                  <p className="text-sm text-muted-foreground">{notification.content}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getNotificationIcon(notification?.type)}
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(notification.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </NavLink>
                      ))
                    ) : (
                    type==="common" ?  <div className="p-6 text-center">
                       <Bell className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No notifications to display</p>
                      </div> : 
                      <div className="p-6 text-center">
                        <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No messages to display</p>
                      </div>
                    )}
  </>)
}
