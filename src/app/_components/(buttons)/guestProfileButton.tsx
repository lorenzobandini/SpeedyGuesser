import { Button } from "~/components/ui/button";
import Image from "next/image";

export default async function ProfileButton() {

  return (
        <Button variant={"personal"} className="group flex items-center py-2">
          <div className="relative mr-2 flex h-12 items-center justify-center">
              <>
                <Image
                  src="/profile-simple.svg"
                  alt="User profile"
                  width={34}
                  height={34}
                  className="flex rounded-full"
                />
                <Image
                  src="/profile-simple-hover.svg"
                  alt="User profile hover"
                  width={34}
                  height={34}
                  className="absolute hidden rounded-full group-hover:flex"
                />
              </>
          </div>
          <span>Guest</span>
        </Button>
      
  );
}
