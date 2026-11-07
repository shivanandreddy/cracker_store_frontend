import { useState } from "react";
import { X } from "lucide-react";

const DiscountBanner = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <div className="relative w-full overflow-hidden shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      
      {/* Banner Image */}
      <img 
        src="/discount_banner.png" 
        alt="Diwali Mega Sale" 
        className="w-full h-auto object-cover block"
      />

     
       

    </div>
  );
};

export default DiscountBanner;