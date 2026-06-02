import './Common.css';

interface Props {
  children: React.ReactNode;
  color?: 'yellow' | 'pink';
  className?: string;
}

export const StickyNote = ({ children, color = 'yellow', className = '' }: Props) => (
  <div className={`sticky-note ${color} ${className}`}>
    <div className="tape"></div>
    {children}
  </div>
);
