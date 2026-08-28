'use client';

import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="flex h-full min-h-[360px] items-center justify-center bg-[#e7f0e9] text-sm font-medium text-[#6d7d73]">Loading live street map…</div>,
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

export default function CommandMap({ points }: { points: MapPoint[] }) {
  return <LeafletMap points={points} />;
}
