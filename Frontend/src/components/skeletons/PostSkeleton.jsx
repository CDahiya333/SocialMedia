const PostSkeleton = () => {
	return (
		<div className='flex flex-col gap-4 w-full p-4 border-b border-border-light dark:border-border-dark'>
			<div className='flex gap-4 items-center'>
				<div className='w-10 h-10 rounded-full shrink-0 bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
				<div className='flex flex-col gap-2'>
					<div className='h-2 w-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
					<div className='h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
				</div>
			</div>
			<div className='h-40 w-full rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse'></div>
		</div>
	);
};

export default PostSkeleton;