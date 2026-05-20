import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-bold">找不到這隻守宮</h1>
      <Link href="/" className="text-sm font-semibold text-bark">
        返回守宮列表
      </Link>
    </main>
  );
}
