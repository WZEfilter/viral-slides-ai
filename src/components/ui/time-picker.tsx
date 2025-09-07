import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, className }) => {
  const [hours, minutes] = value.split(':');
  
  const hoursOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutesOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleHoursChange = (newHours: string) => {
    onChange(`${newHours}:${minutes}`);
  };

  const handleMinutesChange = (newMinutes: string) => {
    onChange(`${hours}:${newMinutes}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={hours} onValueChange={handleHoursChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hoursOptions.map((hour) => (
            <SelectItem key={hour} value={hour}>
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <span className="text-muted-foreground">:</span>
      
      <Select value={minutes} onValueChange={handleMinutesChange}>
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutesOptions.map((minute) => (
            <SelectItem key={minute} value={minute}>
              {minute}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};