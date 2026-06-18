import CategoryGrid from "@/src/components/Category/CategoryGrid/CategoryGrid";
import PromotionalBanner from "@/src/components/common/PromotionalBanner";
import ShopAds from "@/src/components/Dashboard/Shop/ShopAds/ShopAds";
import EmailSubscription from "@/src/components/EmailSubscription/EmailSubscription";
import HomepageFAQ from "@/src/components/HomepageFAQ/HomepageFAQ";
import ProductPromotion from "@/src/components/product-promotion/product-promotion";
import ProductCard from "@/src/components/products/ProductCard/ProductCard";
import AllProductsList from "@/src/components/Share/Home/AllProducts/AllProductsList";
import Banner from "@/src/components/Share/Home/Banner/Banner";
import BrandStorySection from "@/src/components/Share/Home/BrandStorySection/BrandStorySection";
import TopSelling from "@/src/components/Top-Selling/Top-Selling";


const page = () => {
    return (
        <>

            <PromotionalBanner showCloseButton={true} />
            {/* ShopAds  */}
            <ShopAds />

            <div className="container mx-auto py-10 p-2">
                <Banner />
            </div>

            {/* Category Grid */}
            <CategoryGrid />

            {/* Top Selling */}
            <TopSelling />

            {/* Product Listing */}
            <AllProductsList />

            <ProductPromotion />

            {/* Brand Story */}
            <BrandStorySection />

            {/* Home FAQ */}
            <HomepageFAQ />

            {/* Subscribe Email */}
            <EmailSubscription />

        </>
    );
};

export default page;