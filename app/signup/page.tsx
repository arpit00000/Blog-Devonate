import { SignupForm } from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="newspaper-heading text-4xl text-primary mb-2">Devnovate</h1>
          <p className="newspaper-body text-muted-foreground">Modern Digital Newspaper</p>
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
