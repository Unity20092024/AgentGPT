import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import type { Dispatch, FC, PropsWithChildren, ReactNode, SetStateAction } from "react";
import { Fragment, useRef } from "react";

interface DialogProps extends PropsWithChildren {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  icon?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  inline?: boolean;
  className?: string;
  handleClose?: () => void;
  transitionDuration?: string;
  transitionTimingFunction?: string;
  backdropOpacity?: number;
  dialogShadow?: string;
  dialogBorderColor?: string;
  dialogBackgroundColor?: string;
  dialogTitleColor?: string;
  dialogTitleFontSize?: string;
  dialogTitleFontWeight?: string;
  dialogContentColor?: string;
  dialogActionsColor?: string;
  dialogActionsFontSize?: string;
  dialogActionsFontWeight?: string;
}

const Dialog: FC<DialogProps> = ({
  open,
  setOpen,
  icon,
  title,
  actions,
  inline,
  className,
  handleClose,
  transitionDuration,
  transitionTimingFunction,
  backdropOpacity,
  dialogShadow,
  dialogBorderColor,
  dialogBackgroundColor,
  dialogTitleColor,
  dialogTitleFontSize,
  dialogTitleFontWeight,
  dialogContentColor,
  dialogActionsColor,
  dialogActionsFontSize,
  dialogActionsFontWeight,
  ...props
}) => {
  const cancelButtonRef = useRef(null);

  return (
    <Transition.Root
      show={open}
      as={Fragment}
      enter="transition-opacity duration-" + transitionDuration
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-" + transitionDuration
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <HeadlessDialog
        as="div"
        className={clsx(
          "relative z-50",
          dialogShadow && "shadow-" + dialogShadow,
          backdropOpacity && "bg-neutral-900/",
          backdropOpacity && backdropOpacity * 100
        )}
        initialFocus={cancelButtonRef}
        onClose={handleClose || setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div className="fixed inset-0 bg-neutral-900/80 transition-opacity" />
        </Transition.Child>

        <div
          className={clsx(
            "fixed inset-0 z-10 overflow-y-auto",
            inline && "sm:p-0"
          )}
        >
          <div
            className={clsx(
              "flex min-h-full items-center justify-center p-4 text-center",
              inline && "sm:my-8 sm:w-full sm:max-w-lg"
            )}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <HeadlessDialog.Panel
                className={clsx(
                  "relative w-full max-w-sm transform overflow-hidden rounded-lg border border-slate-6 bg-" +
                    dialogBackgroundColor +
                    " text-left shadow-xl transition-all",
                  inline && "sm:my-8 sm:w-full sm:max-w-lg"
                )}
              >
                <HeadlessDialog.Title
                  as="h3"
                  className={clsx(
                    "flex flex-row items-start px-4 py-3 font-semibold leading-6 text-" +
                      dialogTitleColor,
                    dialogTitleFontSize &&
                      "text-" + dialogTitleFontSize + " sm:text-lg",
                    dialogTitleFontWeight &&
                      "font-" + dialogTitleFontWeight + " sm:font-semibold"
                  )}
                >
                  {title}
                </HeadlessDialog.Title>
                <div
                  className={clsx(
                    "bg-slate-1 px-4 pb-4 pt-5",
                    inline && "sm:p-6 sm:pb-4",
                    dialogContentColor && "text-" + dialogContentColor
                  )}
                >
                  <div
                    className={clsx(
                      "sm:flex sm:items-start",
                      inline && "flex flex-col gap-4"
                    )}
                  >
                    <div
                      className={clsx(
                        "mx-auto flex flex-shrink-0 items-center justify-center",
                        inline && "sm:mx-0 sm:h-10 sm:w-10"
                      )}
                    >
                      {icon}
                    </div>
                    <div>{props.children}</div>
                  </div>
                </div>
                <div
                  className={clsx(
                    "flex flex-col gap-2 border-t border-slate-6 bg-" +
                      dialogBackgroundColor,
                    inline && "sm:flex-row sm:items-center sm:justify-end",
                    dialogActionsColor && "text-" + dialogActionsColor,
                    dialogActionsFontSize &&
                      "text-" + dialogActionsFontSize + " sm:text-base",
                    dialogActionsFontWeight &&
                      "font-" + dialogActionsFontWeight + " sm:font-medium"
                  )}
                >
                  {actions}
                </div>
              </HeadlessDialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition.Root>
  );
};

export default Dialog;
