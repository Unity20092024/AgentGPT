import { Transition } from "@headlessui/react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Fragment } from "react";
import { FaBars } from "react-icons/fa";

export type SidebarDisplayProps = {
  isOpen: boolean;
  toggle: () => void;
  side: "left" | "right";
};

export type SidebarProps = SidebarDisplayProps & {
  children: ReactNode;
  className?: string;
};

const Sidebar = ({ isOpen, toggle, children, side, className }: SidebarProps) => {
  return (
    <SidebarTransition isOpen={isOpen} side={side}>
      <nav
        className={clsx(
          "flex flex-1 flex-col overflow-x-hidden bg-slate-3 p-4 ring-1 ring-white/10",
          className
        )}
      >
        {children}
      </nav>
    </SidebarTransition>
  );
};

type SidebarTransitionProps = {
  isOpen: boolean;
  side: "left" | "right";
  children: ReactNode;
  className?: string;
};

export const SidebarTransition = ({ isOpen, children, side, className }: SidebarTransitionProps) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <div className="relative z-30">
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-neutral-900/80 lg:hidden" />
        </Transition.Child>
        <div className={`fixed ${side}-0 flex`}>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom={side === "left" ? "-translate-x-full" : "translate-x-full"}
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo={side === "left" ? "-translate-x-full" : "translate-x-full"}
          >
            <div
              className={clsx("flex max-w-xs flex-1", className || "h-screen max-h-screen w-64")}
            >
              {children}
            </div>
          </Transition.Child>
        </div>
      </div>
    </Transition.Root>
  );
};

export const SidebarControlButton = ({
  isOpen,
  toggle,
  side,
}: SidebarDisplayProps) => {
  return (
    <button
      className={clsx(
        "fixed z-20 m-1 rounded-md bg-slate-1 shadow-depth-1 transition-all sm:m-2",
        side === "right" && "right-0"
      )}
      onClick={toggle}
    >
      <FaBars size="12" className="z-20 m-2 text-slate-11" />
    </button>
  );
};

export default Sidebar;
