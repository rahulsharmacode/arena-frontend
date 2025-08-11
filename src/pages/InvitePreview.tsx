import { TikTokIcon, XIcon } from '@/assets/icon/index.icon';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ExtendedUser, useAuth } from '@/context/AuthContext';
import { endpoint } from '@/services/api.services';
import { METHODS } from '@/services/interface.services';
import { isNullCheck } from '@/utils/helper/index.helper';
import { ArenaEvent, EventAreanData, IndividualQuery } from '@/utils/interface/index.interface';
import { useListData, usePostData } from '@/utils/query/index.query';
import { useUser } from '@/utils/state/index.state';
import { Check, ChevronDown, Edit, Facebook, Instagram, Linkedin, Plus, User, X, Youtube } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';


const InvitePreview: React.FC = () => {
  const { findUserByUsername } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams();
  const [searchParams] = useSearchParams();
  const recipientName = searchParams.get('name');
  const topics = searchParams.get('topics')?.split(',') || [];
  const [verificationPlatforms, setVerificationPlatforms] = useState<string[]>([]);
  const [profileUserData, setProfileUserData] = useState<ExtendedUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [eventType, setEventType] = useState<string>('');
  const [eventParameter, setEventParameter] = useState<string>('');
  const [eventTimePeriod, setEventTimePeriod] = useState<string>('');

  // Negotiation modal state
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [negotiationTopics, setNegotiationTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [negotiationEventParameter, setNegotiationEventParameter] = useState('');
  const [negotiationTimePeriod, setNegotiationTimePeriod] = useState('');
  const [negotiationPaymentAmount, setNegotiationPaymentAmount] = useState('');
  const [negotiationMessage, setNegotiationMessage] = useState('');

  // Word count editing state
  const [editingWordCount, setEditingWordCount] = useState(false);
  const [editingWordText, setEditingWordText] = useState('');

  // Days editing state
  const [editingDays, setEditingDays] = useState(false);
  const [editingDaysText, setEditingDaysText] = useState('');

  // Payment editing state
  const [editingPayment, setEditingPayment] = useState(false);
  const [editingPaymentText, setEditingPaymentText] = useState('');

  // Dropdown expansion state
  const [topicsExpanded, setTopicsExpanded] = useState(false);
  const [eventExpanded, setEventExpanded] = useState(false);
  const [offerExpanded, setOfferExpanded] = useState(false);
  const [messageExpanded, setMessageExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      if (!username) {
        setLoadingUser(false);
        return;
      }
      const user = await findUserByUsername(username);
      setProfileUserData(user);
      setLoadingUser(false);
    })();
  }, [username]);

  // Define platforms with their icons
  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
    { id: 'twitter', name: 'X', icon: XIcon },
    { id: 'facebook', name: 'Facebook', icon: Facebook },
    { id: 'instagram', name: 'Instagram', icon: Instagram },
    { id: 'youtube', name: 'YouTube', icon: Youtube },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon }
  ];

  // Parse URL parameters
  // useEffect(() => {
  //   const verifyParam = searchParams.get('verify');
  //   const paymentParam = searchParams.get('payment');
  //   const eventParam = searchParams.get('event');

  //   if (verifyParam) {
  //     setVerificationPlatforms(verifyParam.split(','));
  //   }

  //   if (paymentParam) {
  //     try {
  //       const paymentData = JSON.parse(decodeURIComponent(paymentParam));
  //       setPaymentAmount(paymentData.amount || '0');
  //       setNegotiationPaymentAmount(paymentData.amount || '0');
  //     } catch (e) {
  //       setPaymentAmount('0');
  //       setNegotiationPaymentAmount('0');
  //     }
  //   }

  //   if (eventParam) {
  //     try {
  //       const eventData = JSON.parse(decodeURIComponent(eventParam));
  //       setEventType(eventData.type || '');
  //       setEventParameter(eventData.parameter || '');
  //       setEventTimePeriod(eventData.timePeriod || '');
        
  //       // Set negotiation defaults
  //       setNegotiationEventParameter(eventData.parameter || '');
  //       setNegotiationTimePeriod(eventData.timePeriod || '');
  //     } catch (e) {
  //       setEventType('');
  //       setEventParameter('');
  //       setEventTimePeriod('');
  //     }
  //   }

  //   // Set negotiation topics
  //   setNegotiationTopics(topics);
  //   console.log('Negotiation topics initialized:', topics);
  // }, [searchParams, topics]);

  const getEventDisplayText = (data:any) => {
    const  {eventType,eventParameter} = data||{};
    let eventText = '';
    
    if (eventType === 'length') {
      if (eventParameter === 'custom') {
        eventText = 'Custom word count discussion';
      } else {
        eventText = `${eventParameter} word discussion`;
      }
      
      // Add time period if available
      if (eventTimePeriod) {
        if (eventTimePeriod === '1') {
          eventText += ' over 1 day';
        } else if (eventTimePeriod === '3') {
          eventText += ' over 3 days';
        } else if (eventTimePeriod === '7') {
          eventText += ' over 7 days';
        } else if (eventTimePeriod === 'custom') {
          eventText += ' over custom period';
        }
      }
    } else if (eventType === 'time') {
      if (eventParameter === 'custom') {
        eventText = 'Custom duration discussion';
      } else {
        eventText = `${eventParameter} minute discussion`;
      }
    }
    
    return eventText || 'Free flow';
  };

  const handleAccept = () => {
    // Create the registration URL with query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const name = searchParams.get('name');
    const topicsParam = searchParams.get('topics');
    const verifyParam = searchParams.get('verify');
    
    const registrationURL = new URL('/register', window.location.origin);
    if (name) registrationURL.searchParams.set('name', name);
    if (topicsParam) registrationURL.searchParams.set('topics', topicsParam);
    if (verifyParam) registrationURL.searchParams.set('verify', verifyParam);
    registrationURL.searchParams.set('invitedBy', username || '');
    registrationURL.searchParams.set('isInvitation', 'true');
    
    // Open registration page in new tab
    window.open(registrationURL.toString(), '_blank');
  };

  const handleDecline = () => {
    toast.info('Invitation declined');
    navigate('/');
  };

  const handleModifyTopics = () => {
    console.log('handleModifyTopics called', { topics, negotiationTopics });
    setShowNegotiation(true);
  };

  // Negotiation functions
  const handleAddTopic = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('handleAddTopic called', { newTopic, negotiationTopics });
    if (newTopic.trim() && !negotiationTopics.includes(newTopic.trim())) {
      setNegotiationTopics([...negotiationTopics, newTopic.trim()]);
      setNewTopic('');
      console.log('Topic added successfully');
    } else {
      console.log('Topic not added - already exists or empty');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTopic();
    }
  };

  const handleSubmitNegotiation = () => {
    if (negotiationTopics.length === 0) {
      toast.error('Please add at least one topic');
      return;
    }
    
    toast.success('Counter-proposal submitted successfully!');
    setShowNegotiation(false);
  };

  const handleCancelNegotiation = () => {
    setShowNegotiation(false);
    // Reset to original values
    setNegotiationTopics(topics);
    setNegotiationEventParameter(eventParameter);
    setNegotiationTimePeriod(eventTimePeriod);
    setNegotiationPaymentAmount(paymentAmount);
    setNegotiationMessage('');
  };



  /* api calls */
  interface InviteParams { 
    id?:string
  }
const { id } = useParams() as InviteParams;
  const {data,isPending} = useListData<IndividualQuery<EventAreanData>>({
    endpoint : endpoint["arena"],
    enabled: !!id,
    key:id as any,
    id:id,
    window:true
  });



  const {mutate,isPending:eventActionPending} = usePostData();
  const [choosedMode,setChoosedMode] = useState<null|string>(null)

  const {user} = useUser();
  const handleEvent = ({status}:{status:"open"|"decline"|"close"}) => {
    setChoosedMode(status);
    if(!user) return navigate(`/login?next=${id}`);
    mutate({
      endpoint : endpoint["arena-guest-accept"],
      method:METHODS.PATCH,
      data : {
        id,
        eventStatus:status
      }

    },
  {
    onSuccess:({data,status}) =>{
       if([200].includes(status) && data?.data?.eventStatus==="open") {
        toast.error("Updated Succesfully");
        return navigate(`/text/${id}`);}
         if([200].includes(status) && ["decline","close"]?.includes(data?.data?.eventStatus)) {
        toast.error(`Invitation ${data?.data?.eventStatus} succesfully`);
        return navigate(`/home`);}
       
       else{
        toast.error("Cannot update");
       }
    },
    onError : (data) =>{
      toast.error(data?.message);
    }
  })
  }

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!data?.data?.data|| ["open","closed","decline"].includes(data?.data?.data?.eventStatus)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />


        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-3xl mx-auto px-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-medium mb-2">Profile Not Found</h2>
                  <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist or has been removed.</p>
                  <Button onClick={() => window.location.href = "/"}>Go Home</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="border-primary/20 shadow-2xl relative">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xl font-medium text-foreground">Hi {isNullCheck(data?.data?.data?.guestName) as string},</h2>
                  <p className="text-sm text-muted-foreground">You have been invited to text in public with:</p>
                </div>

                {/* Profile Card */}
                <div className="bg-background border border-border rounded-lg p-6 shadow-sm mb-4 transition-all duration-200 hover:shadow-md hover:border-primary/40 cursor-pointer flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage 
                          src={isNullCheck(data?.data?.data?.author?.image?.url) as string  || undefined} 
                          alt={isNullCheck(data?.data?.data?.author?.fullName) as string}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {isNullCheck(data?.data?.data?.author?.fullName) as string ? (isNullCheck(data?.data?.data?.author?.fullName) as string).charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col gap-0.5 items-center sm:items-start">
                        <span className="text-xl font-medium text-card-foreground">{isNullCheck(data?.data?.data?.author?.fullName) as string}</span>
                        <span className="text-sm text-muted-foreground">@{isNullCheck(data?.data?.data?.author?.username) as string}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {isNullCheck(data?.data?.data?.author?.bio) as string || 'Tell us about yourself...'}
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
                        {data?.data?.data?.author?.isLinkedinVerified && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                      {/* X (Twitter) */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <XIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {data?.data?.data?.author?.isXVerified && (
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
                        {data?.data?.data?.author?.isFacebookVerified && (
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
                        {data?.data?.data?.author?.isInstagramVerified && (
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
                        {data?.data?.data?.author?.isYoutubeVerified && (
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
                        {data?.data?.data?.author?.isTiktokVerified && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </div>

                {/* Topics Section */}
                <div className="space-y-3 mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Topics</h3>
                  <div className="space-y-0.5">
                    {data?.data?.data?.topics.map((topic, index) => (
                      <div key={index} className="flex items-center gap-2 py-1 border-b border-border/30 last:border-b-0">
                        <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full flex-shrink-0"></div>
                        <span className="text-sm text-foreground leading-relaxed">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Event Details Section */}
                <div className="space-y-3 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event Details</h3>
                  <div className="flex items-center gap-2 py-1">
                    <span className="text-sm text-foreground leading-relaxed">{getEventDisplayText({
                      eventType:data?.data?.data?.eventType,
                      eventParameter:data?.data?.data?.wordsLength,
                    })}</span>
                  </div>
                </div>


              {/* Event Status Section */}
                { data?.data?.data?.author===user?._id && <div className="space-y-3 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event Status</h3>
                  <div className="flex flex-col gap-1 py-1">
                    <Badge variant={"secondary"} className="text-sm capitalize text-foreground leading-relaxed w-fit">{data?.data?.data?.eventStatus}</Badge>
                  </div>
                </div>}

                {/* Payment Section */}
                <div className="space-y-3 mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Offer Amount</h3>
                  <div className="flex flex-col gap-1 py-1">
                    <span className="text-sm text-foreground leading-relaxed">${paymentAmount || '0'}</span>
                    <span className="text-xs text-muted-foreground">Subject to 5% platform fee. Amount will be held by Arena immediately after acceptance and will be deposited after successful event completion.</span>
                  </div>
                </div>

                {/* Verification requested */}
               
                  <div className="space-y-3 mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Verification Requested</h3>
                    <div className="flex items-center gap-2 py-1">
                         <div>
                    <h3 className="text-xs font-medium text-muted-foreground tracking-wide mb-1">Verified Accounts</h3>
                    <div className="flex flex-row gap-3 justify-center sm:justify-start">
                      {/* LinkedIn */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {data?.data?.data?.isLinkedinVerified && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                      {/* X (Twitter) */}
                      <div className="relative flex items-center justify-center">
                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center border border-border">
                          <XIcon className="h-4 w-4 text-muted-foreground" />
                        </span>
                        {data?.data?.data?.isXVerified && (
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
                        {data?.data?.data?.isFacebookVerified && (
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
                        {data?.data?.data?.isInstagramVerified && (
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
                        {data?.data?.data?.isYoutubeVerified && (
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
                        {data?.data?.data?.isTiktokVerified && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 bg-card rounded-full flex items-center justify-center border border-border shadow">
                            <Check className="h-2 w-2 text-primary" />
                          </span>
                        )}
                      </div>
                      
                    </div>
                  </div>
                    </div>
                  </div>
                

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                { user?._id!==data?.data?.data?.author?._id ? <>
                  <Button 
                    onClick={()=>handleEvent({status:"open"})}
                    variant="outline"
                    size="sm"
                    disabled={eventActionPending}
                    className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    { choosedMode==="open" && eventActionPending ? "Accepting..." : "Accept"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                    className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    onClick={handleModifyTopics}
                  >
                    Modify
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={eventActionPending}
                    className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                    onClick={()=>handleEvent({status:"decline"})}
                  >
                    { choosedMode==="decline" && eventActionPending ? "Declining..." : "Decline"}
                  </Button>
                </>
              :  
              <Button 
                    onClick={()=>handleEvent({status:"close"})}
                    variant="destructive"
                    size="sm"
                    className="w-28 h-9 text-sm font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                  >
                    Close
                  </Button>
              }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TransitionWrapper>

      {/* Negotiation Modal */}
      {showNegotiation && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-primary/20">
            <CardHeader className="pb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Modify the terms to better suit your preferences</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelNegotiation}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Topics Section */}
              <div className="space-y-2">
                <button
                  onClick={() => setTopicsExpanded(!topicsExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Topics</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                        {negotiationTopics.length} selected
                      </span>
                      {negotiationTopics.length > 0 && (
                        <span className="text-xs text-muted-foreground max-w-48 truncate">
                          {negotiationTopics[0]}{negotiationTopics.length > 1 ? ` +${negotiationTopics.length - 1} more` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${topicsExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {topicsExpanded && (
                  <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/30 animate-in slide-in-from-top-2 duration-200">
                {/* Current Topics List */}
                <div className="space-y-2">
                  {negotiationTopics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/30 transition-colors group">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                      <span className="text-sm text-foreground flex-1">{topic}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNewTopic(topic);
                            setNegotiationTopics(negotiationTopics.filter((_, i) => i !== index));
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNegotiationTopics(negotiationTopics.filter((_, i) => i !== index));
                          }}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Topic */}
                <div className="flex gap-3">
                  <Input
                        placeholder="Add a new topic..."
                    value={newTopic}
                    onChange={(e) => {
                      console.log('Input changed:', e.target.value);
                      setNewTopic(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={(e) => handleAddTopic(e)}
                    disabled={!newTopic.trim()}
                    className="shrink-0 px-4"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                    {/* Update Topics Button */}
                    <div className="flex justify-end pt-2 border-t border-border/30">
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.success('Topics updated successfully!');
                          setTopicsExpanded(false);
                        }}
                        className="px-4"
                      >
                        Update Topics
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Section */}
              <div className="space-y-2">
                <button
                  onClick={() => setEventExpanded(!eventExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-blue-600/40 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Event</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                        {eventParameter || '500'} words over {eventTimePeriod || '1'} day{(eventTimePeriod || '1') !== '1' ? 's' : ''}
                  </span>
                      {(negotiationEventParameter !== eventParameter || negotiationTimePeriod !== eventTimePeriod) && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md font-medium">
                          New: {negotiationEventParameter || '500'} words over {negotiationTimePeriod || '1'} day{(negotiationTimePeriod || '1') !== '1' ? 's' : ''}
                        </span>
                      )}
                </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${eventExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {eventExpanded && (
                  <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/30 animate-in slide-in-from-top-2 duration-200">
                    {/* Comparison Header - Only show if there are changes */}
                    {(negotiationEventParameter !== eventParameter || negotiationTimePeriod !== eventTimePeriod) && (
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <span className="text-xs text-muted-foreground font-medium">Original</span>
                            <div className="text-sm font-medium text-foreground">
                              {eventParameter || '500'} words over {eventTimePeriod || '1'} day{(eventTimePeriod || '1') !== '1' ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-muted-foreground">→</div>
                          <div className="text-center">
                            <span className="text-xs text-blue-600 font-medium">Proposed</span>
                            <div className="text-sm font-medium text-blue-700">
                              {negotiationEventParameter || '500'} words over {negotiationTimePeriod || '1'} day{(negotiationTimePeriod || '1') !== '1' ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                
                {/* Word Count Options */}
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {['500', '1000', '2000'].map((words) => (
                      <Button
                        key={words}
                        variant={negotiationEventParameter === words ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNegotiationEventParameter(words)}
                            className={`text-sm h-9 font-normal transition-all duration-200 ${
                          negotiationEventParameter === words 
                                ? 'border-blue-600 bg-blue-600/5 text-blue-700 hover:border-blue-600/60 hover:bg-blue-600/10' 
                                : 'border-border hover:border-blue-600/40 hover:bg-blue-600/5 text-foreground'
                        }`}
                      >
                        {words} words
                      </Button>
                    ))}
                    <div className="relative">
                      {editingWordCount ? (
                        <div className="flex items-center gap-1 h-9 px-3 bg-muted/30 border border-border/50 rounded-md">
                          <Input
                            value={editingWordText}
                            onChange={(e) => setEditingWordText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                setNegotiationEventParameter(editingWordText);
                                setEditingWordCount(false);
                                setEditingWordText('');
                              } else if (e.key === 'Escape') {
                                setEditingWordCount(false);
                                setEditingWordText('');
                              }
                            }}
                            className="flex-1 h-7 text-sm bg-transparent border-0 p-0 focus:ring-0"
                            placeholder="Custom"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNegotiationEventParameter(editingWordText);
                              setEditingWordCount(false);
                              setEditingWordText('');
                            }}
                                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingWordCount(true);
                            setEditingWordText(negotiationEventParameter && !['500', '1000', '2000'].includes(negotiationEventParameter) ? negotiationEventParameter : '');
                          }}
                              className={`text-sm h-9 font-normal transition-all duration-200 w-full ${
                            negotiationEventParameter && !['500', '1000', '2000'].includes(negotiationEventParameter)
                                  ? 'border-blue-600 bg-blue-600/5 text-blue-700 hover:border-blue-600/60 hover:bg-blue-600/10' 
                                  : 'border-border hover:border-blue-600/40 hover:bg-blue-600/5 text-foreground'
                          }`}
                        >
                          {negotiationEventParameter && !['500', '1000', '2000'].includes(negotiationEventParameter) 
                            ? `${negotiationEventParameter} words` 
                            : 'Custom'
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Days Options */}
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    {['3', '5', '7'].map((days) => (
                      <Button
                        key={days}
                        variant={negotiationTimePeriod === days ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNegotiationTimePeriod(days)}
                            className={`text-sm h-9 font-normal transition-all duration-200 ${
                          negotiationTimePeriod === days 
                                ? 'border-blue-600 bg-blue-600/5 text-blue-700 hover:border-blue-600/60 hover:bg-blue-600/10' 
                                : 'border-border hover:border-blue-600/40 hover:bg-blue-600/5 text-foreground'
                        }`}
                      >
                        {days} days
                      </Button>
                    ))}
                    <div className="relative">
                      {editingDays ? (
                        <div className="flex items-center gap-1 h-9 px-3 bg-muted/30 border border-border/50 rounded-md">
                          <Input
                            value={editingDaysText}
                            onChange={(e) => setEditingDaysText(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                setNegotiationTimePeriod(editingDaysText);
                                setEditingDays(false);
                                setEditingDaysText('');
                              } else if (e.key === 'Escape') {
                                setEditingDays(false);
                                setEditingDaysText('');
                              }
                            }}
                            className="flex-1 h-7 text-sm bg-transparent border-0 p-0 focus:ring-0"
                            placeholder="Custom"
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNegotiationTimePeriod(editingDaysText);
                              setEditingDays(false);
                              setEditingDaysText('');
                            }}
                                className="h-6 w-6 p-0 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDays(true);
                            setEditingDaysText(negotiationTimePeriod && !['3', '5', '7'].includes(negotiationTimePeriod) ? negotiationTimePeriod : '');
                          }}
                              className={`text-sm h-9 font-normal transition-all duration-200 w-full ${
                            negotiationTimePeriod && !['3', '5', '7'].includes(negotiationTimePeriod)
                                  ? 'border-blue-600 bg-blue-600/5 text-blue-700 hover:border-blue-600/60 hover:bg-blue-600/10' 
                                  : 'border-border hover:border-blue-600/40 hover:bg-blue-600/5 text-foreground'
                          }`}
                        >
                          {negotiationTimePeriod && !['3', '5', '7'].includes(negotiationTimePeriod) 
                            ? `${negotiationTimePeriod} days` 
                            : 'Custom'
                          }
                        </Button>
                      )}
                    </div>
                  </div>

                      {/* Update Event Button */}
                      <div className="flex justify-end pt-2 border-t border-border/30">
                        <Button
                          size="sm"
                          onClick={() => {
                            toast.success('Event settings updated successfully!');
                            setEventExpanded(false);
                          }}
                          className="px-4"
                        >
                          Update Event
                        </Button>
                </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Offer Section */}
              <div className="space-y-2">
                <button
                  onClick={() => setOfferExpanded(!offerExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-green-600/40 transition-all duration-200 group"
                >
                <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Offer</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                        ${paymentAmount || '0'}
                  </span>
                      {negotiationPaymentAmount !== paymentAmount && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded-md font-medium">
                          New: ${negotiationPaymentAmount || paymentAmount || '0'}
                        </span>
                      )}
                </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${offerExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {offerExpanded && (
                  <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/30 animate-in slide-in-from-top-2 duration-200">
                    {/* Comparison Header - Only show if there are changes */}
                    {negotiationPaymentAmount !== paymentAmount && (
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <span className="text-xs text-muted-foreground font-medium">Original</span>
                            <div className="text-sm font-medium text-foreground">
                              ${paymentAmount || '0'}
                            </div>
                          </div>
                          <div className="text-muted-foreground">→</div>
                          <div className="text-center">
                            <span className="text-xs text-green-600 font-medium">Proposed</span>
                            <div className="text-sm font-medium text-green-700">
                              ${negotiationPaymentAmount || paymentAmount || '0'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                <div className="grid grid-cols-4 gap-2">
                  {['50', '100', '200'].map((amount) => (
                    <Button
                      key={amount}
                      variant={negotiationPaymentAmount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNegotiationPaymentAmount(amount)}
                          className={`text-sm h-9 font-normal transition-all duration-200 ${
                        negotiationPaymentAmount === amount 
                              ? 'border-green-600 bg-green-600/5 text-green-700 hover:border-green-600/60 hover:bg-green-600/10' 
                              : 'border-border hover:border-green-600/40 hover:bg-green-600/5 text-foreground'
                      }`}
                    >
                      ${amount}
                    </Button>
                  ))}
                  <div className="relative">
                    {editingPayment ? (
                      <div className="flex items-center gap-1 h-9 px-3 bg-muted/30 border border-border/50 rounded-md">
                        <Input
                          value={editingPaymentText}
                          onChange={(e) => setEditingPaymentText(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              setNegotiationPaymentAmount(editingPaymentText);
                              setEditingPayment(false);
                              setEditingPaymentText('');
                            } else if (e.key === 'Escape') {
                              setEditingPayment(false);
                              setEditingPaymentText('');
                            }
                          }}
                          className="flex-1 h-7 text-sm bg-transparent border-0 p-0 focus:ring-0"
                          placeholder="Custom"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNegotiationPaymentAmount(editingPaymentText);
                            setEditingPayment(false);
                            setEditingPaymentText('');
                          }}
                              className="h-6 w-6 p-0 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPayment(true);
                          setEditingPaymentText(negotiationPaymentAmount && !['50', '100', '200'].includes(negotiationPaymentAmount) ? negotiationPaymentAmount : '');
                        }}
                            className={`text-sm h-9 font-normal transition-all duration-200 w-full ${
                          negotiationPaymentAmount && !['50', '100', '200'].includes(negotiationPaymentAmount)
                                ? 'border-green-600 bg-green-600/5 text-green-700 hover:border-green-600/60 hover:bg-green-600/10' 
                                : 'border-border hover:border-green-600/40 hover:bg-green-600/5 text-foreground'
                        }`}
                      >
                        {negotiationPaymentAmount && !['50', '100', '200'].includes(negotiationPaymentAmount) 
                          ? `$${negotiationPaymentAmount}` 
                          : 'Custom'
                        }
                      </Button>
                    )}
                  </div>

                      {/* Update Offer Button */}
                      <div className="flex justify-end pt-2 border-t border-border/30">
                        <Button
                          size="sm"
                          onClick={() => {
                            toast.success('Offer amount updated successfully!');
                            setOfferExpanded(false);
                          }}
                          className="px-4"
                        >
                          Update Offer
                        </Button>
                </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Section */}
              <div className="space-y-2">
                <button
                  onClick={() => setMessageExpanded(!messageExpanded)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 hover:border-primary/40 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Message to {profileUserData?.name}</h3>
                    {negotiationMessage && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                        Message added
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${messageExpanded ? 'rotate-180' : ''}`} />
                </button>
                
                {messageExpanded && (
                  <div className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/30 animate-in slide-in-from-top-2 duration-200">
                <Textarea
                  placeholder="Optional message explaining your changes..."
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  className="min-h-[100px] resize-none"
                />

                    {/* Update Message Button */}
                    <div className="flex justify-end pt-2 border-t border-border/30">
                      <Button
                        size="sm"
                        onClick={() => {
                          toast.success('Message updated successfully!');
                          setMessageExpanded(false);
                        }}
                        className="px-4"
                      >
                        Update Message
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleCancelNegotiation}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitNegotiation}
                  disabled={negotiationTopics.length === 0}
                  className="px-6"
                >
                  Submit Proposal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InvitePreview;