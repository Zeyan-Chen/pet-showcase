import { AnnouncementForm } from "../../components/announcement-form";
import { AnnouncementTable } from "../../components/announcement-table";
import { listAnnouncements } from "../../lib/announcements";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await listAnnouncements();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border border-[var(--admin-border)] bg-[linear-gradient(180deg,rgba(255,253,249,0.98),rgba(247,241,232,0.98))] px-5 py-5 shadow-[0_28px_70px_-42px_rgba(76,57,35,0.16)]">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            站台公告
          </p>
          <h1 className="text-3xl font-bold text-[var(--admin-ink)]">公告管理</h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--admin-muted)]">
            設定前台上方藍色細條要輪播的公告。你可以新增多則公告，並個別控制是否啟用。
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <AnnouncementForm announcementCount={announcements.length} />

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-card)] px-5 py-4 shadow-[0_18px_60px_-42px_rgba(76,57,35,0.16)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
              公告總覽
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--admin-ink)]">
              目前共有 {announcements.length} 則公告
            </h2>
          </div>

          <AnnouncementTable announcements={announcements} />
        </div>
      </section>
    </main>
  );
}
