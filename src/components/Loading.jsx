function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

export default Loading;
