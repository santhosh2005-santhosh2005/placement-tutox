export default function Footer() {
  return (
    <footer 
      className="border-t shadow-[var(--elevation-1)] rounded-tl-[var(--rounded)] rounded-tr-[var(--rounded)] p-5"
      style={{ 
        background: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[#1A73E8] text-white p-1 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div 
              className="text-sm"
              style={{ color: 'var(--text-alt)' }}
            >
              © {new Date().getFullYear()} UdaanIQ
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a 
              href="#" 
              className="hover:opacity-75 transition-opacity duration-200"
              style={{ color: 'var(--text-alt)' }}
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="hover:opacity-75 transition-opacity duration-200"
              style={{ color: 'var(--text-alt)' }}
            >
              Terms
            </a>
            <a 
              href="#" 
              className="hover:opacity-75 transition-opacity duration-200"
              style={{ color: 'var(--text-alt)' }}
            >
              Contact
            </a>
          </div>
          <div className="flex items-center">
            <button 
              className="p-2 rounded-full hover:bg-[var(--hover)] transition-colors duration-200"
              style={{ color: 'var(--text-alt)' }}
              aria-label="Help"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}