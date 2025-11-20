// src/app/page.tsx - Test everything
export default function Test2() {
  return (
    <div className="min-h-screen bg-gray-50">
     

      

      {/* Features Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom py-20">
          <h2 className="text-black text-center mb-12">Why Choose SOOQRA ONE?</h2>
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