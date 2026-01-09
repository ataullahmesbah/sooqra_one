import CategoryGrid from "@/src/components/Category/CategoryGrid/CategoryGrid";
import ProductCard from "@/src/components/products/ProductCard/ProductCard";
import AllProductsList from "@/src/components/Share/Home/AllProducts/AllProductsList";
import Banner from "@/src/components/Share/Home/Banner/Banner";
import BrandStorySection from "@/src/components/Share/Home/BrandStorySection/BrandStorySection";
import NewArrival from "@/src/components/Share/Home/NewArrival/NewArrival";


const page = () => {
    return (
        <>
            {/* Hero Banner */}

            <Banner />

            {/* Category Grid */}
            <CategoryGrid />

            {/* New Arrival */}
            <NewArrival />

            {/* Product Listing */}
            <AllProductsList />

            {/* Brand Story */}
            <BrandStorySection />




        </>
    );
};

export default page;