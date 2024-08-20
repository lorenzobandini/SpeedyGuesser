import InfoButton  from "./(buttons)/infoButton";
import LogButton from "./(buttons)/logButton";
import ProfileButton from "./(buttons)/profileButton";

export default async function Navbar() {

  return (
    <nav className="flex justify-between bg-transparent p-3">
      <div className="flex items-center">
        <ProfileButton />
        <LogButton />
      </div>
      <InfoButton />
    </nav>
  );
}
