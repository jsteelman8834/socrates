import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'shadow-xl rounded-2xl',
            headerTitle: 'text-2xl font-bold',
            headerSubtitle: 'text-gray-600',
            formButtonPrimary:
              'bg-primary-500 hover:bg-primary-600 text-white rounded-xl',
          },
        }}
        afterSignInUrl="/"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
