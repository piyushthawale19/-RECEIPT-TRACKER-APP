'use client';

import { useParams } from "next/dist/client/components/navigation";

function Receipt() {
    const params = useParams<{ id: string }>();
  return (
    <div>Receipt:{params.id}</div>
  )
}

export default Receipt