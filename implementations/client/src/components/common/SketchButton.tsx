import './Common.css';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary';
}

export const SketchButton = ({ children, variant = 'default', className = '', ...props }: Props) => (
  <button className={`sketch-btn ${variant === 'primary' ? 'primary' : ''} ${className}`} {...props}>
    {children}
  </button>
);
