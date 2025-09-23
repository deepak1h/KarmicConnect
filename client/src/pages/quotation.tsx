import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send } from "lucide-react";

const quotationSchema = z.object({
  userType: z.string().min(1, "Please select your role"),
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().optional(),
  country: z.string().optional(),
  profession: z.string().optional(),
  category: z.string().optional(),
  product: z.string().optional(),
  message: z.string().optional(),
});

type QuotationForm = z.infer<typeof quotationSchema>;

export default function Quotation() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<QuotationForm>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      userType: "",
      name: "",
      company: "",
      email: "",
      mobile: "",
      country: "",
      profession: "",
      category: "",
      product: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: QuotationForm) => {
      return await apiRequest("POST", "/api/quotations", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Quotation Submitted Successfully",
        description: "We'll get back to you within 24 hours.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: QuotationForm) => {
    mutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card data-testid="success-message">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Quotation Submitted Successfully!
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Thank you for your interest. Our team will review your request and get back to you within 24 hours.
              </p>
              <Button onClick={() => setIsSubmitted(false)} data-testid="button-submit-another">
                Submit Another Quote
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" data-testid="quotation-title">
            Request a Quote
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="quotation-description">
            Get competitive pricing for your textile requirements. Our team will respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Quotation Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card data-testid="quotation-form-card">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Tell us about your requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="quotation-form">
                  {/* First Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="userType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>I am a *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-user-type">
                                <SelectValue placeholder="Select your role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="buyer" data-testid="option-buyer">Buyer</SelectItem>
                              <SelectItem value="seller" data-testid="option-seller">Seller</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="us" data-testid="option-us">United States</SelectItem>
                              <SelectItem value="uk" data-testid="option-uk">United Kingdom</SelectItem>
                              <SelectItem value="de" data-testid="option-de">Germany</SelectItem>
                              <SelectItem value="in" data-testid="option-in">India</SelectItem>
                              <SelectItem value="cn" data-testid="option-cn">China</SelectItem>
                              <SelectItem value="other" data-testid="option-other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Second Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Company name" {...field} data-testid="input-company" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Third Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+1 (555) 123-4567" {...field} data-testid="input-mobile" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Fourth Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profession</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Textile Manufacturer" {...field} data-testid="input-profession" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="garment" data-testid="option-garment">Garment</SelectItem>
                              <SelectItem value="fabric" data-testid="option-fabric">Fabric</SelectItem>
                              <SelectItem value="yarn" data-testid="option-yarn">Yarn</SelectItem>
                              <SelectItem value="home-textiles" data-testid="option-home-textiles">Home Textiles</SelectItem>
                              <SelectItem value="fiber-feedstock" data-testid="option-fiber-feedstock">Fiber & Feedstock</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Product Field */}
                  <FormField
                    control={form.control}
                    name="product"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product</FormLabel>
                        <FormControl>
                          <Input placeholder="Specify the product you're interested in" {...field} data-testid="input-product" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Message Field */}
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            rows={5}
                            placeholder="Please provide additional details about your requirements, quantity, specifications, etc."
                            {...field}
                            data-testid="textarea-message"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    size="lg"
                    className="w-full bg-primary text-primary-foreground hover:opacity-90"
                    disabled={mutation.isPending}
                    data-testid="button-submit-quote"
                  >
                    {mutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Quote Request
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
