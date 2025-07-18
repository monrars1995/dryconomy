import React from 'react';

const WaterDropSVG = ({ sx = {} }) => {
  // Extrair valores primitivos do objeto sx
  const getSize = (size) => {
    if (typeof size === 'number') return size;
    if (typeof size === 'string' && size.endsWith('px')) return parseInt(size, 10);
    return 48; // default size
  };
  
  const width = getSize(sx.width) || getSize(sx.fontSize) || 48;
  const height = getSize(sx.height) || getSize(sx.fontSize) || 48;
  const color = sx.color || 'currentColor';
  
  // Remover essas propriedades do objeto de estilo para evitar duplicação
  const { fontSize, ...restStyles } = sx;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill={color}
      style={restStyles}
    >
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
    </svg>
  );
};

export default WaterDropSVG;
