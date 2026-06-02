import React from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import './SwipeVoteCard.css';

interface SwipeVoteCardProps {
  id: string;
  name: string;
  emoji: string;
  onVote: (id: string, direction: 'left' | 'right') => void;
}

export const SwipeVoteCard: React.FC<SwipeVoteCardProps> = ({ id, name, emoji, onVote }) => {
  const x = useMotionValue(0);
  
  // 드래그 거리에 따른 회전 및 투명도 조절
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  // 드래그 거리에 따른 텍스트 강조 (Like/Nope)
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-150, -50], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 150) {
      onVote(id, 'right');
    } else if (info.offset.x < -150) {
      onVote(id, 'left');
    }
  };

  return (
    <motion.div
      className="swipe-card-container"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.05, cursor: 'grabbing' }}
    >
      <div className="swipe-card paper-texture">
        {/* Like/Nope Indicators */}
        <motion.div className="stamp like" style={{ opacity: likeOpacity }}>LIKE</motion.div>
        <motion.div className="stamp nope" style={{ opacity: nopeOpacity }}>NOPE</motion.div>
        
        <div className="card-content">
          <div className="card-emoji">{emoji}</div>
          <h3 className="card-name">{name}</h3>
        </div>
        
        <div className="card-footer">
          <p className="scribble-text">Swipe right to like, left to skip!</p>
        </div>
      </div>
    </motion.div>
  );
};
