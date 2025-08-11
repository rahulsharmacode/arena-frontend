import { TikTokIcon, XIcon } from '@/assets/icon/index.icon';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp, Clock, Copy, CreditCard, DollarSign, Facebook, FileText, Instagram, Linkedin, MessageSquare, Plus, Shield, X, Youtube } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import InvitePreview from './event/invitepreview';
import { AsyncSelect } from '@/components/asyncselect';
import { endpoint } from '@/services/api.services';
import { useListData, usePostData } from '@/utils/query/index.query';
import { Spinner } from '@/components/ui/spinner.';
import { METHODS } from '@/services/interface.services';
import { EventAreanData, IndividualQuery } from '@/utils/interface/index.interface';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User } from '@/utils/state/index.state';

const InviteUsers: React.FC = () => {
  const { currentUser } = useAuth();
  const [recipientName, setRecipientName] = useState<any>('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  // New state for payment and event features
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [eventType, setEventType] = useState(''); // Empty string - no default selection
  const [eventParameter, setEventParameter] = useState('');
  const [eventTimePeriod, setEventTimePeriod] = useState(''); // days for length-based
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  const [showEventSection, setShowEventSection] = useState(false);

  // Toggle state for incentivize mode
  const [incentivizeEnabled, setIncentivizeEnabled] = useState(true);

  // Custom value states
  const [customWordCount, setCustomWordCount] = useState('');
  const [customTimePeriod, setCustomTimePeriod] = useState('');
  const [customDuration, setCustomDuration] = useState('');

  // Custom input active states
  const [showCustomAmountInput, setShowCustomAmountInput] = useState(false);
  const [showCustomWordCountInput, setShowCustomWordCountInput] = useState(false);
  const [showCustomTimePeriodInput, setShowCustomTimePeriodInput] = useState(false);

  // Payment status states
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'authorized' | 'cancelled' | 'completed'>('pending');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Stripe-like payment states
  const [showCardForm, setShowCardForm] = useState(false);
  const [showPayPalOption, setShowPayPalOption] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Card validation states
  const [cardNumberValid, setCardNumberValid] = useState(false);
  const [cardExpiryValid, setCardExpiryValid] = useState(false);
  const [cardCVCValid, setCardCVCValid] = useState(false);
  const [cardholderNameValid, setCardholderNameValid] = useState(false);

  // New state for editing topics
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);
  const [editingTopicValue, setEditingTopicValue] = useState('');

  // Add state for main topic
  const [mainTopicIndex, setMainTopicIndex] = useState<number | null>(null);

  // Function to reset payment details
  const resetPaymentDetails = () => {
    setPaymentMethod('');
    setShowCardForm(false);
    setShowPayPalOption(false);
    setPaymentStatus('pending');
    setCardNumber('');
    setCardExpiry('');
    setCardCVC('');
    setCardholderName('');
    setCardNumberValid(false);
    setCardExpiryValid(false);
    setCardCVCValid(false);
    setCardholderNameValid(false);
  };

  // Event type helper functions
  const getEventDisplayText = () => {
    if (!eventType) return '';

    if (eventType === 'length') {
      if (!eventParameter) return '';
      const wordCount = eventParameter === 'custom' ? customWordCount : eventParameter;
      if (!wordCount) return eventParameter === 'custom' ? 'Custom words' : '';

      const timeText = getTimePeriodText();
      return timeText ? `${wordCount} words over ${timeText}` : `${wordCount} words`;
    } else if (eventType === 'time') {
      if (!eventParameter) return '';
      const duration = eventParameter === 'custom' ? customDuration : eventParameter;
      return duration ? `${duration} min` : 'Custom min';
    } else if (eventType === 'freeflow') {
      return 'Free flow conversation';
    }
    return '';
  };

  const getTimePeriodText = () => {
    if (eventTimePeriod === 'custom') {
      return customTimePeriod ? `${customTimePeriod} days` : '';
    }
    return eventTimePeriod ? `${eventTimePeriod} days` : '';
  };

  const shouldShowTimePeriod = () => {
    if (eventType !== 'length') return false;
    return (eventParameter && eventParameter !== 'custom') ||
      (eventParameter === 'custom' && customWordCount);
  };

  const resetEventValues = () => {
    setEventParameter('');
    setCustomWordCount('');
    setCustomTimePeriod('');
    setCustomDuration('');
  };


  const handleAddTopic = () => {
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics(prevTopics => {
        const newTopics = [...prevTopics, currentTopic.trim()];
        // If this is the first topic, set as main
        if (newTopics.length === 1) setMainTopicIndex(0);
        return newTopics;
      });
      setCurrentTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTopic();
    }
  };

  const generateInviteLink = () => {
    if (!currentUser?.username) {
      toast.error('User not found');
      return;
    }

    const baseUrl = window.location.origin;
    const encodedName = encodeURIComponent(recipientName);
    const encodedTopics = encodeURIComponent(topics.join(','));
    const encodedPlatforms = encodeURIComponent(selectedPlatforms.join(','));
    const encodedPayment = incentivizeEnabled ? encodeURIComponent(JSON.stringify({
      amount: paymentAmount,
      method: paymentMethod
    })) : '';
    const encodedEvent = encodeURIComponent(JSON.stringify({
      type: eventType,
      parameter: eventParameter,
      customWordCount: eventParameter === 'custom' && eventType === 'length' ? customWordCount : null,
      customTimePeriod: eventTimePeriod === 'custom' ? customTimePeriod : null,
      customDuration: eventParameter === 'custom' && eventType === 'time' ? customDuration : null,
      timePeriod: eventType === 'length' ? eventTimePeriod : null
    }));

    const inviteLink = incentivizeEnabled
      ? `${baseUrl}/invite/${currentUser.username}?name=${encodedName}&topics=${encodedTopics}&verify=${encodedPlatforms}&payment=${encodedPayment}&event=${encodedEvent}`
      : `${baseUrl}/invite/${currentUser.username}?name=${encodedName}&topics=${encodedTopics}&verify=${encodedPlatforms}&event=${encodedEvent}`;

    navigator.clipboard.writeText(inviteLink);
    toast.success('Invite link copied to clipboard');
  };

  const handlePreview = () => {
    if (!recipientName) {
      toast.error('Please enter recipient name');
      return;
    }

    // If there's a current topic but not added yet, add it automatically
    if (currentTopic.trim() && !topics.includes(currentTopic.trim())) {
      setTopics([...topics, currentTopic.trim()]);
    }

    // Check if we have either topics in the array or a current topic
    if (topics.length === 0 && !currentTopic.trim()) {
      toast.error('Please add at least one topic');
      return;
    }

    // Toggle preview state
    setShowPreview(!showPreview);

    // If opening preview, scroll to top with smooth animation
    if (!showPreview) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };


  // Simpler condition for copy invite link - only requires basic info
  const canCopyInviteLink = recipientName && (topics.length > 0) && eventType;


  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'bg-[#0A66C2]' },
    { id: 'twitter', name: 'X', icon: XIcon, color: 'bg-black' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'bg-[#1877F2]' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'bg-[#FF0000]' },
    { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, color: 'bg-black' }
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handlePaymentUpload = async () => {
    if (!paymentAmount || !paymentMethod) {
      toast.error('Please enter payment amount and select payment method');
      return;
    }

    if (paymentMethod === 'stripe') {
      // Validate mock form fields
      if (!cardNumberValid || !cardExpiryValid || !cardCVCValid || !cardholderNameValid) {
        toast.error('Please fill in all card details correctly');
        return;
      }

      setIsPaymentProcessing(true);

      try {
        // Simulate payment authorization delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setPaymentStatus('authorized');
        setShowPaymentSection(false); // Collapse payment section after successful authorization
        setIsPaymentProcessing(false);
        toast.success('Payment authorized! Amount will be charged after event completion.');
      } catch (err) {
        setPaymentStatus('cancelled');
        toast.error('Payment authorization failed. Please try again.');
      } finally {
        setIsPaymentProcessing(false);
      }
    } else {
      setIsPaymentProcessing(true);

      // Simulate other payment processing
      setTimeout(() => {
        setPaymentStatus('authorized');
        setShowPaymentSection(false); // Collapse payment section after successful authorization
        setIsPaymentProcessing(false);
        toast.success('Payment uploaded successfully! Money is now held securely by Arena.');
      }, 2000);
    }
  };

  // Check if event section is complete (for form validation)
  const isEventSectionComplete = eventType && (
    eventType === 'freeflow' ||
    ((eventParameter && eventParameter !== 'custom') ||
      (eventParameter === 'custom' &&
        ((eventType === 'length' && customWordCount) ||
          (eventType === 'time' && customDuration)))) &&
    (eventType !== 'length' ||
      (eventTimePeriod &&
        (eventTimePeriod !== 'custom' || (eventTimePeriod === 'custom' && customTimePeriod))))
  );

  // Auto-collapse event section when user interacts with other sections
  const handleOtherSectionInteraction = () => {
    // Removed auto-collapse - users now have manual control with Done button
  };

  const handleEditTopic = (index: number) => {
    setEditingTopicIndex(index);
    setEditingTopicValue(topics[index]);
  };

  const handleEditTopicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTopicValue(e.target.value);
  };

  const handleEditTopicSave = (index: number) => {
    const trimmed = editingTopicValue.trim();
    if (trimmed && !topics.includes(trimmed)) {
      const newTopics = [...topics];
      newTopics[index] = trimmed;
      setTopics(newTopics);
    }
    setEditingTopicIndex(null);
    setEditingTopicValue('');
  };

  const handleEditTopicCancel = () => {
    setEditingTopicIndex(null);
    setEditingTopicValue('');
  };

  const handleEditTopicKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      handleEditTopicSave(index);
    } else if (e.key === 'Escape') {
      handleEditTopicCancel();
    }
  };


  /* api logics */
  const [searchParams] = useSearchParams();

  const { data: guestData, isPending: guestPending } = useListData<IndividualQuery<User>>({
    endpoint: endpoint["user"],
    key: searchParams.get("gid") as string,
    enabled: !!searchParams.get("gid"),
    id: searchParams.get("gid") as string,
    window: false
  });
  useEffect(() => {
    if (guestData && searchParams.get("gid")) {
      setRecipientName(guestData.data.data.fullName);
    }
  }, [guestData]);


  const { mutate, isPending } = usePostData();
  const navigate = useNavigate();
  const handleGenerate = () => {
    const socialPlatforms = {
      isFacebookVerified: selectedPlatforms.includes("facebook"),
      isXVerified: selectedPlatforms.includes("twitter"),
      isLinkedinVerified: selectedPlatforms.includes("linkedin"),
      isTiktokVerified: selectedPlatforms.includes("tiktok"),
      isInstagramVerified: selectedPlatforms.includes("instagram"),
      isYoutubeVerified: selectedPlatforms.includes("youtube"),
    }

    let data: any = { guestName: recipientName, topics, wordsLength: eventParameter, timePeriod: eventTimePeriod, eventType, customDuration, customTimePeriod, customWordCount, mainTopicIndex, ...socialPlatforms }

    if (eventParameter === "custom") {
      data = { ...data, isCustomWordsLength: true, wordsLength: Number(customWordCount) }
    }
    if (eventTimePeriod === "custom") {
      data = { ...data, isCustomTimePeriod: true, timePeriod: Number(customTimePeriod) }
    }
    if (guestData && searchParams.get("gid")) {
      data = { ...data, guest: guestData.data.data._id }
    };

    mutate({
      endpoint: endpoint["arena"],
      data: data,
      method: METHODS.POST
    }, {
      onSuccess: ({ status, data }) => {
        if ([201, 200].includes(status)) {
          toast.success(`Invitation linked copied to clipboard!`);
          navigator.clipboard.writeText(`${import.meta.env.VITE_WEBSITE}/invite/${data?.data?._id}`);
          navigate(`/messages?tab=pending`);
        }
      },
      onError: (err) => {
        console.log(err, "error")
      }
    })
  };


  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4">
          {/* Create Invite Card */}
          <Card className="mb-6 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            <CardHeader>
              <CardTitle className="text-foreground/90 dark:text-white/90">Create Invite Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Name Input */}
                <div className="flex items-center space-x-4 ">

                  <Label className="text-sm font-medium min-w-[120px]">Recipient Name</Label>
                  <input
                    placeholder="Enter recipient's name"
                    disabled={searchParams.get("gid")}
                    value={ searchParams.get("gid") &&guestPending ?  "loading.." : recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    onFocus={handleOtherSectionInteraction}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1 placeholder:text-foreground/80 dark:placeholder:text-white/80"
                  />
                </div>

                {/* Topics Input */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Label className="text-sm font-medium min-w-[120px]">Topics</Label>
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        placeholder="Add a topic for discussion"
                        value={currentTopic}
                        onChange={(e) => setCurrentTopic(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={handleOtherSectionInteraction}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm flex-1 placeholder:text-foreground/80 dark:placeholder:text-white/80"
                      />
                      <Button
                        size="icon"
                        onClick={() => {
                          handleAddTopic();
                          handleOtherSectionInteraction();
                        }}
                        disabled={!currentTopic.trim()}
                        className="shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Topics Cards */}
                  {topics.length > 0 && (
                    <div className="ml-[136px]">
                      <div className="flex flex-wrap gap-2">
                        {topics.map((topic, index) => (
                          <div
                            key={index}
                            className="group relative bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm border border-muted/40 rounded-xl px-3 py-1 flex items-center max-w-xs overflow-hidden"
                            title={topic}
                          >
                            {/* Main topic selection dot */}
                            <span
                              className="mr-2 flex items-center justify-center cursor-pointer"
                              onClick={() => setMainTopicIndex(index)}
                              style={{ width: 12, height: 12 }}
                              title="Set as main topic"
                            >
                              <span
                                className={cn(
                                  "block rounded-full border",
                                  mainTopicIndex === index
                                    ? "w-2 h-2 bg-primary border-primary"
                                    : "w-2 h-2 border-muted-foreground"
                                )}
                              />
                            </span>
                            {editingTopicIndex === index ? (
                              <input
                                type="text"
                                value={editingTopicValue}
                                onChange={handleEditTopicChange}
                                onBlur={() => handleEditTopicSave(index)}
                                onKeyDown={(e) => handleEditTopicKeyDown(e, index)}
                                className="text-sm font-medium text-foreground bg-transparent outline-none border-none w-full px-0 py-0"
                                autoFocus
                              />
                            ) : (
                              <span
                                className="text-sm font-medium text-foreground break-words w-full cursor-pointer"
                                onClick={() => handleEditTopic(index)}
                              >
                                {topic}
                              </span>
                            )}
                            <button
                              onClick={() => handleRemoveTopic(topic)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-muted rounded-md ml-1"
                              title="Remove topic"
                            >
                              <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Info message for main topic */}
                      {mainTopicIndex !== null && (
                        <div className="mt-2 text-xs text-muted-foreground font-normal">
                          Selected topic will be featured as title on Arena’s home screen.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Type Section */}
                <div className="space-y-2">
                  <button
                    onClick={() => setShowEventSection(!showEventSection)}
                    className="flex items-center justify-between w-full p-3 rounded-xl border border-muted/40 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm hover:bg-muted/80 dark:hover:bg-[#2a2f38] transition-all duration-200 hover:border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-1.5 rounded-full",
                        eventType === 'length' ? "bg-blue-100 dark:bg-blue-900/20" :
                          eventType === 'freeflow' ? "bg-purple-100 dark:bg-purple-900/20" :
                            "bg-orange-100 dark:bg-orange-900/20"
                      )}>
                        {eventType === 'length' ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : eventType === 'freeflow' ? (
                          <MessageSquare className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <span className="text-sm font-medium">Event Type</span>
                        {isEventSectionComplete ? (
                          <div className="flex items-center gap-2">
                            <p className={cn(
                              "text-xs font-medium px-2 py-1 rounded-md",
                              eventType === 'length' ? "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30" :
                                eventType === 'freeflow' ? "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30" :
                                  "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30"
                            )}>
                              {getEventDisplayText()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">Choose length, time-based, or free flow</p>
                        )}
                      </div>
                    </div>
                    {showEventSection ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {showEventSection && (
                    <div className="pl-6 space-y-3 pt-1">
                      {/* Event Type Selection - Radio buttons instead of dropdown */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => {
                              setEventType('length');
                              resetEventValues();
                            }}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                              eventType === 'length'
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                          >
                            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                              <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium">Length-based</span>
                              <p className="text-xs text-muted-foreground">Word count target</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setEventType('time');
                              resetEventValues();
                            }}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                              eventType === 'time'
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                            disabled
                          >
                            <div className="p-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30">
                              <Clock className="h-4 w-4 text-orange-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium">Time-based</span>
                              <p className="text-xs text-muted-foreground">Coming soon (Live)</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setEventType('freeflow');
                              resetEventValues();
                            }}
                            className={cn(
                              "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-200",
                              eventType === 'freeflow'
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                                : "border-border hover:border-border/60 hover:bg-muted/30"
                            )}
                          >
                            <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-medium">Free Flow</span>
                              <p className="text-xs text-muted-foreground">No word limit - great for friends</p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Length-based Event Configuration */}
                      {eventType === 'length' && (
                        <div className="space-y-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Word Count</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {['300', '500', '1000'].map((count) => (
                                <button
                                  key={count}
                                  onClick={() => {
                                    setEventParameter(count);
                                    setShowCustomWordCountInput(false);
                                    setCustomWordCount('');
                                  }}
                                  className={cn(
                                    "p-2 rounded-lg border text-sm transition-all duration-200",
                                    eventParameter === count
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                      : "border-border hover:border-border/60 hover:bg-muted/30"
                                  )}
                                >
                                  {count} words
                                </button>
                              ))}
                              {showCustomWordCountInput ? (
                                <div className="flex items-center space-x-1 p-2 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                                  <input
                                    type="number"
                                    placeholder="Enter word count"
                                    value={customWordCount}
                                    onChange={(e) => {
                                      setCustomWordCount(e.target.value);
                                      setEventParameter('custom');
                                    }}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                    min="1"
                                    max="10000"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => {
                                      setShowCustomWordCountInput(false);
                                      setCustomWordCount('');
                                      setEventParameter('');
                                    }}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowCustomWordCountInput(true);
                                    setEventParameter('custom');
                                  }}
                                  className={cn(
                                    "p-2 rounded-lg border text-sm transition-all duration-200",
                                    eventParameter === 'custom'
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                      : "border-border hover:border-border/60 hover:bg-muted/30"
                                  )}
                                >
                                  Custom
                                </button>
                              )}
                            </div>
                          </div>

                          {eventParameter === 'custom' && !showCustomWordCountInput && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Word Count</Label>
                              <Input
                                type="number"
                                placeholder="Enter word count"
                                value={customWordCount}
                                onChange={(e) => setCustomWordCount(e.target.value)}
                                className="w-full placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                min="1"
                                max="10000"
                              />
                            </div>
                          )}

                          {/* Time Period - only show if word count is selected */}
                          {shouldShowTimePeriod() && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Time Period</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {['1', '2', '3', '4', '7'].map((days) => (
                                  <button
                                    key={days}
                                    onClick={() => {
                                      setEventTimePeriod(days);
                                      setShowCustomTimePeriodInput(false);
                                      setCustomTimePeriod('');
                                    }}
                                    className={cn(
                                      "p-1.5 rounded-lg border text-sm transition-all duration-200",
                                      eventTimePeriod === days
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                        : "border-border hover:border-border/60 hover:bg-muted/30"
                                    )}
                                  >
                                    {days === '1' ? '24 hrs' : `over ${days} days`}
                                  </button>
                                ))}
                                {showCustomTimePeriodInput ? (
                                  <div className="flex items-center space-x-1 p-1.5 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-950/20">
                                    <input
                                      type="number"
                                      placeholder="Enter number of days"
                                      value={customTimePeriod}
                                      onChange={(e) => {
                                        setCustomTimePeriod(e.target.value);
                                        setEventTimePeriod('custom');
                                      }}
                                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                      min="1"
                                      max="30"
                                    />
                                    <button
                                      onClick={() => {
                                        setShowCustomTimePeriodInput(false);
                                        setCustomTimePeriod('');
                                        setEventTimePeriod('');
                                      }}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setShowCustomTimePeriodInput(true);
                                      setEventTimePeriod('custom');
                                    }}
                                    className={cn(
                                      "p-1.5 rounded-lg border text-sm transition-all duration-200",
                                      eventTimePeriod === 'custom'
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                        : "border-border hover:border-border/60 hover:bg-muted/30"
                                    )}
                                  >
                                    Custom
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {eventTimePeriod === 'custom' && !showCustomTimePeriodInput && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Custom Time Period (days)</Label>
                              <Input
                                type="number"
                                placeholder="Enter number of days"
                                value={customTimePeriod}
                                onChange={(e) => setCustomTimePeriod(e.target.value)}
                                className="w-full placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                min="1"
                                max="30"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Time-based Event Configuration */}
                      {eventType === 'time' && (
                        <div className="space-y-3 pl-4 border-l-2 border-orange-200 dark:border-orange-800">
                          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Clock className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-1">
                              Live Discussion Coming Soon
                            </h3>
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                              Real-time video discussions will be available soon. For now, please use length-based events.
                            </p>
                            <Button
                              onClick={() => {
                                setEventType('length');
                                resetEventValues();
                              }}
                              variant="outline"
                              size="sm"
                              className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                            >
                              Switch to Length-based
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Free Flow Event Configuration */}
                      {eventType === 'freeflow' && (
                        <div className="space-y-3 pl-4 border-l-2 border-purple-200 dark:border-purple-800">
                          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                                  Natural Conversation Flow
                                </h4>
                                <div className="space-y-1 text-xs text-purple-700 dark:text-purple-300">
                                  <p>• Cannot send payment to the recipient</p>
                                  <p>• Perfect for casual discussions with friends</p>
                                  <p>• No word count limits or time pressure</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Done Button */}
                      {isEventSectionComplete && (
                        <div className="pt-2">
                          <Button
                            onClick={() => setShowEventSection(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            Done
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Payment Section - Hidden for Free Flow */}
                {eventType !== 'freeflow' && (
                  <div className="space-y-2 bg-red-50">
                    <button
                      disabled
                      onClick={() => setShowPaymentSection(!showPaymentSection)}
                      className="flex items-center disabled:cursor-not-allowed select-none justify-between w-full p-3 rounded-xl border border-muted/40 bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm hover:bg-muted/80 dark:hover:bg-[#2a2f38] transition-all duration-200 hover:border-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-1.5 rounded-full transition-all duration-200 bg-green-100 dark:bg-green-900/20"
                        )}>
                          <DollarSign className="h-4 w-4 text-green-600 transition-all duration-200" />
                        </div>
                        <div className="text-left">
                          <span className="text-sm font-medium">Incentivize Recipient</span>
                          {paymentAmount ? (
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-md">
                                ${paymentAmount} offered
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Show appreciation for their time with a secure payment</p>
                          )}
                        </div>
                      </div>
                      {showPaymentSection ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {showPaymentSection && (
                      <div className="pl-6 space-y-4 pt-2">
                        {/* Offer Amount - Show First */}
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            Offer Amount <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                          </Label>
                          <div className="grid grid-cols-3 gap-2">
                            {['20', '50', '100', '1000', '2000'].map((amount) => (
                              <button
                                key={amount}
                                onClick={() => {
                                  setPaymentAmount(amount);
                                  setShowCustomAmountInput(false);
                                }}
                                className={cn(
                                  "p-2 rounded-lg border text-sm transition-all duration-200",
                                  paymentAmount === amount
                                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : "border-border hover:border-border/60 hover:bg-muted/30"
                                )}
                              >
                                ${amount}
                              </button>
                            ))}
                            {showCustomAmountInput ? (
                              <div className="flex items-center space-x-1 p-2 rounded-lg border border-green-500 bg-green-50 dark:bg-green-950/20">
                                <span className="text-muted-foreground text-sm font-medium">$</span>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                  min="0"
                                  step="0.01"
                                  autoFocus
                                />
                                <button
                                  onClick={() => {
                                    setShowCustomAmountInput(false);
                                    setPaymentAmount('');
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowCustomAmountInput(true);
                                  setPaymentAmount('');
                                }}
                                className={cn(
                                  "p-2 rounded-lg border text-sm transition-all duration-200",
                                  paymentAmount && !['20', '50', '100', '1000', '2000'].includes(paymentAmount)
                                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                    : "border-border hover:border-border/60 hover:bg-muted/30"
                                )}
                              >
                                Custom
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Payment Method Selection - Show after amount */}
                        {paymentAmount && parseFloat(paymentAmount) > 0 && (!paymentMethod || paymentStatus !== 'authorized') && (
                          <div className="space-y-3 pl-4 border-l-2 border-green-200 dark:border-green-800">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Choose Payment Method</Label>
                              {paymentStatus === 'authorized' && (
                                <p className="text-xs text-orange-600 dark:text-orange-400">
                                  Changing payment method will reset your current authorization
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <button
                                onClick={() => {
                                  resetPaymentDetails();
                                  setPaymentMethod('stripe');
                                  setShowCardForm(true);
                                }}
                                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group"
                              >
                                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center">
                                  <CreditCard className="w-6 h-4 text-white" />
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-medium">Card</span>
                                  <p className="text-xs text-muted-foreground mt-1">Powered by Stripe</p>
                                </div>
                              </button>

                              <button
                                disabled
                                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border opacity-60 cursor-not-allowed"
                              >
                                <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">P</span>
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-medium">PayPal</span>
                                  <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                                </div>
                              </button>

                              <button
                                disabled
                                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border opacity-60 cursor-not-allowed"
                              >
                                <div className="w-12 h-8 bg-orange-500 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">₿</span>
                                </div>
                                <div className="text-center">
                                  <span className="text-sm font-medium">Crypto</span>
                                  <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Stripe Elements Form - Show when Stripe is selected */}
                        {paymentMethod === 'stripe' && showCardForm && (
                          <div className="space-y-4">
                            {/* Security & Trust Info Section */}
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/30">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                                  <Shield className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                                    Payment Protection
                                  </h4>
                                  <div className="space-y-1 text-xs text-green-700 dark:text-green-300">
                                    <p>• We process your card through Stripe with full encryption—your data is never stored.</p>
                                    <p>• Funds are authorized but only captured once the recipient accepts.</p>
                                    <p>• Your card is charged only after the event is completed.</p>
                                    <p>• If the event doesn't happen, you get a full refund—no questions asked.</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Card Details</Label>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={resetPaymentDetails}
                                  className="text-xs text-muted-foreground hover:text-foreground"
                                >
                                  ← Back
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                              {/* Mock Stripe Card Element */}
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">Card Information</Label>
                                <div className="p-3 border border-input rounded-md bg-background min-h-[40px] flex items-center">
                                  <input
                                    type="text"
                                    placeholder="1234 1234 1234 1234"
                                    value={cardNumber}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                      setCardNumber(formatted.substring(0, 19));
                                      setCardNumberValid(value.length >= 13 && value.length <= 19);
                                    }}
                                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                    maxLength={19}
                                  />
                                  <div className="flex items-center space-x-1 ml-2">
                                    <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                                    <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                                  </div>
                                </div>
                              </div>

                              {/* Mock Expiry and CVC */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">Expiry Date</Label>
                                  <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                      let formatted = value;
                                      if (value.length >= 2) {
                                        formatted = value.substring(0, 2) + '/' + value.substring(2, 4);
                                      }
                                      setCardExpiry(formatted.substring(0, 5));
                                      setCardExpiryValid(value.length === 4);
                                    }}
                                    className="w-full p-3 border border-input rounded-md bg-background text-sm outline-none placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                    maxLength={5}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">CVC</Label>
                                  <input
                                    type="text"
                                    placeholder="123"
                                    value={cardCVC}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                      setCardCVC(value.substring(0, 4));
                                      setCardCVCValid(value.length >= 3);
                                    }}
                                    className="w-full p-3 border border-input rounded-md bg-background text-sm outline-none placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                    maxLength={4}
                                  />
                                </div>
                              </div>

                              {/* Mock Cardholder Name */}
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">Cardholder Name</Label>
                                <input
                                  type="text"
                                  placeholder="Name on card"
                                  value={cardholderName}
                                  onChange={(e) => {
                                    setCardholderName(e.target.value);
                                    setCardholderNameValid(e.target.value.trim().length > 0);
                                  }}
                                  className="w-full p-3 border border-input rounded-md bg-background text-sm outline-none placeholder:text-foreground/80 dark:placeholder:text-white/80"
                                />
                              </div>

                              {/* Security Badge */}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Shield className="h-3 w-3" />
                                <span>Your card information is encrypted and secure</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PayPal Option - Show when PayPal is selected */}
                        {paymentMethod === 'paypal' && showPayPalOption && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">PayPal Integration</Label>
                              <p className="text-xs text-muted-foreground">PayPal integration coming soon</p>
                            </div>

                            <div className="p-4 bg-muted/30 rounded-lg border text-center">
                              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-white text-lg font-bold">P</span>
                              </div>
                              <p className="text-sm text-muted-foreground">PayPal integration will be available soon</p>
                              <Button
                                variant="outline"
                                className="mt-3"
                                onClick={() => {
                                  setPaymentMethod('');
                                  setShowPayPalOption(false);
                                }}
                              >
                                Choose Different Method
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Upload Payment Button */}
                        {paymentAmount && parseFloat(paymentAmount) > 0 && paymentMethod && (
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="lg"
                            onClick={handlePaymentUpload}
                            disabled={isPaymentProcessing || isAuthorizing || (paymentMethod === 'stripe' && (!cardNumberValid || !cardExpiryValid || !cardCVCValid || !cardholderNameValid))}
                          >
                            {isPaymentProcessing || isAuthorizing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                {isAuthorizing ? 'Authorizing Payment...' : 'Processing Payment...'}
                              </>
                            ) : (
                              <>
                                <Shield className="h-4 w-4 mr-2" />
                                Offer ${paymentAmount}
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Platform Selector */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-4">
                    <Label className="text-sm font-medium min-w-[120px] pt-2">Verification Request</Label>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        {platforms.map((platform) => {
                          const Icon = platform.icon;
                          const isSelected = selectedPlatforms.includes(platform.id);
                          return (
                            <button
                              key={platform.id}
                              onClick={() => {
                                togglePlatform(platform.id);
                                handleOtherSectionInteraction();
                              }}
                              title={platform.name}
                              className={cn(
                                "relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 hover:scale-105",
                                isSelected
                                  ? "bg-primary/10 border-2 border-primary/20"
                                  : "bg-muted/50 border-2 border-transparent hover:bg-muted/70"
                              )}
                            >
                              <Icon className={cn(
                                "h-5 w-5",
                                isSelected ? "text-primary" : "text-muted-foreground"
                              )} />
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-primary rounded-full flex items-center justify-center border border-border shadow">
                                  <Check className="h-2 w-2 text-primary-foreground" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Select platforms where you'd like the participant to verify
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Full Screen Preview Overlay */}
          {showPreview && (<>

            {/* Preview Content */}
            <InvitePreview
              createAction={handleGenerate}
              createState={isPending}
              canCopyInviteLink={canCopyInviteLink}
              generateInviteLink={generateInviteLink}
              getEventDisplayText={getEventDisplayText}
              paymentAmount={paymentAmount}
              platforms={platforms}
              recipientName={recipientName}
              selectedPlatforms={selectedPlatforms}
              setShowPreview={setShowPreview}
              topics={topics}

            />

          </>)}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              onClick={handlePreview}
              disabled={!canCopyInviteLink}
              className={cn(
                "h-11 px-6 font-medium transition-all duration-200",
                showPreview
                  ? "bg-muted/50 text-muted-foreground hover:bg-muted border border-border"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {showPreview ? "Hide Preview" : "Preview"}
            </Button>
            <Button
              // onClick={generateInviteLink}
              onClick={handleGenerate}
              disabled={!canCopyInviteLink || isPending}
              className={cn(
                "h-11 px-6 font-medium transition-all duration-200",
                canCopyInviteLink
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Copy className="mr-2 h-4 w-4" />
              {searchParams.get("gid") ? "Send Invitation" : isPending ? "Copying..." : "Copy Invite Link"} {isPending && <Spinner />}
            </Button>
          </div>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default InviteUsers;
