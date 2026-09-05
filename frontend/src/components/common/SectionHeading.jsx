import ScrollReveal from '../reveal/ScrollReveal';
import MaskText from '../reveal/MaskText';

export default function SectionHeading({ eyebrow, title, description, align = 'center', as: Tag = 'h2' }) {
  return (
    <ScrollReveal
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}
      delay={0.05}
    >
      {eyebrow && (
        <MaskText delay={0.1}>
          <p className="eyebrow mb-4">{eyebrow}</p>
        </MaskText>
      )}

      <MaskText delay={0.2}>
        <Tag className={`font-display font-bold leading-[1.15] text-text ${Tag === 'h1' ? 'text-4xl sm:text-5xl md:text-6xl tracking-tight' : 'text-[2rem] sm:text-[2.5rem]'}`}>
          {typeof title === 'string'
            ? title.split('|').map((part, i) =>
                i % 2 === 1
                  ? <span key={i} className="text-gradient">{part}</span>
                  : <span key={i}>{part}</span>
              )
            : title
          }
        </Tag>
      </MaskText>

      {description && (
        <MaskText delay={0.3}>
          <p className="mt-4 text-base leading-relaxed text-sub">
            {description}
          </p>
        </MaskText>
      )}
    </ScrollReveal>
  );
}
