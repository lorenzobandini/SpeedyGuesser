import { Button } from "~/components/ui/button";
import { IoMdSettings } from "react-icons/io";

export default function SettingsoButton() {
  return (
    <Button variant={"personalIcon"} size={"icon"}>
        <IoMdSettings size={32} />
    </Button>
  );
}
