import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCategories } from "@/hooks/use-menu";
import { MenuCard } from "@/components/MenuCard";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/use-cart";
import { Loader2, ShoppingBag } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Menu() {
  const { data: categories, isLoading, error } = useCategories();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const cartTotal = useCart(state => state.total);
  const cartCount = useCart(state => state.itemCount);

  // Default to first category when loaded
  useMemo(() => {
    if (categories && categories.length > 0 && activeCategory === null) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const activeCategoryData = categories?.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 pb-24">
        {/* Header */}
        <div className="bg-secondary/5 py-12 md:py-16">
          <div className="container-custom text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Our Menu</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of authentic vegetarian dishes. From spicy starters to sweet desserts.
            </p>
          </div>
        </div>

        <div className="container-custom mt-8">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">
              Failed to load menu. Please try again later.
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Categories Sidebar/Top-bar */}
              <div className="lg:w-64 flex-shrink-0 sticky top-24 z-30 bg-background lg:h-[calc(100vh-8rem)]">
                <ScrollArea className="w-full lg:h-full pb-4">
                  <div className="flex lg:flex-col gap-2 pb-4 lg:pb-0">
                    {categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex-shrink-0 px-6 py-3 rounded-full lg:rounded-xl text-left transition-all text-sm font-medium border ${
                          activeCategory === cat.id 
                            ? "bg-primary text-primary-foreground border-primary shadow-md transform scale-105" 
                            : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:bg-secondary/5"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="lg:hidden" />
                </ScrollArea>
              </div>

              {/* Menu Items Grid */}
              <div className="flex-1 min-h-[50vh]">
                {activeCategoryData && (
                  <motion.div 
                    key={activeCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      {activeCategoryData.name}
                      <span className="text-sm font-normal text-muted-foreground bg-secondary/10 px-2 py-1 rounded-full">
                        {activeCategoryData.items.length} items
                      </span>
                    </h2>
                    
                    {activeCategoryData.items.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground bg-secondary/5 rounded-2xl border border-dashed border-border">
                        No items in this category yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {activeCategoryData.items.map((item) => (
                          <MenuCard key={item.id} item={item} />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Float */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 md:hidden">
          <Link href="/checkout">
            <div className="bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/20 p-4 flex items-center justify-between cursor-pointer animate-in slide-in-from-bottom-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium opacity-90">Total</span>
                  <span className="font-bold text-lg">₹{cartTotal}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 font-bold">
                View Cart <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Desktop Cart Float */}
      {cartCount > 0 && (
        <div className="hidden md:block fixed bottom-8 right-8 z-40">
           <Link href="/checkout">
            <Button size="lg" className="rounded-full h-16 px-8 shadow-2xl text-lg gap-3 animate-in zoom-in">
              <ShoppingBag className="w-6 h-6" />
              {cartCount} Items | ₹{cartTotal}
            </Button>
           </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}
