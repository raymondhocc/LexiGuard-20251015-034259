import { AI_USAGE_DISCLAIMER } from '@/lib/constants';
export function Footer() {
  return (
    <footer className="border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p className="font-semibold text-orange-500 mb-2">{AI_USAGE_DISCLAIMER}</p>
        <p>&copy; {new Date().getFullYear()} LexiGuard AI. All Rights Reserved.</p>
      </div>
    </footer>
  );
}