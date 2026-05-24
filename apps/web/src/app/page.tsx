import { apiGet } from '@/lib/api';
import { LandingPage } from '@/components/LandingPage';

export default async function Page() {
  await apiGet('/api/public/landing', null);
  return <LandingPage />;
}
