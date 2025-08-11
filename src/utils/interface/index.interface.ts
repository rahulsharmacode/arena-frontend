interface ArenaEvent {
  _id: string;
  author: string;
  guestName: string;
  topics: string[];
  isLinkedinVerified: boolean;
  isXVerified: boolean;
  isFacebookVerified: boolean;
  isInstagramVerified: boolean;
  isYoutubeVerified: boolean;
  isTiktokVerified: boolean;
  eventType: 'words' | 'voice' | 'video' | string; // Adjust types as needed
  wordsLength?: number;
  timePeriod: number | null;
  isPaid: boolean;
  offerAmount: number;
  paymentMode: 'stripe' | 'paypal' | 'manual' | string; // Extend as necessary
  paymentStatus: 'pending' | 'completed' | 'failed' | null;
  isEventClosed: boolean;
  view: number;
  like: string[]; // Assuming user IDs
  createdAt: string; // ISO date string
  updatedAt: string;
  __v: number;
};


interface QueryRetrive<T> {
  data: {
    data :{
  status: boolean;
  message: string;
  data: T;
  }
  }
}

interface UserData {
  image: string;
  _id: string;
  username: string;
  credit: number;
  fullName: string;
  role: 'user' | 'admin' | string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  isLinkedinVerified: string | null;
  isXVerified: string | null;
  isFacebookVerified: string | null;
  isInstagramVerified: string | null;
  isYoutubeVerified: string | null;
  isTiktokVerified: string | null;
  follower:number;
  following:number;
  isFollowed:boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  bio: string;
}

interface ImageInfo {
  s3Key: string;
  s3Bucket: string;
  uploadDate: string;
  originalFileName: string;
  url:string;
}

interface UserInfo {
  _id: string;
  fullName: string;
  username:string;
  image: ImageInfo;
  bio:string
  isLinkedinVerified:string|null
  isXVerified:string|null
  isFacebookVerified:string|null
  isInstagramVerified:string|null
  isYoutubeVerified:string|null
  isTiktokVerified:string|null
}

interface EventAreanData {
  _id: string;
  author: UserInfo;
  guest: UserInfo;
  guestName: string;
  topics: string[];
  mainTopicIndex: number;
  isLinkedinVerified: boolean;
  isXVerified: boolean;
  isFacebookVerified: boolean;
  isInstagramVerified: boolean;
  isYoutubeVerified: boolean;
  isTiktokVerified: boolean;
  eventType: string;
  wordsLength: number;
  isCustomWordsLength: boolean;
  isCustomTimePeriod: boolean;
  timePeriod: number;
  isPaid: boolean;
  offerAmount: number | null;
  paymentMode: string;
  paymentStatus: string | null;
  isEventClosed: boolean;
  eventStatus: string;
  view: number;
  viewed: boolean;
  like: number; // assuming it's an array of user IDs or similar
  createdAt: string;
  updatedAt: string;
  __v: number;

  isNewDiscussion:boolean
  bookmark:boolean
  liked:boolean
  content:string
  comments:number


}






interface IndividualQuery<T> {
  data :{
    status: boolean;
    message: string;
    data: T;
  }
  status: number;
};

interface QueryMetaData<T, Q> {
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
    sections?: Q;
    category_counts?: Q;
    total_count?: number;
  };
  status: number;
}
interface QueryData<T> {
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    data: T[];
  };
  status: number;
};

interface MessageData {
  type: "message";
  content: string;
  file: null;
  user: {
    uid: string;
    roomId: string;
  };
  topic: string;
  topicIndex: number;
};


interface MessageHistory {
  _id: string;
  room: string;
  content: string;
  topic: string;
  topicIndex: string;
  sender: string;
  createdAt: string; // or Date if you parse it
  updatedAt: string; // or Date
  __v: number;
  file?: {
    s3Key: string;
    url: string;
  };

comments:number;
  like:number;
  liked:boolean;
};


interface PostlikedByData {
  _id: string;
  user: UserData;
  post: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  __v: number;
}


interface IUser {
  _id: string;
  username: string;
  fullName: string;
}

interface MessageCommentData {
  _id: string;
  user: IUser;
  post: string; // or ObjectId if you're using Mongoose types
  content: string;
  createdAt: string; // can be Date if parsed
  updatedAt: string; // can be Date if parsed
  __v: number;
};


interface NotificationData {
  _id: string;
  to: string;
  from: string | null;
  event:EventAreanData | null;
  title: string;
  content: string;
  isRead: boolean;
  redirect: string;
  metadata: string;
  __v: number;
  type:"podcast"|"message"|"invite"|"verification",
  createdAt: string; // or Date if you convert it
  updatedAt: string; // or Date if you convert it
}


interface FollowData {
  _id: string;
  following: {
    _id: string;
    username: string;
    fullName: string;
    image: ImageInfo;
  };
}
export type {
    ArenaEvent,
    UserData,
    QueryRetrive,
    IndividualQuery,
    EventAreanData,
    QueryData,
    ImageInfo,
    MessageData,
    MessageHistory,
    PostlikedByData,
    MessageCommentData,
    NotificationData,
    FollowData
}