import { Variants, Transition, type MotionProps } from "framer-motion";

export const defaultTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export const fastTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
  mass: 0.5,
};

export const slowTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 1,
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: defaultTransition },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: defaultTransition },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: defaultTransition },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: defaultTransition },
};

export const slideInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: defaultTransition },
};

export const slideInDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  show: { opacity: 1, y: 0, transition: defaultTransition },
};

export const listStagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: "0 12px 24px -8px rgba(0,0,0,0.15)",
    transition: { duration: 0.2 },
  },
};

export const buttonTap = {
  whileTap: { scale: 0.97 },
};

export const iconSpin: MotionProps = {
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: "linear" },
};

export const pulseGlow: Variants = {
  initial: { boxShadow: "0 0 0 0 rgba(var(--primary-rgb), 0.4)" },
  animate: {
    boxShadow: ["0 0 0 0 rgba(var(--primary-rgb), 0.4)", "0 0 0 12px rgba(var(--primary-rgb), 0)"],
    transition: { duration: 1.5, repeat: Infinity },
  },
};

export const countUp = (target: number, duration = 1.2) => {
  let value = 0;
  const start = performance.now();
  return {
    get: () => {
      const elapsed = (performance.now() - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      value = Math.round(eased * target);
      return value;
    },
  };
};

export const getStaggerDelay = (index: number, baseDelay = 0.04) => index * baseDelay;

export const motionPresets = {
  page: pageVariants,
  container: containerVariants,
  item: itemVariants,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
  slideInUp,
  slideInDown,
  cardHover,
  buttonTap,
};
