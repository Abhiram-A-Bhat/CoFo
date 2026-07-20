"use client";

import { useEffect, useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getNotifications, markAllNotificationsRead, type NotificationItem } from "@/lib/api/retention";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  async function loadData() {
    try {
      const res = await getNotifications();
      setNotifications(res.items);
      setUnreadCount(res.unread_count);
    } catch (_) {}
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (_) {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
        title="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkRead}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline font-medium"
                >
                  <Check className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                      n.is_read
                        ? "border-white/[0.04] bg-white/[0.01] text-white/60"
                        : "border-emerald-500/20 bg-emerald-500/5 text-white font-medium"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{n.title}</span>
                      <span className="text-[10px] text-white/30">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-white/70 text-[11px] leading-relaxed">{n.message}</p>
                    {n.link_url && (
                      <Link
                        href={n.link_url}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold hover:underline mt-1"
                      >
                        View details <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-white/30">No notifications yet.</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
