import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "~/components/ui/select";
import Navbar from "../_components/navbar";
import SettingsoButton from "../_components/(buttons)/settingsButton";
import BackButton from "../_components/(buttons)/backButton";

export default function SpeedGuess() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-main text-dark">
      <Navbar />
      <div className="flex flex-grow flex-col items-center justify-center">
        <h1 className="mb-10 text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          <span className="text-light">Speedy</span>
          <span className="text-dark">Guesser</span>
        </h1>

        <div className="grid w-full max-w-md grid-cols-2 gap-4 text-3xl">
          <div className="flex items-center justify-start pr-4 font-bold ">
            Language
          </div>
          <div className="flex justify-end">
            <Select>
              <SelectTrigger className="flex h-20 w-20 items-center justify-around rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-medium text-dark">
                <SelectValue placeholder="IT" />
              </SelectTrigger>
              <SelectContent className=" border-dashed border-dark bg-second font-mono text-dark">
                <SelectGroup>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="EN">EN</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-start pr-4 text-3xl font-bold">
            Time
          </div>
          <div className="flex justify-end">
            <Select>
              <SelectTrigger className="flex h-20 w-20 items-center justify-around rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-medium text-dark">
                <SelectValue placeholder="60" />
              </SelectTrigger>
              <SelectContent className=" border-dashed  border-dark bg-second font-mono text-dark">
                <SelectGroup>
                  <SelectItem value="45">45</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="90">90</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-start pr-4 text-3xl font-bold">
            Passes
          </div>
          <div className="flex justify-end">
            <Select>
              <SelectTrigger className="flex h-20 w-20 items-center justify-around rounded-xl border-2 border-dashed border-dark bg-second font-mono text-3xl font-medium text-dark">
                <SelectValue placeholder="3" />
              </SelectTrigger>
              <SelectContent className=" border-dashed border-dark bg-second font-mono text-dark">
                <SelectGroup>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Button variant={"personal"} size={"xl"}>
            Start Game
          </Button>
        </div>
      </div>
      <div className="flex w-full items-center justify-between p-4">
        <BackButton />
        <SettingsoButton />
      </div>
    </div>
  );
}
