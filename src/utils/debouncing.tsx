import { useState, useEffect } from 'react';

export function useDebounce(value: unknown, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
  
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler); // Cleanup the timeout on value or delay change
    }, [value, delay]);
  
    return debouncedValue;
  }