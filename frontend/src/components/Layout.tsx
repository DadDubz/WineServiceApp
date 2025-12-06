import { ReactNode } from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F5F0' }}>
      <Navigation />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;