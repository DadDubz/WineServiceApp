// src/components/ErrorPage.tsx
export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100">
      <h1 className="text-2xl font-bold text-red-700">404 - Page Not Found</h1>
      <p className="text-red-600">Sorry, the page you're looking for doesn't exist.</p>
    </div>
  );
}