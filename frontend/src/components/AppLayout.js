import React, { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const AppLayout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className='bg-slate-50 min-h-screen flex flex-col font-sans antialiased overflow-hidden'>
            <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
            <div className='flex flex-1 relative' style={{ height: 'calc(100vh - 56px)' }}>
                {/* Sidebar component with responsive states */}
                <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
                
                {/* Main content viewport */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AppLayout