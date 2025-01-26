
export default function ErrorMessage({ error }: { error: string }) {
  return (
    <div
      className="flex w-full items-center p-4 mb-4 gap-2 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <i className="ri-error-warning-line text-xl" />
      <span className="sr-only">Error</span>
      <div>{error}</div>
    </div>
  );
}
