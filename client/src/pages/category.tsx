import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product-card";
import { Card, CardContent } from "@/components/ui/card";

export default function Category() {
  const { slug } = useParams();
  
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ["/api/categories", slug],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!category,
  });

  const categoryProducts = products?.filter((product: any) => product.categoryId === category?.id);

  if (categoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-2/3 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="category-not-found">
            Category Not Found
          </h1>
          <p className="text-muted-foreground">
            The requested category could not be found.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Category Header */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4" data-testid="category-title">
            {category.name}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl" data-testid="category-description">
            {category.description}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {productsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden" data-testid={`product-skeleton-${i}`}>
                  <div className="h-48 bg-muted animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted animate-pulse mb-3 rounded"></div>
                    <div className="h-4 bg-muted animate-pulse mb-2 rounded"></div>
                    <div className="h-4 bg-muted animate-pulse mb-4 rounded w-3/4"></div>
                    <div className="h-8 bg-muted animate-pulse rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categoryProducts && categoryProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="products-grid">
              {categoryProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16" data-testid="no-products">
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                No Products Available
              </h2>
              <p className="text-muted-foreground">
                Products in this category will be available soon.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
