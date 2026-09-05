export default function LoadingSpinner({ size = 'md', text = '' }) {
  // We can ignore size here as the animation has fixed dimensions,
  // but we can scale it if needed using tailwind scale utility
  const sizeClass = size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : 'scale-100';

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[60px]">
      <div className={`custom-loader ${sizeClass}`}>
        <div>G</div>
        <div>N</div>
        <div>I</div>
        <div>D</div>
        <div>A</div>
        <div>O</div>
        <div>L</div>
      </div>
      {text && <p className="text-sm opacity-60 text-center font-bold tracking-widest uppercase">{text}</p>}
    </div>
  );
}