import { Suspense } from 'react';
import { Room } from './components/room';
import { RoomLoader } from './components/room-loader';

export default function Page() {
  return (
    <Suspense fallback={<RoomLoader />}>
      <Room />
    </Suspense>
  );
}
