export function EmptyState() {
  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-sm">
      <h2 className="text-lg font-semibold">目前還沒有可展示的守宮個體。</h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        後台發布新的個體後，這裡會依照品種分類顯示在列表中。
      </p>
    </section>
  );
}
