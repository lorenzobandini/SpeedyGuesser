'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from '~/components/ui/select';

interface SelectionFormProps {
  onStart: (language: string, time: string, passes: string) => void;
  buttonText: string;
}

export default function SelectionForm({
  onStart,
  buttonText,
}: SelectionFormProps) {
  const [language, setLanguage] = useState('IT');
  const [time, setTime] = useState('60');
  const [passes, setPasses] = useState('3');

  return (
    <div className="flex grow flex-col items-center justify-center px-4">
      <span className="m-6 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
        Speedy
        <span className="text-dark">Guesser</span>
      </span>
      <div className="grid w-full max-w-md grid-cols-2 gap-4 text-xl sm:text-2xl lg:text-3xl">
        <div className="flex items-center justify-start pr-4 font-bold">
          Language
        </div>
        <div className="flex justify-end">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="border-dark bg-second text-dark flex h-12 w-12 items-center justify-around rounded-xl border-2 border-dashed font-mono text-xl font-medium sm:h-16 sm:w-16 sm:text-2xl lg:h-20 lg:w-20 lg:text-3xl">
              <SelectValue placeholder="IT" />
            </SelectTrigger>
            <SelectContent className="border-dark bg-second text-dark border-dashed font-mono">
              <SelectGroup>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="EN">EN</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-start pr-4 font-bold">
          Time
        </div>
        <div className="flex justify-end">
          <Select value={time} onValueChange={setTime}>
            <SelectTrigger className="border-dark bg-second text-dark flex h-12 w-12 items-center justify-around rounded-xl border-2 border-dashed font-mono text-xl font-medium sm:h-16 sm:w-16 sm:text-2xl lg:h-20 lg:w-20 lg:text-3xl">
              <SelectValue placeholder="60" />
            </SelectTrigger>
            <SelectContent className="border-dark bg-second text-dark border-dashed font-mono">
              <SelectGroup>
                <SelectItem value="45">45</SelectItem>
                <SelectItem value="60">60</SelectItem>
                <SelectItem value="90">90</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-start pr-4 font-bold">
          Passes
        </div>
        <div className="flex justify-end">
          <Select value={passes} onValueChange={setPasses}>
            <SelectTrigger className="border-dark bg-second text-dark flex h-12 w-12 items-center justify-around rounded-xl border-2 border-dashed font-mono text-xl font-medium sm:h-16 sm:w-16 sm:text-2xl lg:h-20 lg:w-20 lg:text-3xl">
              <SelectValue placeholder="3" />
            </SelectTrigger>
            <SelectContent className="border-dark bg-second text-dark border-dashed font-mono">
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
        <Button
          variant={'personal'}
          size={'lg'}
          onClick={() => onStart(language, time, passes)}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
