import { FiInfo } from "react-icons/fi";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import InfoPage from "../(dialogPages)/infoPage";

export default function InfoButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"personalIcon"} size={"icon"} className="py-2">
          <FiInfo size={34} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <InfoPage />
      </DialogContent>
    </Dialog>
  );
}
