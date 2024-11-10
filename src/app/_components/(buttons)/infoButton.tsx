import { FiInfo } from "react-icons/fi";
import { Button } from "~/components/ui/button";
import InfoPage from "../(dialogPages)/infoPage";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogTrigger } from "~/components/ui/dialog";


export default function InfoButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"personalIcon"} size={"icon"} className="py-2">
          <FiInfo size={34} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <VisuallyHidden.Root>
          <DialogTitle>Informazioni</DialogTitle>
          <DialogDescription>Informazioni sulla pagina</DialogDescription>
          <DialogHeader>Header</DialogHeader>
        </VisuallyHidden.Root>
        <InfoPage />
      </DialogContent>
    </Dialog>
  );
}
