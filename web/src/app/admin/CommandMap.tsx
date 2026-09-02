'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#e8eeea] text-[12px] font-medium text-[#6d7d73]">
      Loading map…
    </div>
  ),
});

type MapPoint = {
  id: string;
  title: string;
  type: string;
  locationName: string;
  status: string;
  latitude: number;
  longitude: number;
};

interface CommandMapProps {
  points: MapPoint[];
  fullscreen?: boolean;
}

export default function CommandMap({ points, fullscreen }: CommandMapProps) {
  return (
    <div className={fullscreen ? 'h-full w-full' : 'h-full w-full'}>
      <LeafletMap points={points} fullscreen={fullscreen} />
    </div>
  );
}
