'use client';

import * as React from 'react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, disabled, children }) => {
  return (
    <SelectContext.Provider value={{ value, onValueChange, disabled }}>
      {children}
    </SelectContext.Provider>
  );
};

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className = '', children, ...props }, ref) => {
  const { disabled } = React.useContext(SelectContext);
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      {...props}
    >
      {children}
    </button>
  );
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return <span>{value || placeholder}</span>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-popover text-popover-foreground py-1 shadow-lg">
      {children}
    </div>
  );
};

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className = '', value, children, ...props }, ref) => {
  const { onValueChange, disabled } = React.useContext(SelectContext);

  return (
    <div
      ref={ref}
      className={`relative flex cursor-pointer select-none items-center px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={() => !disabled && onValueChange?.(value)}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
