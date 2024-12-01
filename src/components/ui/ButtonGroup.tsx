import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'none' | 'sm' | 'md';
}

export const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = 'horizontal', spacing = 'none', ...props }, ref) => {
    const baseStyles = "inline-flex";
    
    const orientations = {
      horizontal: "flex-row",
      vertical: "flex-col"
    };

    const spacings = {
      none: orientation === 'horizontal' ? '-ml-px' : '-mt-px',
      sm: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
      md: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4'
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          orientations[orientation],
          spacings[spacing],
          className
        )}
        {...props}
      />
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';