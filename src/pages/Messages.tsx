import EmptyData from '@/components/empty';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { endpoint } from '@/services/api.services';
import { EventAreanData, ImageInfo, QueryData, UserData } from '@/utils/interface/index.interface';
import { useListData } from '@/utils/query/index.query';
import { useUser } from '@/utils/state/index.state';
import { formatDistanceToNow } from 'date-fns';
import {
  Eye,
  Share2
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const Messages: React.FC = () => {
  const [searchParams,setSearchParams] = useSearchParams();
  const tabs = [
    { id: 1, name: "open" },
    { id: 2, name: "closed" },
    { id: 3, name: "pending" },
  ];
  const [selectedTab, setSelectedTab] = useState<string>("open");

  const { data, isPending } = useListData<QueryData<EventAreanData>>({
    endpoint: endpoint["arena"],
    enabled: true,
    params: { eventStatus: selectedTab },
    key: `arena-${selectedTab}`
  });


  useEffect(()=>{
    if(searchParams.get("tab")){
      // let findTab = tabs.find((item) => item.name===searchParams.get("tab"))
          setSelectedTab(searchParams.get("tab")||"open");
    }
  },[searchParams]);
  const handleTab = (e:string)=>{
    searchParams.set("tab",e);
          setSearchParams(searchParams);
    setSelectedTab(e)
  }


  return (
    <>

      <Navbar />

      <TransitionWrapper animation="fade" className="min-h-screen bg-background pt-24 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            <CardContent className="p-4">
              <Tabs value={selectedTab} onValueChange={(e) => handleTab(e)} className="w-full">
                <TabsList className="grid w-[230px] grid-cols-3 mb-6 bg-muted/30 dark:bg-muted/20 border border-muted/40">
                  {
                    tabs?.map((item, i: number) => {
                      return (<>
                        <TabsTrigger key={i} value={item.name} className="data-[state=active]:bg-muted/50 dark:data-[state=active]:bg-muted/30 data-[state=active]:text-foreground/90 dark:data-[state=active]:text-white/90 capitalize">{item.name}</TabsTrigger>
                      </>)
                    })
                  }

                </TabsList>


                {
                  tabs?.map((item, i: number) => {
                    return (<>
                      <TabsContent value={item.name} className="space-y-4">
                        <div className="space-y-4">

                          { isPending ? Array.from({ length: 5 }).map((_, i: number) => <Skeleton key={i} className='h-[76.8px] w-full my-2 bg-slate-200' />) :
                              data?.data?.data?.length === 0 ? <EmptyData title={<div className="text-sm text-muted-foreground text-center py-8">
                                No {item.name} conversations yet
                              </div>} />  :
                                Array.isArray(data?.data?.data) && data?.data?.data?.map((item,i:number) => {
                                  return (<MessageList data={item} key={i} />)
                                })

                          }
                        </div>
                      </TabsContent>
                    </>)
                  })
                }


              </Tabs>
            </CardContent>
          </Card>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default Messages;


interface ListProps {
  data: EventAreanData
}

const MessageList: React.FC<ListProps> = ({ data }) => {
  
  const {user} = useUser();
  const getProfile = (data:EventAreanData):{
    fullName:string,
    username:string,
    image:ImageInfo
  } => {
    if(data?.author._id !== user?._id) return data?.author;
    else return data?.guest;
  };


  const handleShare = (id:string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${data?.guest?.username  ?  "conversation":"invite"}/${id}`);
    toast.success("Copied to clipboard")
  };


  const getRedirection = useMemo(() => {
    if(data.eventStatus==="pending") return `/invite/${data._id}`;
    if(data.eventStatus==="open") return `/text/${data._id}`;
    if(data.eventStatus==="close") return `/conversation/${data._id}`;
  }, [])
  return (<>
 
    <div className="block hover:bg-muted/40 transition-colors p-3 cursor-pointer hover:bg-slate-200 border-b">
      <div className="flex items-center">
        <NavLink  to={`/profile/${data?.author?.username === user?.username ? data?.guest?.username : data?.author?.username}`} >
          <div className="flex items-center gap-3 w-48 min-w-[12rem]">
          <Avatar className="h-10 w-10 shadow-sm border border-background">
            <AvatarImage src={getProfile(data)?.image?.url || "/images/nouser.png"} />
            <AvatarFallback className="text-sm font-medium">{getProfile(data)?.fullName||data?.guestName}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-base font-medium font-sans tracking-tight text-foreground whitespace-nowrap">{getProfile(data)?.fullName || data?.guestName}</h3>
            <p className="text-sm text-muted-foreground font-sans mt-0.5"> {getProfile(data)?.username && `@${getProfile(data)?.username}`}</p>
          </div>
        </div>
        </NavLink>
          <NavLink to={getRedirection as string} className={'w-full'}>
        <div className="flex justify-between items-center flex-1 w-full">
            <div className="flex flex-col mt-1 text-xs text-muted-foreground">
              <div className="text-sm text-muted-foreground w-full block h-6 leading-6">
           Topic - {data.topics[data.mainTopicIndex]}
          </div>
          <div className="flex items-center mt-1 gap-3">
              <span>{formatDistanceToNow(data.createdAt, { addSuffix: true })}</span>
              {data.eventStatus !== "pending" && <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{data?.view||0}</span>}
            </div>
            </div>
         
          <div className="">
            <Button onClick={(e)=>{  e.preventDefault();
    e.stopPropagation();handleShare(data?._id)}} variant="ghost" size="icon" className="h-7 w-7 p-0"><Share2 className="h-4 w-4" /></Button>
          </div>
        </div>
         </NavLink>
      </div>
    </div>
  </>)
}