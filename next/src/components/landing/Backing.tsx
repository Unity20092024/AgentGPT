import React from "react";

const Logos = () => (
  <div className="flex flex-row items-center gap-x-1">
    <a
      className="z-10 -mr-2 cursor-pointer"
      href="https://www.ycombinator.com/companies/reworkd"
      target="_blank"
      title="Y Combinator"
    >
      <img src="../../../public/logos/yc-default-solid.svg" alt="Y Combinator logo" />
    </a>
    <a
      href="https://www.panache.vc/"
      target="_blank"
      title="Panache Ventures"
    >
      <img src="../../../public/logos/panache-default-solid.svg" alt="Panache Ventures logo" />
    </a>
  </div>
);

const Backing = (props) => (
  <div
    className={[
      "flex",
      "flex-col",
      "font-inter",
      "text-xs",
      "font-normal",
      "text-white/50",
      "md:text-sm",
      props.className
    ].join(" ")}
  >
    <div className="flex flex-row items-center gap-x-1">
      <div className="ml-2 mr-1 flex flex-row items-center">
        <Logos />
      </div>
      <div className="hidden tracking-wide sm:flex">Backed By</div>
      <div className="flex flex-row items-center gap-1 font-light text-white/95">
        <a
          className="cursor-pointer"
          href="https://www.ycombinator.com/companies/reworkd"
          target="_blank"
        >
          Y Combinator
        </a>
        <span>and</span>
        <a
          className="cursor-pointer"
          href="https://www.panache.vc/"
          target="_blank"
        >
          Panache Ventures
        </a>
      </div>
    </div>
  </div>
);

export default Backing;
