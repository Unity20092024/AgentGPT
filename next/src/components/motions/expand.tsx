import { motion, Variants } from "framer-motion";
import type { PropsWithChildren, ReactNode } from "react";

interface ExpandProps extends PropsWithChildren {
  className?: string;
  delay?: number;
  type?: "spring" | "tween";
}

const expandVariants: Variants = {
  initial: { scaleX: 0.8, scaleY: 0 },
  animate: { scaleX: 1, scaleY: 1 },
};

const expandTransitionDefaults = {
  duration: 0.75,
  type: "spring",
  delay: 0,
};

const Expand = (props: ExpandProps) => (
  <motion.div
    variants={expandVariants}
    initial="initial"
    animate="animate"
    transition={{
      ...expandTransitionDefaults,
      type: props.type ?? expandTransitionDefaults.type,
      delay: props.delay ?? expandTransitionDefaults.delay,
    }}
    className={props.className}
  >
    {props.children as ReactNode}
  </motion.div>
);

Expand.displayName = "Expand";
export default Expand;
