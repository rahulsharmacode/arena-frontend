import React from 'react'
import { Skeleton } from '../ui/skeleton'

import { Eye, Heart, MessageSquare, Share2 } from "lucide-react";
interface Props {self?:boolean}

const ArenaEventSkeleton:React.FC<Props> = ({self=false}) => {
 return (<>
          <div
         
            className="overflow-hidden bg-muted/70 dark:bg-[#23272f] backdrop-blur-sm shadow-lg rounded-2xl border border-muted/40 p-6 animate-pulse"
          >
            {/* Main Topic Skeleton */}
            <div className="space-y-2 mb-6">
              <Skeleton className="bg-slate-200 h-6 w-3/4" />
              <div className="border-t border-muted/20" />
            </div>

            {/* Participants Skeleton - Replicating the two-column layout from the screenshot */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Participant 1 */}
              <div className="flex items-center gap-4 w-full min-h-[4rem]">
                <Skeleton className="bg-slate-200 h-20 w-20 rounded-xl flex-shrink-0" />
                <div className="flex flex-col space-y-2 justify-center h-full min-h-[4rem] w-full">
                  <Skeleton className="bg-slate-200 h-4 w-1/3" />
                  <Skeleton className="bg-slate-200 h-3 w-2/3" />
                  <Skeleton className="bg-slate-200 h-3 w-2/3" />

                </div>
              </div>
              {/* Participant 2 */}
              {!self && <div className="flex items-center gap-4 w-full min-h-[4rem]">
                <Skeleton className="bg-slate-200 h-20 w-20 rounded-xl flex-shrink-0" />
                <div className="flex flex-col space-y-2 justify-center h-full min-h-[4rem] w-full">
                  <Skeleton className="bg-slate-200 h-4 w-1/3" />
                  <Skeleton className="bg-slate-200 h-3 w-2/3" />
                  <Skeleton className="bg-slate-200 h-3 w-2/3" />

                </div>
              </div>}
            </div>

            {/* Topics Section Skeleton */}
            <div className="mb-4 flex items-center gap-2 w-full">
              <Skeleton className="bg-slate-200 h-4 w-16" />
              <div className="flex-1 overflow-hidden">
                <div className="flex gap-2">
                  <Skeleton className="bg-slate-200 h-4 w-20" />
                  <Skeleton className="bg-slate-200 h-4 w-24" />
                  <Skeleton className="bg-slate-200 h-4 w-16" />
                  <Skeleton className="bg-slate-200 h-4 w-20" />
                </div>
              </div>
            </div>

            {/* Engagement Metrics Skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-muted/20">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground/50" />
                  <Skeleton className="bg-slate-200 h-3 w-8" />
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-rose-400" />
                  <Skeleton className="bg-slate-200 h-3 w-8" />
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-400" />
                  <Skeleton className="bg-slate-200 h-3 w-8" />
                </div>
              </div>
              <Skeleton className="bg-slate-200 h-7 w-20 rounded-md" />
            </div>
          </div>
    
  </>
   
   
  );
};


export {ArenaEventSkeleton}