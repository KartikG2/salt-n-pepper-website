import type { MenuItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Plus, Minus } from "lucide-react";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const { addItem, items, removeItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  // Food placeholder images based on keywords in name
  const getImage = (name: string) => {
    if (item.imageUrl) return item.imageUrl;
    const lower = name.toLowerCase();
    // Unsplash food placeholders
    if (lower.includes('paneer')) return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80";
    if (lower.includes('biryani') || lower.includes('rice')) return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80";
    if (lower.includes('roti') || lower.includes('naan')) return "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80";
    if (lower.includes('dal')) return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80";
    if (lower.includes('sweet') || lower.includes('jamun')) return "https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=800&q=80";
    return "https://images.unsplash.com/photo-1585937421612-70a008356f36?w=800&q=80"; // Generic Curry
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        {/* Using descriptive comments for stock images */}
        {/* food item placeholder */}
        <img 
          src={getImage(item.name)} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.isVegetarian ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {item.isVegetarian ? 'Veg' : 'Non-Veg'}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-grow">
          {item.description || "A delicious delicacy prepared with authentic spices."}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="font-bold text-lg text-primary">₹{item.price}</span>
          
          {quantity === 0 ? (
            <Button 
              size="sm" 
              onClick={() => addItem(item)}
              className="rounded-full px-4 bg-secondary hover:bg-secondary/90 text-white"
            >
              Add <Plus className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex items-center bg-secondary/10 rounded-full">
              <button 
                onClick={() => updateQuantity(item.id, quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:bg-secondary/20 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-foreground">{quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-secondary hover:bg-secondary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
