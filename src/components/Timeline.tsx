import type { Activity } from "../types";
import { monthLabel } from "../model";
import { ActivityCard } from "./ActivityCard";
export function Timeline({
  items,
  compact,
  onOpen,
  today,
}: {
  items: Activity[];
  compact: boolean;
  onOpen: (a: Activity) => void;
  today: string;
}) {
  const groups = new Map<string, Activity[]>();
  for (const a of items) {
    const key = a.settimana_inizio.slice(0, 7);
    groups.set(key, [...(groups.get(key) || []), a]);
  }
  return (
    <div className="timeline">
      {[...groups.entries()].map(([month, activities]) => (
        <section className="month-section" key={month}>
          <div className="month-heading">
            <h3>{monthLabel(month)}</h3>
            <span>{activities.length} esperienze</span>
          </div>
          <div className="month-activities">
            {activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                compact={compact}
                onOpen={onOpen}
                today={today}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
