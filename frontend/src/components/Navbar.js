import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing user from localStorage:", e);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Successfully logged out');
    navigate('/login');
  };

  // Get user initials (e.g. "John Doe" -> "JD")
  const userInitials = user && user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className='bg-white border-b border-slate-200 h-14 flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm'>
      {/* Brand Logo & Mobile Trigger */}
      <div className='flex items-center space-x-3'>
        {/* Mobile Hamburger menu */}
        <button 
          onClick={toggleSidebar} 
          className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden'
          aria-label='Toggle Sidebar'
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5.5 h-5.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Branding Logo */}
        <Link to="/" className='flex items-center space-x-2 text-indigo-600 font-bold text-xl tracking-tight'>
          <div className='bg-indigo-600 text-white p-1 rounded-lg shadow-sm flex items-center justify-center'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className='text-slate-800 font-extrabold font-sans'>TaskFlow</span>
        </Link>
      </div>

      {/* User profile info & Logout */}
      <div className='flex items-center space-x-4'>
        {user && (
          <div className='flex items-center space-x-2'>
            <div className='w-8.5 h-8.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold flex items-center justify-center text-sm border border-indigo-100 shadow-sm'>
              {userInitials}
            </div>
            <span className='hidden sm:inline-block text-sm font-medium text-slate-700'>
              {user.name}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className='flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500'
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Navbar