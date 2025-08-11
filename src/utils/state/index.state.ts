import { create } from "zustand";
import { NotificationData } from "../interface/index.interface";


export interface User {
  _id: string;
  username: string;
  credit: number;
  fullName: string;
  role: "user" | "admin";
  bio:string;
  image:string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  isLinkedinVerified: string|null;
  isXVerified: string|null;
  isFacebookVerified: string|null;
  isInstagramVerified: string|null;
  isYoutubeVerified: string|null;
  isTiktokVerified: string|null;
  friends: string[]; // assuming array of user IDs
  friendRequestsReceived: string[];
  friendRequestsSent: string[];
  createdAt: string;
  updatedAt: string;
}
interface UserStore {
  user: User | null;
  isPending: boolean;
  setUser: (user: User) => void;
  setPending: (isPending: boolean) => void;
  clear: () => void;
}
const useUser = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
  isPending: false,
  setPending: (isPending) => set({ isPending }),
}));


const useSocialVerification = create((set) => ({
  platform: null,
  setPlatform: (platform:string) => set({ platform }),
  clear: () => set({ platform: null }),
}));












interface NotificationStore {
  notifications: NotificationData | null;
  setNotifications: (notifications: NotificationData) => void;
  clear: () => void;
}
const useNotification = create<NotificationStore>((set) => ({
  notifications: null,
  setNotifications: (notifications) => set({ notifications }),
  clear: () => set({ notifications: null }),
}));

export {
    useUser,
    useSocialVerification,
    useNotification
}