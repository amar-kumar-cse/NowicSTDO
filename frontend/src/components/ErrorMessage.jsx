export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <p className="text-center text-red-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm transition-colors hover:bg-white/20"
          type="button"
        >
          Try Again
        </button>
      )}
    </div>
  );
}