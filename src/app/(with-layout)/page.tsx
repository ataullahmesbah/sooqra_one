import CategoryGrid from "@/src/components/Category/CategoryGrid/CategoryGrid";
import Banner from "@/src/components/Share/Home/Banner/Banner";


const page = () => {
    return (
        <>
            {/* Hero Banner */}

            <Banner />

            {/* Category Grid */}
            <CategoryGrid />

        </>
    );
};

export default page;