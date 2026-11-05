const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-pastel-pink-200 rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-4 border-transparent border-t-pastel-pink-500 rounded-full animate-spin absolute top-0 left-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="text-2xl">🎀</span>
        </div>
      </div>
    </div>
  )
}

export default Loading