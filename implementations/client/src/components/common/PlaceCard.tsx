import './Common.css';

interface Props {
  emoji: string;
  name: string;
  address: string;
  selected?: boolean;
  onClick?: () => void;
}

export const PlaceCard = ({ emoji, name, address, selected, onClick }: Props) => (
  <div className={`place-card ${selected ? 'selected' : ''}`} onClick={onClick}>
    <div className="place-thumb">{emoji}</div>
    <div className="place-info">
      <h4 style={{ margin: 0, font: '700 20px var(--hand)' }}>{name}</h4>
      <div style={{ fontSize: '14px', color: 'var(--pencil)' }}>{address}</div>
    </div>
    <div style={{ fontSize: '24px' }}>{selected ? '✅' : '○'}</div>
  </div>
);
