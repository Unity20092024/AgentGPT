import clsx from "clsx";
import type { PropsWithChildren, AnchorHTMLAttributes } from "react";
import React from "react";
import { FaChevronRight } from "react-icons/fa";

type BannerBadgeProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>> & {
  title?: string;
};

const BannerBadge = ({ children, className, title, href, tabIndex, onKeyDown, ...props }: BannerBadgeProps) => (
  <div
    className={clsx(
      "rounded-full bg-gradient-to-tl from-[#A02BFE] via-[#02FCF1] to-[#A02BFE] p-[1px] subpixel-antialiased",
      className
    )}
  >
    <a
      className="animate-border-pulse py group relative flex w-max cursor-pointer items-center gap-2 rounded-full bg-black px-4 py-2 text-xs text-white"
      href={href}
      role="button"
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      title={title}
      {...props}
    >
      <span>{children}</span>
      <FaChevronRight
        size={10}
        className="font-thin text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
      />
    </a>
  </div>
);

export default BannerBadge;
