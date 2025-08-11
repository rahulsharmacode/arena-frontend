import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminDashboard from '@/pages/AdminDashboard';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./layout/index.layout";
import Conversation from "./pages/Conversation";
import DebateRoom from "./pages/DebateRoom";
import Debates from "./pages/Debates";
import Home from "./pages/Home";
import Index from "./pages/Index";
import InvitePreview from "./pages/InvitePreview";
import InviteUsers from "./pages/InviteUsers";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import SignUp from "./pages/SignUp";
import Topics from "./pages/Topics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
 
     
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/me" element={<Profile />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/debates" element={<Debates />} />
              <Route path="/debates/:id" element={<DebateRoom />} />
              
              {/* <Route path="/conversation/rick-sam" element={<RickSamConversation />} /> */}
              <Route path="/messages" element={<Messages />} />
              <Route path="/invite" element={<InviteUsers />} />
              <Route path="/invite/:id" element={<InvitePreview />} />

              <Route element={<PrivateLayout/>}>

              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile/:username" element={<PublicProfile />} />
              <Route path="/:arenachat/:id" element={<Conversation />} />
              </Route>


              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
 
  </QueryClientProvider>
);

export default App;
