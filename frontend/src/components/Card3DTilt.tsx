import React, { useRef, useState, MouseEvent } from 'react';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  id?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export const Card3DTilt: React.FC<Card3DTiltProps> = ({
  children,
  className = '',
  intensity = 10,
  id,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    setTransform(
      `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.012, 1.012, 1.012)`
    );

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.14,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-150 ease-out will-change-transform ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}

      {/* Dynamic 3D Glare / Specular Sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-20"
        style={{
          opacity: glarePos.opacity,
          background: `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.45), transparent 70%)`,
        }}
      />
    </div>
  );
};
