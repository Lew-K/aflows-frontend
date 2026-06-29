import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/apiFetch';

interface TourProgressEntry {
  tour_id: string;
  current_step: number;
  completed: boolean;
}

type TourProgressMap = Record<string, { current_step: number; completed: boolean }>;

export function useTourProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TourProgressMap | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoaded(false);
      return;
    }
    apiFetch(`https://api.aflows.uk/api/v1/tours`)
      .then(r => r.json())
      .then((rows: TourProgressEntry[]) => {
        const map: TourProgressMap = {};
        (rows || []).forEach(row => {
          map[row.tour_id] = { current_step: row.current_step, completed: row.completed };
        });
        setProgress(map);
      })
      .catch(() => setProgress({}))
      .finally(() => setLoaded(true));
  }, [user?.businessId]);

  const isCompleted = useCallback(
    (tourId: string) => progress?.[tourId]?.completed === true,
    [progress]
  );

  const markCompleted = useCallback((tourId: string) => {
    setProgress(prev => ({
      ...(prev ?? {}),
      [tourId]: { current_step: prev?.[tourId]?.current_step ?? 0, completed: true },
    }));
  }, []);

  return { progress, loaded, isCompleted, markCompleted };
}
