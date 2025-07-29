'use client';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { IoMdSettings } from 'react-icons/io';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import SettingsPage from '../(dialogPages)/settingsPage';

export default function SettingsButton() {
  return (
    <Dialog>
      <VisuallyHidden>
        <DialogTitle>Impostazioni</DialogTitle>
        <DialogDescription>
          Configura le impostazioni dell&apos;applicazione
        </DialogDescription>
      </VisuallyHidden>
      <DialogTrigger asChild>
        <Button variant={'personalIcon'} size={'icon'}>
          <IoMdSettings size={32} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <SettingsPage />
      </DialogContent>
    </Dialog>
  );
}
