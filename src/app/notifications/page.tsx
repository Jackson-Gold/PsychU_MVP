import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { markAllNotificationsRead, markNotificationRead } from "@/app/notifications/actions";
import { getAuthContext } from "@/lib/auth";
import { mapNotification } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const context = await getAuthContext();
  if (!context) redirect("/auth");

  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  const notifications = (rows ?? []).map(mapNotification);
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <AppShell active="/notifications">
      <section className="panel" aria-labelledby="notifications-title">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Notifications</p>
            <h1 id="notifications-title">Updates and next steps</h1>
            <p className="section-intro">
              {unreadCount ? `You have ${unreadCount} unread update${unreadCount === 1 ? "" : "s"}.` : "You are all caught up."}
            </p>
          </div>
          {unreadCount ? (
            <form action={markAllNotificationsRead}>
              <SubmitButton label="Mark all read" pendingLabel="Updating..." className="button button-secondary" />
            </form>
          ) : (
            <StatusBadge value="all read" tone="good" />
          )}
        </div>

        {notifications.length ? (
          <ul className="clean-list">
            {notifications.map((notification) => (
              <li key={notification.id} className={notification.readAt ? undefined : "notification-unread"}>
                <strong>
                  {notification.title}{" "}
                  {notification.readAt ? null : <StatusBadge value="new" tone="info" />}
                </strong>
                <span>{notification.body}</span>
                <span className="field-help">{new Date(notification.createdAt).toLocaleString()}</span>
                {notification.readAt ? null : (
                  <form action={markNotificationRead}>
                    <input type="hidden" name="notification_id" value={notification.id} />
                    <button className="nav-link nav-button" type="submit">
                      Mark as read
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <strong>No notifications yet</strong>
            <span>Case updates, review outcomes, and sharing events will appear here.</span>
          </div>
        )}
      </section>
    </AppShell>
  );
}
