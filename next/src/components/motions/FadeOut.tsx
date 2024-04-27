import { motion } from "framer-motion";
import type { PropsWithChildren, ReactNode } from "react";

interface MotionProps extends PropsWithChildren<{ key?: ReactNode }> {
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
  dataTestId?: string;
}

const FadeOut = (props: MotionProps) => {
  const { className, delay, style, dataTestId, children, ...motionProps } = props;

  return (
    <motion.div
      key={dataTestId}
      data-testid={dataTestId}
      className={className}
      style={style}
      variants={{
        initial: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -100 },
        animate: { scale: 1 },
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5, type: "spring", delay }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

FadeOut.displayName = "FadeOut";
export default FadeOut;
