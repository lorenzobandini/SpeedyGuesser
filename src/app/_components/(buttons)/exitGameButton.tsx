import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
} from "~/components/ui/dialog";
import { IoMdExit } from "react-icons/io";
import { useRouter } from "next/navigation";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function ExitGameButton() {
  const router = useRouter();

  const handleExit = () => {
    router.push("/");
  };

  return (
    <Dialog>
      <VisuallyHidden.Root>
        <DialogTitle>Domanda di Uscire</DialogTitle>
      </VisuallyHidden.Root>
      <DialogTrigger asChild>
        <Button
          variant={"personalIcon"}
          size={"icon"}
          className="bg-second text-light hover:bg-secondary/70 hover:text-dark"
        >
          <IoMdExit size={28} />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-lg border-4 border-dark p-4">
        <div className="text-center">
          <p className="mb-4 p-5 text-3xl font-bold">
            Sei sicuro di voler uscire?
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant={"personalDestructive"} onClick={handleExit}>
              Sì
            </Button>
            <DialogTrigger asChild>
              <Button variant={"personal"}>No</Button>
            </DialogTrigger>
          </div>
        </div>
        <VisuallyHidden.Root>
          <DialogTitle>Informazioni</DialogTitle>
          <DialogDescription>Informazioni sulla pagina</DialogDescription>
          <DialogHeader>Header</DialogHeader>
        </VisuallyHidden.Root>
      </DialogContent>
    </Dialog>
  );
}
