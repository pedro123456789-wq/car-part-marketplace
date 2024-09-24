import Listings from "../listings/page";

const MyPartsPage: React.FC = () => {
    return (
        <Listings isListSelf={true} />
    )
}

export default MyPartsPage;

//TODO:
// Finish my parts page
// Add filters for parts in the landing page
// Add images with cloudflare R2
// Add related parts and other parts in the same vehicle
// Add quick add functionality