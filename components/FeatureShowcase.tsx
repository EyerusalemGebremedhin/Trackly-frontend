"use client";

import { useState } from "react";

const areas = [
  { n: "01", title: "My Tasks", text: "Your personal board and your daily check-in, in one place. Track tasks from to-do to done and log daily progress.", points: ["Move tasks across To be done, In progress, In review and Done", "Log what you achieved each day with the check-in form", "See every finished task under Completed"] },
  { n: "02", title: "Groups", text: "Everything about a team: its goal, its members and its work.", points: ["See group tasks, members and the group goal", "Request help, add or archive members, and assign tasks", "Check the overall status and what is completed"] },
  { n: "03", title: "Discussion", text: "Pick a group and collaborate with the people in it.", points: ["Messages for everyday conversation", "Check-ins to share updates", "Members & skills to see who can help"] },
  { n: "04", title: "Direct Messages", text: "Talk one to one with anyone you work with.", points: ["Start a chat with any member", "Fix a typo until the other person replies", "Keep private notes in Saved (You)"] },
  { n: "05", title: "Performance", text: "See how your group is doing over time.", points: ["Follow progress week by week", "Spot trends early", "Find where to improve"] },
  { n: "06", title: "Metrics", text: "The numbers that show what is working.", points: ["Completion rate and overdue work at a glance", "Compare periods to see real change", "Use the data to plan the next week"] },
  { n: "07", title: "Talk to Trackly", text: "Your assistant inside the app.", points: ["Ask how to find or do anything", "Get help managing your tasks", "Keep your team on track"] },
  { n: "08", title: "Profile Settings", text: "Your account, your way.", points: ["Update your name, photo, job title and skills", "Choose your notification preferences", "Change your password"] },
];

export default function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const a = areas[active];
  return (
    <div className="grid overflow-hidden rounded-3xl border bg-surface shadow-sm md:grid-cols-[0.9fr_1.4fr]">
      <ul className="border-b p-3 md:border-b-0 md:border-r md:p-4">
        {areas.map((item, i) => (
          <li key={item.title}>
            <button type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} className={`flex w-full items-baseline gap-4 rounded-xl border-l-2 px-4 py-3 text-left transition-all duration-200 ${i === active ? "border-accent bg-accent/5 text-accent" : "border-transparent text-muted hover:bg-black/[0.03] hover:text-foreground"}`}>
              <span className="w-6 font-serif text-xs opacity-70">{item.n}</span>
              <span className="font-serif text-xl">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="relative min-h-[22rem] overflow-hidden p-6 md:p-10">
        <span className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[11rem] leading-none text-accent/[0.06] md:text-[14rem]">{a.n}</span>
        <div key={active} className="relative">
          <h3 className="font-serif text-3xl text-accent md:text-4xl">{a.title}</h3>
          <p className="mt-3 max-w-md text-muted">{a.text}</p>
          <p className="mt-8 text-xs font-medium uppercase tracking-widest text-muted">What you can do</p>
          <ul className="mt-3 max-w-lg divide-y">
            {a.points.map((p) => (
              <li key={p} className="flex gap-3 py-3 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
