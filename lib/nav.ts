import { Home, CheckSquare, Users, MessagesSquare, Trophy, BarChart3, MessageCircle, Bot } from "lucide-react";

export const navItems = [
  { href: "/dashboard",   label: "Home",            icon: Home, primary: true },
  { href: "/tasks",       label: "My Tasks",        icon: CheckSquare, primary: true },
  { href: "/groups",      label: "Groups",          icon: Users, primary: true },
  { href: "/discussion",  label: "Discussion",      icon: MessagesSquare, primary: true },
  { href: "/messages",    label: "Direct Messages", icon: MessageCircle },
  { href: "/performance", label: "Performance",     icon: Trophy },
  { href: "/metrics",     label: "Metrics",         icon: BarChart3 },
  { href: "/chatbot",    label: "Talk to Trackly", icon: Bot },
];
