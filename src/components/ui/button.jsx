export function Button({ children, onClick, variant = 'default', className = '' }) {
  const baseStyle = 'px-4 py-2 rounded font-semibold cursor-pointer transition';
  const variants = {
    default: 'bg-blue-500 text-white hover:bg-blue-600',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100'
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}