import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, MessageSquare, User, LogOut, Plus, Eye } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-utils";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const { data: quotations } = useQuery({
    queryKey: ["/api/admin/quotations"],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey.join("/"), {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch quotations");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    setLocation("/admin/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  const newQuotations = quotations?.filter((q: any) => q.status === "new") || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="admin-title">
                  Karmic International Admin
                </h1>
                <p className="text-sm text-muted-foreground" data-testid="admin-welcome">
                  Welcome, {user?.username}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="dashboard-title">
            Dashboard
          </h2>
          <p className="text-muted-foreground" data-testid="dashboard-description">
            Manage your products and customer inquiries
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card data-testid="stat-products">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {products?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-quotations">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Quotations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {quotations?.length || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-new-quotations">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New Quotations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {newQuotations.length}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="stat-categories">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">5</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Management */}
          <Card data-testid="product-management">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Product Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Manage your product catalog, add new products, and update existing ones.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/admin/products" data-testid="link-manage-products">
                  <Button className="flex items-center w-full sm:w-auto">
                    <Eye className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                </Link>
                <Link href="/admin/products?action=add" data-testid="link-add-product">
                  <Button variant="outline" className="flex items-center w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Message Management */}
          <Card data-testid="message-management">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Message Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                View and manage customer quotation requests and inquiries.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/admin/messages" data-testid="link-view-messages">
                  <Button className="flex items-center w-full sm:w-auto">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Messages
                  </Button>
                </Link>
                {newQuotations.length > 0 && (
                  <Link href="/admin/messages?filter=new" data-testid="link-new-messages">
                    <Button variant="outline" className="flex items-center w-full sm:w-auto">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {newQuotations.length} New Messages
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {quotations && quotations.length > 0 && (
          <Card className="mt-8" data-testid="recent-activity">
            <CardHeader>
              <CardTitle>Recent Quotation Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotations.slice(0, 5).map((quotation: any) => (
                  <div key={quotation.id} className="flex items-center justify-between py-2" data-testid={`recent-quotation-${quotation.id}`}>
                    <div>
                      <p className="font-medium text-foreground">{quotation.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {quotation.company && `${quotation.company} • `}
                        {quotation.category || "General inquiry"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(quotation.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        quotation.status === "new" 
                          ? "bg-primary/10 text-primary" 
                          : quotation.status === "processing"
                          ? "bg-secondary/10 text-secondary"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {quotation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {quotations.length > 5 && (
                <>
                  <Separator className="my-4" />
                  <div className="text-center">
                    <Link href="/admin/messages" data-testid="link-view-all-messages">
                      <Button variant="outline">View All Messages</Button>
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
