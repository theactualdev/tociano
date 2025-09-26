"use client";

import { useState, useEffect } from "react";
import {
  getAllProducts,
  deleteProduct,
  addProduct,
  updateProduct,
} from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Search,
  Trash2,
  Plus,
  AlertTriangle,
  ImagePlus,
  Package,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@/lib/types";
import Image from "next/image";

// Define product categories
const PRODUCT_CATEGORIES = ["Women", "Men", "Accessories", "Sale"];

// Empty product template
const emptyProduct: Product = {
  id: "",
  name: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  images: [],
  sizes: [],
  colors: [],
  featured: false,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"add" | "edit" | "delete">(
    "add"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Product>(emptyProduct);
  const [imageUrl, setImageUrl] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [colorInput, setColorInput] = useState("");

  const { toast } = useToast();

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Filter products when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(
      (product) =>
        (product.name && product.name.toLowerCase().includes(query)) ||
        (product.description &&
          product.description.toLowerCase().includes(query)) ||
        (product.category && product.category.toLowerCase().includes(query))
    );

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "price" || name === "compareAtPrice" || name === "stock") {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle featured toggle
  const handleFeaturedChange = (value: string) => {
    setFormData({
      ...formData,
      featured: value === "true",
    });
  };

  // Handle add image
  const handleAddImage = () => {
    if (imageUrl && imageUrl.trim() !== "") {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrl.trim()],
      });
      setImageUrl("");
    }
  };

  // Handle remove image
  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  // Handle add size
  const handleAddSize = () => {
    if (
      sizeInput &&
      sizeInput.trim() !== "" &&
      !formData.sizes?.includes(sizeInput.trim())
    ) {
      setFormData({
        ...formData,
        sizes: [...(formData.sizes || []), sizeInput.trim()],
      });
      setSizeInput("");
    }
  };

  // Handle remove size
  const handleRemoveSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes?.filter((_, i) => i !== index) || [],
    });
  };

  // Handle add color
  const handleAddColor = () => {
    if (
      colorInput &&
      colorInput.trim() !== "" &&
      !formData.colors?.includes(colorInput.trim())
    ) {
      setFormData({
        ...formData,
        colors: [...(formData.colors || []), colorInput.trim()],
      });
      setColorInput("");
    }
  };

  // Handle remove color
  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors?.filter((_, i) => i !== index) || [],
    });
  };

  // Handle add product
  const handleAddProduct = () => {
    setDialogAction("add");
    setFormData(emptyProduct);
    setSizeInput("");
    setColorInput("");
    setIsDialogOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setDialogAction("edit");
    setCurrentProduct(product);
    setFormData(product);
    setSizeInput("");
    setColorInput("");
    setIsDialogOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    setDialogAction("delete");
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  // Save product (add or edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.category ||
      formData.images.length === 0
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please fill in all required fields and add at least one image",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (dialogAction === "add") {
        // Add new product
        const result = await addProduct(formData);
        if (result.success) {
          const newProduct = { ...formData };
          setProducts([...products, newProduct]);

          toast({
            title: "Product Added",
            description: `${formData.name} has been added successfully`,
          });
        }
      } else if (dialogAction === "edit" && currentProduct?.id) {
        // Update existing product
        await updateProduct(currentProduct.id, formData);

        // Update local state
        setProducts(
          products.map((p) =>
            p.id === currentProduct.id
              ? { ...formData, id: currentProduct.id }
              : p
          )
        );

        toast({
          title: "Product Updated",
          description: `${formData.name} has been updated successfully`,
        });
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: `Failed to ${
          dialogAction === "add" ? "add" : "update"
        } product`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm delete product
  const confirmDeleteProduct = async () => {
    if (!currentProduct?.id) return;

    setIsSubmitting(true);

    try {
      await deleteProduct(currentProduct.id);

      // Update local state
      setProducts(products.filter((p) => p.id !== currentProduct.id));
      setFilteredProducts(
        filteredProducts.filter((p) => p.id !== currentProduct.id)
      );

      toast({
        title: "Product Deleted",
        description: `${currentProduct.name} has been removed from the system`,
      });

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-2rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Products Management</h1>

        <div className="flex items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your store&apos;s product listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-10">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Products Found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery
                  ? "No products matching your search criteria"
                  : "Add your first product to get started"}
              </p>
              {!searchQuery && (
                <Button className="mt-4" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative w-16 h-16 border rounded-md overflow-hidden">
                            <Image
                              src={
                                product.images && product.images.length > 0
                                  ? product.images[0]
                                  : "/placeholder-image.jpg"
                              }
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ID:{" "}
                              {typeof product.id === "string"
                                ? `${product.id.substring(0, 8)}...`
                                : product.id || "N/A"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        {product.compareAtPrice ? (
                          <div>
                            <span className="line-through text-xs text-muted-foreground">
                              {formatCurrency(product.compareAtPrice)}
                            </span>
                            <span className="ml-2 font-medium">
                              {formatCurrency(product.price)}
                            </span>
                          </div>
                        ) : (
                          formatCurrency(product.price)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Sizes: {product.sizes.slice(0, 3).join(", ")}
                              {product.sizes.length > 3 &&
                                ` +${product.sizes.length - 3} more`}
                            </div>
                          )}
                          {product.colors && product.colors.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Colors: {product.colors.slice(0, 3).join(", ")}
                              {product.colors.length > 3 &&
                                ` +${product.colors.length - 3} more`}
                            </div>
                          )}
                          {(!product.sizes || product.sizes.length === 0) &&
                            (!product.colors ||
                              product.colors.length === 0) && (
                              <span className="text-xs text-muted-foreground">
                                No variants
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.stock <= 5 ? "text-destructive" : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>
                        {product.stock > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-success/20 px-2 py-1 text-xs font-medium text-success">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-destructive/20 px-2 py-1 text-xs font-medium text-destructive">
                            Out of Stock
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog (Add/Edit/Delete) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={dialogAction === "delete" ? "sm:max-w-md" : "sm:max-w-2xl"}
        >
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add"
                ? "Add New Product"
                : dialogAction === "edit"
                ? "Edit Product"
                : "Delete Product"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "add"
                ? "Add a new product to your store"
                : dialogAction === "edit"
                ? "Modify the existing product details"
                : "Are you sure you want to delete this product? This action can&apos;t be undone."}
            </DialogDescription>
          </DialogHeader>

          {dialogAction === "delete" ? (
            <div>
              {currentProduct && (
                <div>
                  <div className="flex items-center mb-4 p-3 bg-destructive/10 text-destructive rounded-md">
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span>This action cannot be undone.</span>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <div className="relative w-16 h-16 border rounded-md overflow-hidden">
                      <Image
                        src={
                          currentProduct.images &&
                          currentProduct.images.length > 0
                            ? currentProduct.images[0]
                            : "/placeholder-image.jpg"
                        }
                        alt={currentProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {currentProduct.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentProduct.category} ·{" "}
                        {formatCurrency(currentProduct.price)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteProduct}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete Product"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSaveProduct}>
              <div className="grid grid-cols-1 gap-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Product Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleSelectChange("category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price */}
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Price <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Compare At Price */}
                  <div className="space-y-2">
                    <Label htmlFor="compareAtPrice">Compare At Price</Label>
                    <Input
                      id="compareAtPrice"
                      name="compareAtPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.compareAtPrice || ""}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <Label htmlFor="stock">
                      Stock <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      value={formData.stock || ""}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Featured Status */}
                <div className="space-y-2">
                  <Label>Featured Product</Label>
                  <RadioGroup
                    defaultValue={formData.featured ? "true" : "false"}
                    onValueChange={handleFeaturedChange}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="featured-yes" />
                      <Label htmlFor="featured-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="featured-no" />
                      <Label htmlFor="featured-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <Label>
                    Product Images <span className="text-destructive">*</span>
                  </Label>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddImage}
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <Image
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="h-24 w-full object-cover rounded border border-border"
                          width={180}
                          height={200}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-background/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-4">
                  <Label>Available Sizes</Label>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter size (e.g., S, M, L, XL)"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSize();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSize}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Size
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.sizes?.map((size, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{size}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-4">
                  <Label>Available Colors</Label>

                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Enter color (e.g., Red, Blue, Black)"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddColor();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddColor}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Color
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.colors?.map((color, index) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 bg-secondary px-3 py-1 rounded-full text-sm"
                      >
                        <span>{color}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(index)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? dialogAction === "add"
                      ? "Adding..."
                      : "Updating..."
                    : dialogAction === "add"
                    ? "Add Product"
                    : "Update Product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
