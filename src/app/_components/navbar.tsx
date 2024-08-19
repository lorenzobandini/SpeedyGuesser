import { CiCircleInfo } from "react-icons/ci";
import { Button } from "~/components/ui/button";

export default function Navbar() {
  return (
    <nav className="flex justify-end bg-transparent p-2">
      <Button variant={"ghost"} size={"icon"}>
        <CiCircleInfo size={38} />  
      </Button>
    </nav>
  );
}
