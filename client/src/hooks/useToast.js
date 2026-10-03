import { useEffect, useState } from 'react';

const VISIBLE_MS = 3500;

export function useToast() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [message]);

  return [message, setMessage];
}
