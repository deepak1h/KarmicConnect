import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    images: string[];
    price?: string;
    priceOnRequest: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const placeholderImage = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
  
  return (
    <Card className="overflow-hidden category-hover" data-testid={`product-card-${product.slug}`}>
      <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        <img 
          src={product.images?.[0] || placeholderImage}
          alt={product.name}
          className="w-full h-full object-cover"
          data-testid={`product-image-${product.slug}`}
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-foreground mb-2" data-testid={`product-name-${product.slug}`}>
          {product.name}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`product-description-${product.slug}`}>
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          {product.priceOnRequest ? (
            <Badge variant="secondary" data-testid={`product-price-badge-${product.slug}`}>
              Price on Request
            </Badge>
          ) : product.price ? (
            <span className="text-lg font-semibold text-primary" data-testid={`product-price-${product.slug}`}>
              ${product.price}
            </span>
          ) : null}
        </div>

        <Link href={`/product/${product.slug}`} data-testid={`link-view-details-${product.slug}`}>
          <Button className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
