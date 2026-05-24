import { Suspense } from 'react';
import { ThankYouClient } from './ThankYouClient';

export default function ThankYouPage() {
  return (
    <main className="premium-bg grid min-h-screen place-items-center px-5">
      <Suspense fallback={<section className="text-white">Checking payment...</section>}>
        <ThankYouClient />
      </Suspense>
    </main>
  );
}
