import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-white text-4xl font-black tracking-tight">Mezan</h1>
        <p className="text-white/50 text-sm mt-1">Join the community.</p>
      </div>
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full max-w-sm',
            card: 'bg-[#1a1a1a] border border-white/10 shadow-xl rounded-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-white/50',
            socialButtonsBlockButton: 'bg-white/10 border-white/10 text-white hover:bg-white/20',
            socialButtonsBlockButtonText: 'text-white',
            formFieldLabel: 'text-white/70',
            formFieldInput: 'bg-white/10 border-white/10 text-white placeholder:text-white/30',
            formButtonPrimary: 'bg-[#FE2C55] hover:bg-[#e01f45]',
            footerActionLink: 'text-[#69C9D0]',
            dividerLine: 'bg-white/10',
            dividerText: 'text-white/30',
          },
        }}
      />
    </div>
  )
}
