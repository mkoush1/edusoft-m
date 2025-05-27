import React, { useState } from "react";
import { Link } from "react-router-dom";

const CourseCard = ({
  title,
  description,
  institution,
  duration,
  link,
  image,
}) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className="h-48 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#592538]/80">
          {institution}
        </span>
        <span className="text-sm text-gray-500">{duration}</span>
      </div>
      <h3 className="text-xl font-bold text-[#592538] mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block px-4 py-2 bg-[#592538] text-white rounded-lg hover:bg-[#6d2c44] transition duration-300"
      >
        Learn More
      </a>
    </div>
  </div>
);

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F8]">
      {/* Navbar */}
      <header className="bg-[#592538]">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center space-x-3">
                <Link to="/">
                  <img
                    src="/eduSoft_logo.png"
                    alt="EduSoft Logo"
                    className="h-8 sm:h-10 w-auto"
                  />
                </Link>
                <Link to="/">
                  <img
                    src="/logo-02.png"
                    alt="ASPU Logo"
                    className="h-8 sm:h-10 w-auto"
                  />
                </Link>
              </div>
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="sm:hidden text-white"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile menu */}
            <div
              className={`${isMenuOpen ? "block" : "hidden"} sm:hidden w-full`}
            >
              <div className="flex flex-col space-y-4 py-4">
                <Link to="/" className="text-white text-lg font-normal">
                  Home
                </Link>
                <Link to="/features" className="text-white text-lg font-normal">
                  Features
                </Link>
                <Link to="/about" className="text-white text-lg font-normal">
                  About us
                </Link>
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-[#592538] hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-[#592538] hover:bg-gray-50"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>

            {/* Desktop menu */}
            <div className="hidden sm:flex items-center space-x-8 lg:space-x-12">
              <Link
                to="/"
                className="text-white text-lg lg:text-xl font-normal"
              >
                Home
              </Link>
              <Link
                to="/features"
                className="text-white text-lg lg:text-xl font-normal"
              >
                Features
              </Link>
              <Link
                to="/about"
                className="text-white text-lg lg:text-xl font-normal"
              >
                About us
              </Link>
            </div>
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 sm:px-6 py-1.5 text-sm sm:text-base font-medium rounded-lg bg-white text-[#592538] hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 sm:px-6 py-1.5 text-sm sm:text-base font-medium rounded-lg bg-white text-[#592538] hover:bg-gray-50"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8 sm:py-12 lg:py-16">
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start mb-16">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 pt-4 sm:pt-12">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-[#592538] text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  Welcome to EduSoft
                </h1>
                <h2 className="text-[#592538] text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                  Your Personal Soft Skills Development Hub!
                </h2>
              </div>
              <p className="text-[#592538] text-lg sm:text-xl leading-relaxed">
                At EduSoft, we are committed to empowering IT students with
                essential soft skills that are crucial for success in the modern
                workforce. Our platform offers a comprehensive,
                technology-driven approach to assessing and improving your
                communication, teamwork, leadership, problem-solving, and other
                core competencies.
              </p>
              <div>
                <Link
                  to="/signup"
                  className="inline-block px-6 sm:px-8 lg:px-10 py-3 sm:py-4 text-lg sm:text-xl font-medium rounded-xl sm:rounded-2xl bg-[#592538] text-white hover:bg-[#6d2c44] transition duration-300"
                >
                  Let's Get Started!
                </Link>
              </div>
            </div>

            {/* Right Images */}
            <div className="grid grid-cols-12 gap-3 sm:gap-4 pt-4 sm:pt-8">
              <div className="col-span-7 space-y-3 sm:space-y-4">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/studying.png"
                    alt="Student studying"
                    className="w-full h-[200px] sm:h-[280px] object-cover"
                  />
                </div>
                <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src="/professional-woman.png"
                    alt="Professional woman"
                    className="w-full h-[200px] sm:h-[280px] object-cover"
                  />
                </div>
              </div>
              <div className="col-span-5">
                <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg h-[420px] sm:h-[580px]">
                  <img
                    src="/graduate.png"
                    alt="Graduate"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 sm:py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[#592538] text-sm sm:text-base">
            © {new Date().getFullYear()} EduSoft. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
