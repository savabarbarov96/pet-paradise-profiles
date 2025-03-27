import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-paradise-light/30 to-serenity-light/30 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-handwritten font-bold text-paradise mb-4">404</h1>
        <h2 className="text-2xl font-handwritten font-medium text-paradise-dark mb-6">Страницата не е намерена</h2>
        <p className="text-slate-600 mb-8 font-handwritten">
          Страницата, която търсите, не съществува или е преместена.
        </p>
        <Button asChild className="font-handwritten">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Към началната страница
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
