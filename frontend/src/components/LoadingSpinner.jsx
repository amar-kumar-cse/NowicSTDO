export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-current border-t-transparent opacity-60`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm opacity-60">{text}</p>}
    </div>
  );
}