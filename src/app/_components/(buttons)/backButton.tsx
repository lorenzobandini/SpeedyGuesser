"use client"

import { IoArrowBackOutline } from "react-icons/io5";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };

  return (
    <Button variant={"personalIcon"} size={"icon"} onClick={handleBackClick}>
      <IoArrowBackOutline size={32} />
    </Button>
  );
}
