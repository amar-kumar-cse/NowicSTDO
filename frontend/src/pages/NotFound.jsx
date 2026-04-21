import { Link } from 'react-router-dom';

function NotFoundShell({ title, description, ctaLabel, ctaTo }) {
  return (
    <div className="container-shell flex min-h-[70vh] flex-col items-center justify-center text-center py-20">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-text sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-xl text-sub">{description}</p>
      <Link to={ctaTo} className="cta-btn mt-8 inline-flex">
        {ctaLabel}
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <NotFoundShell
      title="Page not found"
      description="The page you are looking for does not exist or has moved."
      ctaLabel="Back to Home"
      ctaTo="/"
    />
  );
}

export function AdminNotFound() {
  return (
    <NotFoundShell
      title="Admin page not found"
      description="That admin route does not exist. Use the dashboard to continue."
      ctaLabel="Go to Admin Dashboard"
      ctaTo="/admin"
    />
  );
}