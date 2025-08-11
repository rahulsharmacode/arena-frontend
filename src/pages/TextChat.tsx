import ChatInterface from '@/components/ChatInterface';
import Navbar from '@/components/Navbar';
import TransitionWrapper from '@/components/TransitionWrapper';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const MOCK_CONVERSATIONS = {
  '1': {
    id: '1',
    title: 'Chat with Jack Wilson',
    isPublic: true,
    views: 124,
    likes: 18,
    shares: 5,
    participant: { id: '123', name: 'Jack Wilson', username: 'jackw', avatar: null, status: 'online' },
    messages: [
      { id: '1', sender: { id: '123', name: 'Jack Wilson', avatar: undefined }, content: 'What do you think about the rapid advancement of AI technology?', timestamp: new Date('2023-06-10T10:30:00Z'), isCurrentUser: false },
      { id: '2', sender: { id: 'current-user', name: 'You', avatar: undefined }, content: 'I believe it has enormous potential, but we need proper regulations to ensure it benefits humanity.', timestamp: new Date('2023-06-10T10:32:00Z'), isCurrentUser: true },
      { id: '3', sender: { id: '123', name: 'Jack Wilson', avatar: undefined }, content: 'Do you think we\'re moving too fast without considering the implications?', timestamp: new Date('2023-06-10T10:35:00Z'), isCurrentUser: false },
      { id: '4', sender: { id: 'current-user', name: 'You', avatar: undefined }, content: 'In some areas, yes. Especially when it comes to autonomous decision-making systems that could impact human lives.', timestamp: new Date('2023-06-10T10:38:00Z'), isCurrentUser: true }
    ],
    comments: [
      { id: '1', user: { name: 'Sara Kim', username: 'sarak', avatar: null }, content: 'Great points about AI regulation!', timestamp: new Date('2023-06-10T11:30:00Z'), likes: 3 },
      { id: '2', user: { name: 'Michael Johnson', username: 'michaelj', avatar: null }, content: 'I think we need global standards for AI ethics.', timestamp: new Date('2023-06-10T12:45:00Z'), likes: 5 },
    ]
  },
  // ... keep existing code (other conversation entries)
};

const TextChat: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [newComment, setNewComment] = useState('');
  const { toast } = useToast();
  
  // In a real app, we would fetch the conversation data based on the ID
  const conversation = id && MOCK_CONVERSATIONS[id as keyof typeof MOCK_CONVERSATIONS];

  const [comments, setComments] = useState(conversation?.comments || []);
  
  useEffect(() => {
    if (id && !conversation) {
      // If the conversation ID doesn't exist, redirect to messages
      navigate('/messages');
    }
  }, [id, conversation, navigate]);

  const handleAddComment = () => {
    if (!newComment.trim() || !user) {
      return;
    }
    
    const comment = {
      id: Date.now().toString(),
      user: {
        name: user.name || 'Anonymous User',
        username: user.username || 'anonymous',
        avatar: null
      },
      content: newComment,
      timestamp: new Date(),
      likes: 0
    };
    
    setComments([...comments, comment]);
    setNewComment('');
    toast({
      title: "Comment added",
      description: "Your comment has been added to the conversation."
    });
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prevComments => 
      prevComments.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 } 
          : comment
      )
    );
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Please Log In</h1>
            <p className="mb-6">You need to be logged in to view conversations</p>
            <Button asChild>
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  if (!conversation) {
    return (
      <>
        <Navbar />
        <TransitionWrapper animation="fade" className="min-h-screen pt-24 pb-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-semibold mb-4">Conversation Not Found</h1>
            <p className="mb-6">The conversation you're looking for doesn't exist</p>
            <Button asChild>
              <Link to="/messages">Back to Messages</Link>
            </Button>
          </div>
        </TransitionWrapper>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <TransitionWrapper animation="fade" className="min-h-screen bg-background pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40">
            {/* Chat header */}
              {/* Header */}
            <div className="border-b border-muted/20 bg-muted/30 dark:bg-muted/20 p-4">
              <div className="flex flex-col items-center justify-center relative">
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => navigate('/messages')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <p className="text-sm font-medium">
                  Chat with {conversation.participant.name}
                </p>
                
                {/* Conversation Metadata */}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>{conversation.messages.length} messages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{conversation.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{conversation.likes} likes</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col max-h-[65vh] relative">
                <div className="p-4 overflow-y-auto">
                  <ChatInterface 
                    messages={conversation.messages}
                    onSendMessage={(content) => {
                      console.log("Message sent:", content);
                      // In a real app, we would call an API to send the message
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TransitionWrapper>
    </>
  );
};

export default TextChat;
