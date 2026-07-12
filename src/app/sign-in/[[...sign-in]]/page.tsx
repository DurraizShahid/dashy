import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="bg-background h-screen overflow-hidden flex items-center justify-center">
      <SignIn />
    </div>
  );
}
