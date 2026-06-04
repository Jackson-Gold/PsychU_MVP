"use client";

import { useState, type ReactNode } from "react";
import { StatusBadge } from "@/components/status-badge";

export type AdminTab = {
  id: string;
  label: string;
  count: number;
  eyebrow: string;
  description: string;
  content: ReactNode;
};

export function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className="admin-tabs">
      <div className="admin-tabbar" role="tablist" aria-label="Admin sections">
        {tabs.map((tab) => {
          const isActive = tab.id === active?.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`admin-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`admin-panel-${tab.id}`}
              className={isActive ? "admin-tab is-active" : "admin-tab"}
              onClick={() => setActiveId(tab.id)}
            >
              <span className="admin-tab-label">{tab.label}</span>
              <span className="admin-tab-count">{tab.count}</span>
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => {
        const isActive = tab.id === active?.id;
        return (
          <section
            key={tab.id}
            id={`admin-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`admin-tab-${tab.id}`}
            className="panel admin-tabpanel"
            hidden={!isActive}
          >
            <div className="panel-header">
              <div>
                <p className="eyebrow">{tab.eyebrow}</p>
                <h2>{tab.label}</h2>
                <p className="section-intro">{tab.description}</p>
              </div>
              <StatusBadge value={`${tab.count} records`} tone="info" />
            </div>
            <div className="admin-section-body">{tab.content}</div>
          </section>
        );
      })}
    </div>
  );
}
