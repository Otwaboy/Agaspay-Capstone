import { useState } from 'react';

export function  LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showWaterSteps, setShowWaterSteps] = useState(false); // State for toggling water steps
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Simple validation: In a real app, you'd send these credentials to a backend
    if (username === 'user' && password === 'password') {
      setMessage('Login successful! Welcome.');
      // In a real application, you would typically redirect the user
      // or set an authentication token here.
    } else {
      setMessage('Invalid username or password. Please try again.');
    }
    // Clear the form fields after submission
    setUsername('');
    setPassword('');
  };

  const toggleWaterSteps = () => {
    setShowWaterSteps(!showWaterSteps); // Toggle the visibility of the steps
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

  return (
    // Main container for the login form and other content, centered on the screen
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      {/* Login card container */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200 mb-6">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h2>

        {/* Display messages to the user */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-medium ${
            message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin}>
          {/* Username input group */}
          <div className="mb-6">
            <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password input group with eye icon */}
          <div className="mb-8 relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-200 ease-in-out pr-10" // Add padding-right for icon
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button" // Important: type="button" to prevent form submission
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pt-8 text-gray-600 hover:text-gray-900 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {/* Eye icon - SVG for clarity and customization */}
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.988 5.844A2.083 2.083 0 014.2 5.5c.593-.456 1.401-.7 2.21-.7C14.7 4.8 19.3 10.4 20.9 12a1.71 1.71 0 010 1.9c-1.6 1.6-6.2 7.2-14.5 7.2A1.9 1.9 0 013.9 20.5c-.2-.4-.3-1-.3-1.6V8.16l1.2-1.2A3 3 0 013.9 5.8z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M22 22L2 2" /> {/* Line through for hide */}
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="cursor-pointer w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
        </form>
      </div>

      {/* Button to toggle water connection steps */}
      <button
        onClick={toggleWaterSteps}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition duration-200 ease-in-out transform hover:scale-105 mb-6"
      >
        {showWaterSteps ? 'Hide Steps for New Water Connection' : 'Show Steps for New Water Connection'}
      </button>

      {/* Water Connection Steps Section (conditionally rendered) */}
      {showWaterSteps && (
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
          <h3 className="text-2xl font-bold text-center mb-6 text-green-700">Steps for New Water Connection</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-3">
            <li>
              <span className="font-semibold">Step 1: Application Form</span><br />
              Download and fill out the official application form from your local water authority's website or collect it from their office.
            </li>
            <li>
              <span className="font-semibold">Step 2: Required Documents</span><br />
              Gather all necessary documents, which typically include:
              <ul className="list-circle list-inside ml-5 mt-1 space-y-1">
                <li>Proof of ownership (e.g., land title, deed of sale).</li>
                <li>Valid ID of the applicant.</li>
                <li>Building permit (if applicable).</li>
                <li>Location sketch/map of the property.</li>
                <li>Barangay clearance.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold">Step 3: Submission & Inspection</span><br />
              Submit your complete application and documents to the water service provider. An inspector will schedule a visit to your property to assess the connection feasibility.
            </li>
            <li>
              <span className="font-semibold">Step 4: Payment of Fees</span><br />
              Once approved, you will be notified of the connection fees, which include installation charges, meter costs, and other applicable fees. Make the payment at authorized payment centers.
            </li>
            <li>
              <span className="font-semibold">Step 5: Connection & Meter Installation</span><br />
              After payment, the water service provider will proceed with the actual water connection and meter installation at your property.
            </li>
            <li>
              <span className="font-semibold">Step 6: Water Flow!</span><br />
              Your new water connection is now active.
            </li>
          </ul>
          <p className="mt-6 text-sm text-gray-600 text-center">
            *Please note that requirements may vary based on your specific location and local water service provider.
          </p>
        </div>
      )}
    </div>
  );
}


