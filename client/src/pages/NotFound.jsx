import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-7xl font-black text-primary mb-2">404</h1>
      <p className="text-xl font-bold text-foreground mb-1">Page Not Found</p>
      <p className="text-muted-foreground text-sm mb-6">The page you're looking for doesn't exist.</p>
      <Button onClick={() => navigate('/')} className="font-bold">Go to Dashboard</Button>
    </div>
  );
}
