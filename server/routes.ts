import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuotationSchema, insertProductSchema, insertAdminUserSchema } from "@shared/schema";
import { sendEmail } from "./sendgrid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware to verify admin JWT
const verifyAdmin = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize categories if they don't exist
  try {
    const existingCategories = await storage.getCategories();
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: "Garment", slug: "garment", description: "Premium ready-to-wear garments" },
        { name: "Fabric", slug: "fabric", description: "High-quality fabrics for various applications" },
        { name: "Yarn", slug: "yarn", description: "Premium yarns in various counts and materials" },
        { name: "Home Textiles", slug: "home-textiles", description: "Elegant home textiles and furnishings" },
        { name: "Fiber & Feedstock", slug: "fiber-feedstock", description: "Raw materials and feedstock" }
      ];
      
      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
    }
  } catch (error) {
    console.error("Error initializing categories:", error);
  }

  // Public API routes
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by slug
  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get products with optional filters
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search } = req.query;
      const products = await storage.getProducts({
        categoryId: categoryId as string,
        search: search as string
      });
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get products by category
  app.get("/api/categories/:categoryId/products", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.categoryId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get product by slug
  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Submit quotation
  app.post("/api/quotations", async (req, res) => {
    try {
      const validatedData = insertQuotationSchema.parse(req.body);
      const quotation = await storage.createQuotation(validatedData);

      // Send email notification
      const emailSent = await sendEmail(
        process.env.SENDGRID_API_KEY || "",
        {
          to: process.env.ADMIN_EMAIL || "admin@karmicinternational.com",
          from: process.env.FROM_EMAIL || "noreply@karmicinternational.com", 
          subject: `New Quotation Request from ${validatedData.name}`,
          html: `
            <h2>New Quotation Request</h2>
            <p><strong>Name:</strong> ${validatedData.name}</p>
            <p><strong>Company:</strong> ${validatedData.company || 'N/A'}</p>
            <p><strong>Email:</strong> ${validatedData.email}</p>
            <p><strong>Mobile:</strong> ${validatedData.mobile || 'N/A'}</p>
            <p><strong>Country:</strong> ${validatedData.country || 'N/A'}</p>
            <p><strong>User Type:</strong> ${validatedData.userType}</p>
            <p><strong>Category:</strong> ${validatedData.category || 'N/A'}</p>
            <p><strong>Product:</strong> ${validatedData.product || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${validatedData.message || 'No additional message'}</p>
          `
        }
      );

      if (!emailSent) {
        console.error("Failed to send email notification");
      }

      res.json({ message: "Quotation submitted successfully", quotation });
    } catch (error) {
      console.error("Error submitting quotation:", error);
      res.status(400).json({ message: "Failed to submit quotation" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await storage.getAdminByUsername(username);
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin protected routes

  // Create product
  app.post("/api/admin/products", verifyAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const productData = {
        ...req.body,
        specifications: req.body.specifications ? JSON.parse(req.body.specifications) : {},
        images: [],
        priceOnRequest: req.body.priceOnRequest === 'true',
        isActive: req.body.isActive === 'true',
        price: req.body.priceOnRequest || req.body.price === '' ? null : req.body.price
      };

      // Process uploaded images
      if (req.files && Array.isArray(req.files)) {
        const processedImages = [];
        for (const file of req.files) {
          const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
          const outputPath = path.join('uploads', filename);
          
          await sharp(file.path)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath);
          
          // Clean up original file
          fs.unlinkSync(file.path);
          processedImages.push(`/uploads/${filename}`);
        }
        productData.images = processedImages;
      }

      const validatedData = insertProductSchema.parse(productData);
      const product = await storage.createProduct(validatedData);
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  // Update product
  app.put("/api/admin/products/:id", verifyAdmin, upload.array('images', 10), async (req, res) => {
    try {
      const productData = {
        ...req.body,
        specifications: req.body.specifications ? JSON.parse(req.body.specifications) : undefined,
        priceOnRequest: req.body.priceOnRequest === 'true',
        isActive: req.body.isActive === 'true'
      };

      // Process new uploaded images if any
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const processedImages = [];
        for (const file of req.files) {
          const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
          const outputPath = path.join('uploads', filename);
          
          await sharp(file.path)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(outputPath);
          
          fs.unlinkSync(file.path);
          processedImages.push(`/uploads/${filename}`);
        }
        productData.images = processedImages;
      }

      const product = await storage.updateProduct(req.params.id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  // Delete product
  app.delete("/api/admin/products/:id", verifyAdmin, async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Get all quotations
  app.get("/api/admin/quotations", verifyAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const quotations = await storage.getQuotations({ status: status as string });
      res.json(quotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      res.status(500).json({ message: "Failed to fetch quotations" });
    }
  });

  // Update quotation status
  app.put("/api/admin/quotations/:id/status", verifyAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const quotation = await storage.updateQuotationStatus(req.params.id, status);
      res.json(quotation);
    } catch (error) {
      console.error("Error updating quotation status:", error);
      res.status(400).json({ message: "Failed to update quotation status" });
    }
  });

  // Serve uploaded images
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
