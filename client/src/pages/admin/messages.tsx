import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, ArrowLeft, MessageSquare, Eye, User, Mail, Phone, Building, Globe, Briefcase, Package, FileText } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminMessages() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  const { data: quotations, isLoading } = useQuery({
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

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/quotations/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/quotations"] });
      toast({
        title: "Status Updated",
        description: "Quotation status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredQuotations = quotations?.filter((quotation: any) => {
    const matchesSearch = 
      quotation.name.toLowerCase().includes(search.toLowerCase()) ||
      quotation.email.toLowerCase().includes(search.toLowerCase()) ||
      quotation.company?.toLowerCase().includes(search.toLowerCase()) ||
      quotation.product?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (quotationId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: quotationId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-primary/10 text-primary";
      case "processing":
        return "bg-secondary/10 text-secondary";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const allStatuses = [
      { value: "new", label: "New" },
      { value: "processing", label: "Processing" },
      { value: "completed", label: "Completed" }
    ];
    return allStatuses.filter(status => status.value !== currentStatus);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/admin/dashboard")}
                data-testid="button-back-to-dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground" data-testid="messages-title">
                  Message Management
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Total: {quotations?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, company, or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-messages"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="filter-all">All Status</SelectItem>
                  <SelectItem value="new" data-testid="filter-new">New</SelectItem>
                  <SelectItem value="processing" data-testid="filter-processing">Processing</SelectItem>
                  <SelectItem value="completed" data-testid="filter-completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-muted rounded w-16"></div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredQuotations && filteredQuotations.length > 0 ? (
          <div className="space-y-4" data-testid="messages-list">
            {filteredQuotations.map((quotation: any) => (
              <Card key={quotation.id} data-testid={`message-item-${quotation.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-foreground" data-testid={`message-name-${quotation.id}`}>
                          {quotation.name}
                        </h3>
                        <Badge 
                          className={getStatusColor(quotation.status)}
                          data-testid={`message-status-${quotation.id}`}
                        >
                          {quotation.status}
                        </Badge>
                        <Badge variant="outline" data-testid={`message-user-type-${quotation.id}`}>
                          {quotation.userType}
                        </Badge>
                      </div>
                      
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span data-testid={`message-email-${quotation.id}`}>{quotation.email}</span>
                        </div>
                        {quotation.company && (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Building className="h-4 w-4" />
                            <span data-testid={`message-company-${quotation.id}`}>{quotation.company}</span>
                          </div>
                        )}
                        {quotation.country && (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span data-testid={`message-country-${quotation.id}`}>{quotation.country}</span>
                          </div>
                        )}
                        {quotation.category && (
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span data-testid={`message-category-${quotation.id}`}>{quotation.category}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <span data-testid={`message-date-${quotation.id}`}>
                            {new Date(quotation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {quotation.product && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-foreground">Product: </span>
                          <span className="text-sm text-muted-foreground" data-testid={`message-product-${quotation.id}`}>
                            {quotation.product}
                          </span>
                        </div>
                      )}

                      {quotation.message && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`message-content-${quotation.id}`}>
                            {quotation.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMessage(quotation)}
                            data-testid={`button-view-details-${quotation.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="message-details-dialog">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <MessageSquare className="h-5 w-5" />
                              <span>Quotation Details</span>
                            </DialogTitle>
                          </DialogHeader>
                          {selectedMessage && (
                            <div className="space-y-6">
                              {/* Contact Information */}
                              <div>
                                <h4 className="font-semibold text-foreground mb-3">Contact Information</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">Name</p>
                                      <p className="text-sm text-muted-foreground" data-testid="detail-name">
                                        {selectedMessage.name}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="text-sm font-medium">Email</p>
                                      <p className="text-sm text-muted-foreground" data-testid="detail-email">
                                        {selectedMessage.email}
                                      </p>
                                    </div>
                                  </div>
                                  {selectedMessage.mobile && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">Mobile</p>
                                        <p className="text-sm text-muted-foreground" data-testid="detail-mobile">
                                          {selectedMessage.mobile}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {selectedMessage.company && (
                                    <div className="flex items-center space-x-2">
                                      <Building className="h-4 w-4 text-muted-foreground" />
                                      <div>
                                        <p className="text-sm font-medium">Company</p>
                                        <p className="text-sm text-muted-foreground" data-testid="detail-company">
                                          {selectedMessage.company}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Business Information */}
                              <div>
                                <h4 className="font-semibold text-foreground mb-3">Business Information</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">User Type</p>
                                    <Badge variant="outline" className="mt-1" data-testid="detail-user-type">
                                      {selectedMessage.userType}
                                    </Badge>
                                  </div>
                                  {selectedMessage.country && (
                                    <div>
                                      <p className="text-sm font-medium">Country</p>
                                      <p className="text-sm text-muted-foreground mt-1" data-testid="detail-country">
                                        {selectedMessage.country}
                                      </p>
                                    </div>
                                  )}
                                  {selectedMessage.profession && (
                                    <div>
                                      <p className="text-sm font-medium">Profession</p>
                                      <p className="text-sm text-muted-foreground mt-1" data-testid="detail-profession">
                                        {selectedMessage.profession}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Product Information */}
                              {(selectedMessage.category || selectedMessage.product) && (
                                <div>
                                  <h4 className="font-semibold text-foreground mb-3">Product Information</h4>
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    {selectedMessage.category && (
                                      <div>
                                        <p className="text-sm font-medium">Category</p>
                                        <p className="text-sm text-muted-foreground mt-1" data-testid="detail-category">
                                          {selectedMessage.category}
                                        </p>
                                      </div>
                                    )}
                                    {selectedMessage.product && (
                                      <div>
                                        <p className="text-sm font-medium">Product</p>
                                        <p className="text-sm text-muted-foreground mt-1" data-testid="detail-product">
                                          {selectedMessage.product}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Message */}
                              {selectedMessage.message && (
                                <div>
                                  <h4 className="font-semibold text-foreground mb-3">Message</h4>
                                  <div className="bg-muted p-4 rounded-lg">
                                    <p className="text-sm text-foreground whitespace-pre-wrap" data-testid="detail-message">
                                      {selectedMessage.message}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Metadata */}
                              <div>
                                <h4 className="font-semibold text-foreground mb-3">Details</h4>
                                <div className="grid sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge className={`mt-1 ${getStatusColor(selectedMessage.status)}`} data-testid="detail-status">
                                      {selectedMessage.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Received</p>
                                    <p className="text-sm text-muted-foreground mt-1" data-testid="detail-received">
                                      {new Date(selectedMessage.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Select 
                        value={quotation.status} 
                        onValueChange={(value) => handleStatusChange(quotation.id, value)}
                      >
                        <SelectTrigger className="w-32" data-testid={`select-status-${quotation.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new" data-testid={`status-new-${quotation.id}`}>New</SelectItem>
                          <SelectItem value="processing" data-testid={`status-processing-${quotation.id}`}>Processing</SelectItem>
                          <SelectItem value="completed" data-testid={`status-completed-${quotation.id}`}>Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card data-testid="no-messages">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Messages Found
              </h3>
              <p className="text-muted-foreground mb-4">
                {search || statusFilter !== "all" 
                  ? "No messages match your current filters." 
                  : "You haven't received any quotation requests yet."
                }
              </p>
              {(search || statusFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
