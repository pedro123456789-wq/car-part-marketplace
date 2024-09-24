const LoadingIndicator: React.FC = () => {
  return (
    <div className="h-screen bg-white flex flex-col items-center justify-center">
      <span className="loading loading-ring loading-lg text-black"></span>
    </div>
  );
};

export default LoadingIndicator;
