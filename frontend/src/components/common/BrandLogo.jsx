import { useContent } from '../../context/ContentContext';

const LOGO_PRIMARY = '/image.png';
const LOGO_FALLBACK = '/nowic-logo.svg';

export default function BrandLogo({
  className = '',
  imgClassName = '',
  alt = 'Nowic Studio logo',
  variant = 'full'
}) {
  const { content = {} } = useContent();
  const brand = content.brand || {};
  const logoPrimary = brand.logoPrimary || LOGO_PRIMARY;

  const baseImgClass =
    variant === 'icon'
      ? 'h-full w-full scale-[1.34] object-cover object-top'
      : 'h-full w-full object-contain';

  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      <img
        src={logoPrimary}
        alt={alt}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = LOGO_FALLBACK;
        }}
        className={`${baseImgClass} ${imgClassName}`.trim()}
      />
    </span>
  );
}
