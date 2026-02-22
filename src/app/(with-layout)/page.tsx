import CategoryGrid from "@/src/components/Category/CategoryGrid/CategoryGrid";
import ShopAds from "@/src/components/Dashboard/Shop/ShopAds/ShopAds";
import EmailSubscription from "@/src/components/EmailSubscription/EmailSubscription";
import ProductCard from "@/src/components/products/ProductCard/ProductCard";
import AllProductsList from "@/src/components/Share/Home/AllProducts/AllProductsList";
import Banner from "@/src/components/Share/Home/Banner/Banner";
import BrandStorySection from "@/src/components/Share/Home/BrandStorySection/BrandStorySection";
import NewArrival from "@/src/components/Share/Home/NewArrival/NewArrival";


const page = () => {
    return (
        <>

            {/* ShopAds  */}
            <ShopAds />

            <div className="container mx-auto py-10 p-2">
                <Banner />
            </div>


            {/* Category Grid */}
            <CategoryGrid />

            {/* New Arrival */}
            <NewArrival />

            {/* Product Listing */}
            <AllProductsList />

            {/* Brand Story */}
            <BrandStorySection />

            {/* Subscribe Email */}
            <EmailSubscription />




        </>
    );
};

export default page;