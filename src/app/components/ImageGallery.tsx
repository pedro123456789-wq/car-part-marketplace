import React, { useState } from "react";

interface ImageGalleryProps {
  imageUrls: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ imageUrls }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const handleImageClick = (url: string) => {
    setExpandedImage(url);
  };

  const handleCloseModal = () => {
    setExpandedImage(null);
  };

  return (
    <div>
      {/* Main Image */}
      {imageUrls[0] && (
        <div className="w-full h-64 md:h-96 mb-4">
          <img
            src={imageUrls[0]}
            alt="Part Image"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => handleImageClick(imageUrls[0])}
          />
        </div>
      )}

      {/* Thumbnail Images */}
      {imageUrls.length > 1 && (
        <div className="flex space-x-4">
          {imageUrls.slice(1).map((url, index) => (
            <div key={index} className="w-24 h-24">
              <img
                src={url}
                alt={`Part Image ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => handleImageClick(url)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Modal for Expanded Image */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <img
            src={expandedImage}
            alt="Expanded Part Image"
            className="max-h-full max-w-full"
          />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
