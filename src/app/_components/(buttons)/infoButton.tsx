import { FiInfo } from "react-icons/fi";
import { Button } from "~/components/ui/button";

export default function InfoButton() {
  return (
    <Button variant={"personalIcon"} size={"icon"} className="py-2">
      <FiInfo size={34}/>
    </Button>
  );
}
