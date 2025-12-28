import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Icon component using Lucide React icons
 * @param {string} name - The name of the Lucide icon (e.g., 'BookOpen', 'Users')
 * @param {number} size - Icon size in pixels (default: 20)
 * @param {string} color - Icon color (optional, inherits from parent by default)
 * @param {string} className - Additional CSS classes
 * @param {number} strokeWidth - Stroke width (default: 2)
 */
const Icon = ({
  name,
  size = 20,
  color,
  className = '',
  strokeWidth = 2,
  ...props
}) => {
  const LucideIcon = LucideIcons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={`lucide-icon ${className}`}
      {...props}
    />
  );
};

export default Icon;
