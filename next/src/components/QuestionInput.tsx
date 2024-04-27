import clsx from "clsx";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  required?: boolean;
  description?: string;
  validationMessage?: string;
  validationMessageVisible?: boolean;
  validationMessageTimeout?: number;
  icon?: React.ReactNode;
  disabled?: boolean;
  handleFocusChange?: (focused: boolean) => void;
  onSubmit: () => void;
  ref?: React.Ref<HTMLInputElement>;
  readOnly?: boolean;
  autoComplete?: "on" | "off";
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  form?: string;
  testId?: string;
}

const QuestionInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      required,
      description,
      validationMessage,
      validationMessageVisible,
      validationMessageTimeout,
      icon,
      disabled,
      handleFocusChange,
      onSubmit,
      ref,
      readOnly,
      autoComplete,
      min,
      max,
      step,
      pattern,
      form,
      testId,
      ...inputProps
    },
    inputRef
  ) => {
    const [localValidationMessageVisible, setLocalValidationMessageVisible] =
      useState(validationMessageVisible);
    const inputElementRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputElementRef.current!);

    const handleValidationMessageClose = () => {
      setLocalValidationMessageVisible(false);
    };

    return (
      <div className="relative flex flex-col">
        <div className="flex flex-grow flex-row items-center gap-1">
          <input
            ref={inputRef}
            type={inputProps.type}
            name={inputProps.name}
            id={inputProps.name}
            className="placeholder:text-color-tertiary w-full rounded-full border-2 border-slate-6 bg-slate-1 p-4 text-slate-12 caret-purple-400 ring-0 transition-colors duration-300 selection:bg-purple-300 hover:border-purple-200 focus:border-purple-400 focus:outline-0 focus:ring-0  sm:leading-6"
            placeholder={inputProps.placeholder}
            value={inputProps.value}
            onChange={inputProps.onChange}
            disabled={inputProps.disabled}
            readOnly={readOnly}
            autoComplete={autoComplete}
            min={min}
            max={max}
            step={step}
            pattern={pattern}
            form={form}
            required={required}
            onFocus={(event) => {
              inputProps.onFocus && inputProps.onFocus(event);
              handleFocusChange && handleFocusChange(true);
            }}
            onBlur={(event) => {
              inputProps.onBlur && inputProps.onBlur(event);
              handleFocusChange && handleFocusChange(false);
              setLocalValidationMessageVisible(true);
            }}
            {...{ "aria-describedby": `${inputProps.name}-description` }}
            {...inputProps.attributes}
          />
          <div
            className={clsx(
              "absolute right-2 rounded-full p-3 text-white transition-colors duration-300",
              inputProps.value === ""
                ? "cursor-not-allowed bg-slate-8"
                : "cursor-pointer bg-purple-300 hover:bg-purple-400"
            )}
            onClick={onSubmit}
          >
            <FaArrowRight size={20} />
          </div>
        </div>
        {description && (
          <p id={`${inputProps.name}-description`} className="mt-1 text-sm text-slate-5">
            {description}
          </p>
        )}
        {validationMessageVisible && localValidationMessageVisible && validationMessage && (
          <p
            className="mt-1 text-sm text-red-5"
            role="alert"
            aria-live="polite"
            onAnimationEnd={handleValidationMessageClose}
          >
            {validationMessage}
          </p>
        )}
      </div>
    );
  }
);

export default QuestionInput;
