import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const placeholderImage = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
  const displayImages = images.length > 0 ? images : [placeholderImage];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  return (
    <div className="space-y-4" data-testid="image-gallery">
      {/* Main Image */}
      <Card className="relative overflow-hidden" data-testid="main-image-container">
        <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10">
          <img 
            src={displayImages[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            data-testid="main-image"
          />
          
          {/* Navigation arrows (only show if multiple images) */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={prevImage}
                data-testid="button-prev-image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={nextImage}
                data-testid="button-next-image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Thumbnail Grid (only show if multiple images) */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2" data-testid="thumbnail-grid">
          {displayImages.map((image, index) => (
            <Card 
              key={index}
              className={`cursor-pointer overflow-hidden transition-all ${
                index === currentIndex ? 'ring-2 ring-primary' : 'hover:opacity-80'
              }`}
              onClick={() => setCurrentIndex(index)}
              data-testid={`thumbnail-${index}`}
            >
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-secondary/10">
                <img 
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
