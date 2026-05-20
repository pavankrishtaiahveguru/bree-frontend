import { motion } from 'framer-motion';

const PRODUCT_IMAGE = "https://res.cloudinary.com/dxfs7qyzm/image/upload/v1778914390/Hero_Image_tanm0e.png";

const Bottle3D = ({ className = "" }) => {
  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`} data-testid="3d-bottle">
      {/* Animated Product Image */}
      <motion.div
        animate={{ 
          y: [0, -12, 0],
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <motion.img
          src={PRODUCT_IMAGE}
          alt="BREE FIRE - Amla, Ginger, Turmeric Shot"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-h-[480px] w-auto object-contain"
        />
      </motion.div>
    </div>
  );
};

export default Bottle3D;
