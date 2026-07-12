import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="bg-background h-screen overflow-hidden flex items-center justify-center">
      <SignUp />
    </div>
  );
}
