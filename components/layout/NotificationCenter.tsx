'use client';

import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, MessageSquare, MessageCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

// Empty notifications list
const NOTIFICATIONS: any[] = [];

export function NotificationCenter() {
    // Dynamic counts
    const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Bell className="w-5 h-5" style={{ color: 'var(--header-icon)' }} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-[#ff5b5b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-[var(--header-bg)]">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[380px] p-0 overflow-hidden border-none shadow-xl" align="end">
                <div className="flex flex-col h-full bg-white dark:bg-[#1e2329]">
                    {/* Header */}
                    <div className="bg-[#3e4f8a] p-4 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold">Notifications</h3>
                            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded font-medium">{unreadCount} New</span>
                        </div>

                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="bg-transparent p-0 gap-6">
                                <TabsTrigger
                                    value="all"
                                    className="bg-transparent text-white/70 data-[state=active]:bg-white data-[state=active]:text-[#3e4f8a] rounded-t-md rounded-b-none px-4 py-1.5 h-auto font-medium shadow-none border-b-0 data-[state=active]:shadow-none"
                                >
                                    All ({NOTIFICATIONS.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="messages"
                                    className="bg-transparent text-white/70 data-[state=active]:bg-white data-[state=active]:text-[#3e4f8a] rounded-t-md rounded-b-none px-4 py-1.5 h-auto font-medium shadow-none border-b-0 data-[state=active]:shadow-none"
                                >
                                    Messages
                                </TabsTrigger>
                                <TabsTrigger
                                    value="alerts"
                                    className="bg-transparent text-white/70 data-[state=active]:bg-white data-[state=active]:text-[#3e4f8a] rounded-t-md rounded-b-none px-4 py-1.5 h-auto font-medium shadow-none border-b-0 data-[state=active]:shadow-none"
                                >
                                    Alerts
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto max-h-[400px] min-h-[200px]">
                        {NOTIFICATIONS.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                                <Bell className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm">No notifications</p>
                            </div>
                        ) : (
                            NOTIFICATIONS.map((item, index) => (
                                <div key={item.id} className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative">
                                    {/* Icon/Image */}
                                    <div className="flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", item.iconBg)}>
                                                {item.icon && <item.icon className={cn("w-5 h-5", item.iconColor)} />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight mb-1">
                                            {item.unread && item.type === 'reward' && (
                                                <>Your <span className="font-bold">Elite</span> author Graphic Optimization <span className="text-blue-600 font-bold">reward</span> is ready!</>
                                            )}
                                            {item.type !== 'reward' && item.title}
                                        </h4>

                                        {item.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-snug">
                                                {item.description}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                                            <span className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                            </span>
                                            {item.time}
                                        </div>
                                    </div>

                                    {/* Checkbox */}
                                    <div className="flex-shrink-0 pt-1">
                                        <Checkbox className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 border-gray-300" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center">
                        <button className="text-xs font-semibold text-[#3e4f8a] hover:text-blue-700 dark:text-blue-400">
                            View All Notifications
                        </button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
