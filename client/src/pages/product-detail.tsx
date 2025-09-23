import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ImageGallery from "@/components/image-gallery";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProductDetail() {
  const { slug } = useParams();
  
  const { data: product, isLoading } = useQuery({
    queryKey: ["/api/products", slug],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-muted rounded-lg"></div>
              <div>
                <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2 w-5/6"></div>
                <div className="h-4 bg-muted rounded mb-8 w-4/6"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="product-not-found">
            Product Not Found
          </h1>
          <p className="text-muted-foreground">
            The requested product could not be found.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div data-testid="product-images">
            <ImageGallery images={product.images || []} alt={product.name} />
          </div>

          {/* Product Information */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="product-title">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="mb-6">
              {product.priceOnRequest ? (
                <Badge variant="secondary" className="text-lg py-2 px-4" data-testid="product-price-badge">
                  Price on Request
                </Badge>
              ) : product.price ? (
                <span className="text-2xl font-bold text-primary" data-testid="product-price">
                  ${product.price}
                </span>
              ) : null}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
                {product.description}
              </p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <Card className="mb-8" data-testid="product-specifications">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Specifications</h2>
                  <div className="space-y-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="font-medium text-foreground capitalize" data-testid={`spec-key-${key}`}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-muted-foreground" data-testid={`spec-value-${key}`}>
                          {value as string}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Link href="/quotation" data-testid="button-get-quote">
                <Button size="lg" className="w-full bg-primary text-primary-foreground hover:opacity-90">
                  Get Quote for This Product
                </Button>
              </Link>
              <Link href={`/category/${product.categoryId}`} data-testid="button-view-similar">
                <Button size="lg" variant="outline" className="w-full">
                  View Similar Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
