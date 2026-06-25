import { motion } from "framer-motion";
import { pageVariants } from "@/lib/animations";

export function AnimatedPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={pageVariants}
      initial={false}
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
