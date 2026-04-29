export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-marva-900">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-marva-700/70">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
