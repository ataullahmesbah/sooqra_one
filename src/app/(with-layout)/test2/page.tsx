// src/app/page.tsx - Test everything
export default function Test2() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 font-display">
              🛍️ SOOQRA ONE
            </h1>
            <nav className="flex space-x-4">
              <button className="btn-outline">Login</button>
              <button className="btn-primary">Sign Up</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="section-padding bg-white">
        <div className="container-custom text-center">
          <h1 className="text-title mb-4">
            Welcome to SOOQRA ONE
          </h1>
          <p className="text-body max-w-2xl mx-auto mb-8">
            Your lightweight e-commerce solution for modern shopping experience. 
            Fast, reliable, and built with the latest technologies.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="btn-primary text-lg px-6 py-3">
              Start Shopping
            </button>
            <button className="btn-outline text-lg px-6 py-3">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <h2 className="text-subtitle text-center mb-12">Why Choose SOOQRA ONE?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Lightning Fast", desc: "Built for speed and performance" },
              { title: "Secure Payments", desc: "Safe and secure transaction system" },
              { title: "24/7 Support", desc: "Always here to help you" }
            ].map((feature, index) => (
              <div key={index} className="card-hover text-center fade-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-caption">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}