import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { IoMdSettings } from "react-icons/io";
import SettingsPage from "../(dialogPages)/settingsPage";

export default function SettingsButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"personalIcon"} size={"icon"}>
          <IoMdSettings size={32} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <SettingsPage/>
      </DialogContent>
    </Dialog>
  );
}
