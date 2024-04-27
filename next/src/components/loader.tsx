import React from "react";
import PropTypes from "prop-types";
import { Ring } from "@uiball/loaders";

interface LoaderProps {
  className?: string;
  size?: number;
  speed?: number;
  lineWeight?: number;
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({
  className,
  size = 16,
  speed = 2,
  lineWeight = 7,
  color = "white",
}) => {
  return (
    <div className={className}>
      <Ring size={size} speed={speed} color={color} lineWeight={lineWeight} />
    </div>
  );
};

Loader.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number,
  speed: PropTypes.number,
  lineWeight: PropTypes.number,
  color: PropTypes.string,
};

export default Loader;
