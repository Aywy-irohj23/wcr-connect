// Simple component to test if Tailwind CSS is working
export default function TailwindTest() {
  return (
    <div className="p-8 bg-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">Tailwind Test</h1>
      <p className="mt-2">If you can see this styled properly, Tailwind is working!</p>
    </div>
  );
}

