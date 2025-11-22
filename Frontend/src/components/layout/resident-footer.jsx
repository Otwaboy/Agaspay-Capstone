export default function ResidentFooter() {
  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
        {/* About Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">About AGASPAY</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            A comprehensive water billing and management platform serving Barangay Biking,
            streamlining operations for efficient water service delivery.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <a href="/" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
            </li>
            <li>
              <a href="/admin-dashboard/billing" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Payment History</a>
            </li>
            <li>
              <a href="/admin-dashboard/incidents" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Water Usage</a>
            </li>
            <li>
              <a href="/admin-dashboard/settings" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Reading History</a>
            </li>
          </ul>
        </div>

        {/* Contact & Support */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact & Support</h3>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>Barangay Biking, Dauis, Bohol</li>
            <li>Contact: +63 123 456 7890</li>
            <li>Email: admin@agaspay.com</li>
            <li className="text-gray-500 mt-3">
              System Version: v1.0.0
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} AGASPAY Water Management System. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Powered by AGASPAY Technology | Last updated: {new Date().toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
