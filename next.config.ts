/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
   
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // সব পাথ অনুমোদিত
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // আপনার প্রয়োজন মতো আরও ডোমেইন যোগ করুন
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**', // শুধুমাত্র /images/ ফোল্ডারের জন্য
      // },
    ],
  },
  
  // Turbopack root configuration (একাধিক lockfile সমস্যা সমাধানের জন্য)
  turbopack: {
    root: process.cwd(), // বর্তমান ওয়ার্কিং ডিরেক্টরি সেট করুন
  },
};

export default nextConfig;