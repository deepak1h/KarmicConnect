import { 
  categories, 
  products, 
  quotations, 
  adminUsers,
  type Category, 
  type InsertCategory,
  type Product, 
  type InsertProduct,
  type Quotation, 
  type InsertQuotation,
  type AdminUser, 
  type InsertAdminUser 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(filters?: { categoryId?: string; search?: string }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Quotations
  getQuotations(filters?: { status?: string }): Promise<Quotation[]>;
  getQuotationById(id: string): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotationStatus(id: string, status: string): Promise<Quotation>;
  
  // Admin Users
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Products
  async getProducts(filters?: { categoryId?: string; search?: string }): Promise<Product[]> {
    const conditions = [eq(products.isActive, true)];
    
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`));
    }
    
    return await db.select().from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.slug, slug));
    return product;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
      .orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db.update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Quotations
  async getQuotations(filters?: { status?: string }): Promise<Quotation[]> {
    if (filters?.status) {
      return await db.select().from(quotations)
        .where(eq(quotations.status, filters.status))
        .orderBy(desc(quotations.createdAt));
    }
    
    return await db.select().from(quotations)
      .orderBy(desc(quotations.createdAt));
  }

  async getQuotationById(id: string): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation;
  }

  async createQuotation(quotation: InsertQuotation): Promise<Quotation> {
    const [newQuotation] = await db.insert(quotations).values(quotation).returning();
    return newQuotation;
  }

  async updateQuotationStatus(id: string, status: string): Promise<Quotation> {
    const [updatedQuotation] = await db.update(quotations)
      .set({ status })
      .where(eq(quotations.id, id))
      .returning();
    return updatedQuotation;
  }

  // Admin Users
  // async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
  //   const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
  //   return admin;
  // }

  // async createAdminUser(adminUser: InsertAdminUser): Promise<AdminUser> {
  //   const [newAdmin] = await db.insert(adminUsers).values(adminUser).returning();
  //   return newAdmin;
  // }
}

export const storage = new DatabaseStorage();
