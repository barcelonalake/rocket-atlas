'use client';
import { createContext, useContext, useMemo, useRef } from 'react';
import { Vehicle } from '@/lib/vehicle';
import { DEF_BY_ID } from '@/lib/defs';
import { useStore } from '@/store/useStore';

const Ctx = createContext<Vehicle | null>(null);
export const useVehicle = () => useContext(Ctx);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const vehicleId = useStore((s) => s.vehicleId);
  const cache = useRef<Map<string, Vehicle>>(new Map());

  const vehicle = useMemo(() => {
    let v = cache.current.get(vehicleId);
    if (!v) {
      v = new Vehicle(DEF_BY_ID[vehicleId]);
      cache.current.set(vehicleId, v);
    }
    return v;
  }, [vehicleId]);

  return <Ctx.Provider value={vehicle}>{children}</Ctx.Provider>;
}
