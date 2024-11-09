import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { IoMdExit } from "react-icons/io";
import { useRouter } from "next/navigation";

export default function ExitGameButton() {
    const router = useRouter();

    const handleExit = () => {
        router.push("/");
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"personalIcon"} size={"icon"} className="text-light bg-second hover:bg-secondary/70 hover:text-dark">
                    <IoMdExit size={28} />
                </Button>
            </DialogTrigger>
            <DialogContent className="border-4 rounded-lg border-dark p-4">
                <div className="text-center">
                    <p className="mb-4 p-5 text-3xl font-bold">Sei sicuro di voler uscire?</p>
                    <div className="flex justify-center space-x-4">
                        <Button variant={"personalDestructive"} onClick={handleExit}>
                            Sì
                        </Button>
                        <DialogTrigger asChild>
                            <Button variant={"personal"}>
                                No
                            </Button>
                        </DialogTrigger>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
