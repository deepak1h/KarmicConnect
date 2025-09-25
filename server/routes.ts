import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuotationSchema, insertProductSchema, insertAdminUserSchema } from "@shared/schema";
import { sendEmail } from "./sendgrid";

import multer from "multer";
import sharp from "sharp";

import fs from "fs";

import {supabase} from "./supabaseClient";
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabaseAdminClient'; // Use admin client to verify tokens


// Setup multer for file uploads
const BUCKET_NAME = 'karmic-images';
const upload = multer({ dest: 'uploads/' });


export async function verifyAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  // Ask Supabase who this token belongs to
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }

  // Check the user's role from the metadata we set earlier
  if (user.user_metadata?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: User does not have admin privileges.' });
  }

  // If all is good, proceed to the protected route handler
  next();
}

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
  // app.post("/api/admin/logins", async (req, res) => {
  //   try {
  //     const { username, password } = req.body;
  //     const admin = await storage.getAdminByUsername(username);
      
  //     if (!admin) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     const isValidPassword = await bcrypt.compare(password, admin.password);
  //     if (!isValidPassword) {
  //       return res.status(401).json({ message: "Invalid credentials" });
  //     }

  //     const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
  //     res.json({ token, admin: { id: admin.id, username: admin.username, email: admin.email } });
  //   } catch (error) {
  //     console.error("Error during admin login:", error);
  //     res.status(500).json({ message: "Login failed" });
  //   }
  // });

app.post("/api/admin/login", async (req, res) => {
  try {
    // We now use email for login, not username
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // 1. Ask Supabase to sign the user in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      // Supabase gives specific errors, like "Invalid login credentials"
      return res.status(401).json({ message: error.message });
    }

    // 2. IMPORTANT: Check if the logged-in user is an admin
    if (data.user.user_metadata?.role !== 'admin') {
      return res.status(403).json({ message: "Forbidden: User is not an admin." });
    }

    // 3. To maintain compatibility, we format the response similarly to your old one.
    // The client needs the 'access_token' to make authenticated requests.
    res.json({
      token: data.session.access_token, // This is the new JWT!
      admin: {
        id: data.user.id,
        username: data.user.user_metadata.username, // Get username from metadata
        email: data.user.email,
      }
    });
    
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
          const processedImageBuffer = await sharp(file.path)
                    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

          const { data, error: uploadError } = await supabaseAdmin.storage
                    .from(BUCKET_NAME)
                    .upload(filename, processedImageBuffer, {
                        contentType: 'image/webp',
                        upsert: false // Don't overwrite existing files
                    });

                if (uploadError) {
                    throw new Error(`Supabase upload failed: ${uploadError.message}`);
                }
          const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(filename);
                
          processedImages.push(publicUrl);
          fs.unlinkSync(file.path);
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
        price: req.body.priceOnRequest || req.body.price === '' ? null : req.body.price, 
        specifications: req.body.specifications ? JSON.parse(req.body.specifications) : undefined,
        priceOnRequest: req.body.priceOnRequest === 'true',
        isActive: req.body.isActive === 'true'
      };

      const existingProduct = await storage.getProductById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
      const oldImageUrls = existingProduct.images || [];
      const newImageUrls = [];
      // Process new uploaded images if any
      if (req.files && Array.isArray(req.files)) {
        
        for (const file of req.files) {
          const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webp`;
          const processedImageBuffer = await sharp(file.path)
                    .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

          const { data, error: uploadError } = await supabaseAdmin.storage
                    .from(BUCKET_NAME)
                    .upload(filename, processedImageBuffer, {
                        contentType: 'image/webp',
                        upsert: false // Don't overwrite existing files
                    });

                if (uploadError) {
                    throw new Error(`Supabase upload failed: ${uploadError.message}`);
                }
          const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(filename);
                
          newImageUrls.push(publicUrl);
          fs.unlinkSync(file.path);
        }
        productData.images = newImageUrls;
      }

      const product = await storage.updateProduct(req.params.id, productData);
      if (newImageUrls.length > 0 && oldImageUrls.length > 0) {
            const oldImageFileNames = oldImageUrls.map(url => url.split('/').pop());
            const { data, error } = await supabaseAdmin.storage
                .from(BUCKET_NAME)
                .remove(oldImageFileNames);
            
            if(error) {
                console.error("Failed to delete old images from storage:", error);
                // This is not a critical failure, so we don't throw an error to the client
            }
      }
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  //Delete Product
app.delete("/api/admin/products/:id", verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    // STEP 1: Get the product from the database BEFORE deleting it.
    // This is crucial to get the list of images to delete.
    const productToDelete = await storage.getProductById(productId);

    if (!productToDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    // STEP 2: If the product has images, delete them from Supabase Storage.
    const imageUrls = productToDelete.images;
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      
      // Extract just the filenames from the full URLs.
      // e.g., "https://.../my-file.webp" becomes "my-file.webp"
      const filenames = imageUrls
        .map(url => url.split('/').pop())
        .filter(Boolean) as string[]; // filter(Boolean) removes any null/undefined

      if (filenames.length > 0) {
        // Use the supabaseAdmin client to remove the files
        const { error: removeError } = await supabaseAdmin.storage
          .from(BUCKET_NAME) // Make sure BUCKET_NAME is defined in this scope
          .remove(filenames);

        if (removeError) {
          // Log the error, but don't stop the process.
          // It's better to delete the database record even if the image cleanup fails.
          console.error(
            "Partial failure during product deletion: Could not remove images from storage.",
            removeError
          );
        }
      }
    }

    // STEP 3: Now, delete the product record from the database.
    await storage.deleteProduct(productId);

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
