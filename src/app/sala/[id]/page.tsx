import { Suspense } from "react";
import { RoomLoader } from "./components/room-loader";
import { Room } from "./components/room";

export default function Page() {
  return (
    <Suspense fallback={<RoomLoader />}>
      <Room />
    </Suspense>
  );
}
