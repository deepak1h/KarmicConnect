import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Globe, Award, Clock, Handshake } from "lucide-react";

export default function Home() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const categoryIcons = {
    garment: "👔",
    fabric: "🧵", 
    yarn: "🧶",
    "home-textiles": "🏠",
    "fiber-feedstock": "🌱"
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight" data-testid="hero-title">
                Premium Textile Exports Worldwide
              </h1>
              <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed" data-testid="hero-description">
                Your trusted partner for high-quality yarn, fabric, garments, and home textiles. Serving international markets with excellence since inception.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#products" data-testid="button-explore-products">
                  <Button size="lg" className="bg-accent text-accent-foreground hover:opacity-90 text-lg px-8 py-4">
                    Explore Products
                  </Button>
                </Link>
                <Link href="/quotation" data-testid="button-request-quote">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-4"
                  >
                    Request Quote
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Modern textile manufacturing facility" 
                className="rounded-xl shadow-2xl w-full h-auto"
                data-testid="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section id="products" className="py-16 lg:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="categories-title">
              Our Product Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="categories-description">
              Discover our comprehensive range of premium textile products, crafted with precision and delivered worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="category-hover" data-testid={`category-skeleton-${i}`}>
                  <div className="h-48 bg-muted-foreground/20 animate-pulse"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted-foreground/20 animate-pulse mb-3 rounded"></div>
                    <div className="h-4 bg-muted-foreground/20 animate-pulse mb-2 rounded"></div>
                    <div className="h-4 bg-muted-foreground/20 animate-pulse mb-4 rounded w-3/4"></div>
                    <div className="h-4 bg-muted-foreground/20 animate-pulse rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              categories?.map((category: any) => (
                <Card key={category.id} className="category-hover overflow-hidden" data-testid={`category-card-${category.slug}`}>
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <span className="text-6xl">{categoryIcons[category.slug as keyof typeof categoryIcons] || "📦"}</span>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{categoryIcons[category.slug as keyof typeof categoryIcons] || "📦"}</span>
                      <h3 className="text-xl font-semibold text-foreground" data-testid={`category-name-${category.slug}`}>
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-4" data-testid={`category-description-${category.slug}`}>
                      {category.description}
                    </p>
                    <Link href={`/category/${category.slug}`} data-testid={`link-explore-${category.slug}`}>
                      <Button variant="link" className="p-0 h-auto text-primary font-medium">
                        Explore {category.name} →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6" data-testid="about-title">
                About Karmic International
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed" data-testid="about-description">
                With years of experience in the textile export industry, Karmic International has established itself as a trusted partner for businesses worldwide. We specialize in sourcing and supplying premium textile products that meet international quality standards.
              </p>
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start space-x-3" data-testid="feature-global-reach">
                  <Globe className="text-primary text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Global Reach</h3>
                    <p className="text-muted-foreground text-sm">Serving customers across 50+ countries</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="feature-quality">
                  <Award className="text-primary text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Quality Assured</h3>
                    <p className="text-muted-foreground text-sm">ISO certified manufacturing processes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="feature-delivery">
                  <Clock className="text-primary text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Timely Delivery</h3>
                    <p className="text-muted-foreground text-sm">On-time delivery guarantee</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3" data-testid="feature-partnership">
                  <Handshake className="text-primary text-xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Trusted Partner</h3>
                    <p className="text-muted-foreground text-sm">Long-term business relationships</p>
                  </div>
                </div>
              </div>
              <Link href="/quotation" data-testid="button-learn-more">
                <Button className="bg-primary text-primary-foreground hover:opacity-90">
                  Learn More →
                </Button>
              </Link>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Professional team meeting in modern office" 
                className="rounded-xl shadow-lg w-full h-auto"
                data-testid="about-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="contact-title">
              Contact Us
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="contact-description">
              Get in touch with our export team for any inquiries
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="text-center" data-testid="contact-email">
              <CardContent className="p-8">
                <div className="text-primary text-3xl mb-4">✉️</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-4">Send us your inquiries anytime</p>
                <a href="mailto:info@karmicinternational.com" className="text-primary font-medium hover:underline">
                  info@karmicinternational.com
                </a>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="contact-phone">
              <CardContent className="p-8">
                <div className="text-primary text-3xl mb-4">📞</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Call Us</h3>
                <p className="text-muted-foreground mb-4">Speak with our export team</p>
                <a href="tel:+911234567890" className="text-primary font-medium hover:underline">
                  +91 12345 67890
                </a>
              </CardContent>
            </Card>

            <Card className="text-center" data-testid="contact-address">
              <CardContent className="p-8">
                <div className="text-primary text-3xl mb-4">📍</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Visit Us</h3>
                <p className="text-muted-foreground mb-4">Our export office location</p>
                <p className="text-primary font-medium">
                  Mumbai, Maharashtra<br />India
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
