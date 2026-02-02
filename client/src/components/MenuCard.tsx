import type { MenuItem, ItemPrices } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Plus, Minus, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const { addItem, items, updateQuantity } = useCart();

  // Cast prices from JSONB to our ItemPrices interface
  const prices = item.prices as ItemPrices;

  // Manage selected portion state (Default to Full)
  const [selectedPortion, setSelectedPortion] =
    useState<keyof ItemPrices>("full");

  // Find if this specific item AND specific portion is in the cart
  const cartItem = items.find(
    (i) => i.id === item.id && i.portion === selectedPortion,
  );
  const quantity = cartItem?.quantity || 0;

  const getImage = (name: string) => {
    if (item.imageUrl) return item.imageUrl;
    const lower = name.toLowerCase();
    if (lower.includes("paneer"))
      return "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80";
    if (lower.includes("biryani") || lower.includes("rice"))
      return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80";
    if (lower.includes("roti") || lower.includes("naan"))
      return "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80";
    if (lower.includes("dal"))
      return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80";
    return "https://images.unsplash.com/photo-1585937421612-70a008356f36?w=800&q=80";
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img
          src={getImage(item.name)}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.isVegetarian ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {item.isVegetarian ? "Veg" : "Non-Veg"}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-muted-foreground text-xs mb-4 line-clamp-2 flex-grow">
          {item.description ||
            "Authentic North Indian delicacy prepared with fresh ingredients."}
        </p>

        {/* PORTION SELECTOR UI */}
        <div className="mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs h-9 border-dashed hover:border-primary/50 transition-colors"
              >
                <span className="capitalize font-medium">
                  {selectedPortion} Portion
                </span>
                <div className="flex items-center gap-1 opacity-50">
                  <span>₹{prices[selectedPortion]}</span>
                  <ChevronDown className="w-3 h-3" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] p-1">
              <DropdownMenuItem
                className={`flex justify-between cursor-pointer ${selectedPortion === "full" ? "bg-primary/10 text-primary" : ""}`}
                onClick={() => setSelectedPortion("full")}
              >
                <span>Full</span>
                <span className="font-bold">₹{prices.full}</span>
              </DropdownMenuItem>

              {prices.half ? (
                <DropdownMenuItem
                  className={`flex justify-between cursor-pointer ${selectedPortion === "half" ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => setSelectedPortion("half")}
                >
                  <span>Half</span>
                  <span className="font-bold">₹{prices.half}</span>
                </DropdownMenuItem>
              ) : null}

              {prices.quarter ? (
                <DropdownMenuItem
                  className={`flex justify-between cursor-pointer ${selectedPortion === "quarter" ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => setSelectedPortion("quarter")}
                >
                  <span>Quarter</span>
                  <span className="font-bold">₹{prices.quarter}</span>
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Price
            </span>
            <span className="font-bold text-xl text-primary">
              ₹{prices[selectedPortion]}
            </span>
          </div>

          {quantity === 0 ? (
            <Button
              size="sm"
              onClick={() => addItem(item, selectedPortion)}
              className="rounded-xl px-6 bg-secondary hover:bg-secondary/90 text-white shadow-md shadow-secondary/20 transition-all active:scale-95"
            >
              Add <Plus className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex items-center bg-secondary/10 rounded-xl p-1 border border-secondary/20 shadow-inner">
              <button
                onClick={() =>
                  updateQuantity(item.id, quantity - 1, selectedPortion)
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:bg-secondary/20 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-foreground">
                {quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.id, quantity + 1, selectedPortion)
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:bg-secondary/20 transition-colors"
                aria-label="Increase quantity"
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
