import { AnnouncementForm } from "../../components/announcement-form";
import { AnnouncementTable } from "../../components/announcement-table";
import { listAnnouncements } from "../../lib/announcements";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await listAnnouncements();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <section className="rounded-[2rem] border border-[#d8cdbf] bg-[linear-gradient(180deg,rgba(250,246,240,0.95),rgba(239,231,218,0.95))] px-5 py-5 shadow-[0_28px_70px_-32px_rgba(16,38,63,0.26)]">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#6d6359]">站台公告</p>
          <h1 className="text-3xl font-bold text-[#1f1a17]">前台藍條公告管理</h1>
          <p className="max-w-3xl text-sm leading-6 text-[#605850]">
            你可以在這裡新增多則公告，並控制每則公告是否啟用。前台只會輪播目前啟用中的公告；如果只有一則啟用，就只顯示那一則。
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
        <AnnouncementForm announcementCount={announcements.length} />

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#d8cdbf] bg-[#fffaf3] px-5 py-4 shadow-[0_18px_60px_-40px_rgba(16,38,63,0.34)]">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d6359]">公告列表</p>
            <h2 className="mt-2 text-xl font-semibold text-[#1f1a17]">
              目前共有 {announcements.length} 則公告
            </h2>
          </div>

          <AnnouncementTable announcements={announcements} />
        </div>
      </section>
    </main>
  );
}
