const RightPanelSkeleton = () => {
  return (
    <div className="theme-card p-4">
      <div className="flex gap-2 items-center">
        <div className="w-8 h-8 rounded-full shrink-0 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="flex flex-1 justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-2 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
          </div>
          <div className="h-6 w-14 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default RightPanelSkeleton;
