import { Combobox, ComboboxInput, ComboboxButton, ComboboxOptions } from "@headlessui/react";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useState } from "react";
import { HiCheck, HiChevronDown } from "react-icons/hi2";

interface Props<T> {
  label: string;
  items: T[];
  value: T | undefined;
  valueMapper: (e: T) => string;
  onChange: (value: T) => void;
  icon?: ReactNode;
  noOptionsMessage?: string;
  loading?: boolean;
  keyExtractor: (e: T) => string;
  filter?: (query: string, e: T) => boolean;
  getItemValue: (e: T) => string;
  getOptionLabel: (e: T) => string;
  getOptionDisabled?: (e: T) => boolean;
  getOptionClassName?: (e: T, isSelected: boolean, isActive: boolean) => string;
  getSelectedOptionClassName?: (e: T) => string;
  getInputValue?: (e: T) => string;
  getButtonClassName?: (isOpen: boolean) => string;
  getOptionsClassName?: (isOpen: boolean) => string;
  getOptionsContainerClassName?: (isOpen: boolean) => string;
  getLabelClassName?: (isOpen: boolean) => string;
  getInputClassName?: (isOpen: boolean) => string;
  getLoadingClassName?: (isOpen: boolean) => string;
  getNoOptionsMessageClassName?: (isOpen: boolean) => string;
}

const Combo = <T,>({
  items,
  label,
  value,
  valueMapper,
  onChange,
  icon,
  noOptionsMessage,
  loading,
  keyExtractor,
  filter = (query, e) =>
    valueMapper(e).toLowerCase().includes(query.toLowerCase()),
  getItemValue,
  getOptionLabel,
  getOptionDisabled,
  getOptionClassName,
  getSelectedOptionClassName,
  getInputValue = valueMapper,
  getButtonClassName,
  getOptionsClassName,
  getOptionsContainerClassName,
  getLabelClassName,
  getInputClassName,
  getLoadingClassName,
  getNoOptionsMessageClassName,
}: Props<T>) => {
  const [query, setQuery] = useState("");

  const filtered =
    query === ""
      ? items
      : items.filter((e) => filter(query, e));

  return (
    <Combobox
      as="div"
      value={value}
      onChange={onChange}
      disabled={loading}
    >
      <Combobox.Label
        className={clsx(
          "flex items-center gap-2 text-sm font-bold leading-6 text-slate-12",
          getLabelClassName(loading)
        )}
      >
        {icon}
        {label}
      </Combobox.Label>
      <div className="relative mt-1">
        <ComboboxInput
          className={clsx(
            "w-full rounded-md border-0 bg-slate-1 py-1.5 pl-3 pr-10 text-slate-12 shadow-depth-1 transition-colors sm:text-sm sm:leading-6",
            getInputClassName(loading)
          )}
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(e) => getInputValue(e as T)}
        />
        <ComboboxButton
          className={clsx(
            "absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none",
            getButtonClassName(loading)
          )}
        >
          <HiChevronDown
            className={clsx(
              "h-5 w-5 text-gray-400",
              loading && "animate-spin"
            )}
            aria-hidden="true"
          />
        </ComboboxButton>

        {loading && (
          <div
            className={clsx(
              "absolute inset-y-0 left-0 flex items-center pl-3 text-slate-12",
              getLoadingClassName(loading)
            )}
          >
            Loading...
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div
            className={clsx(
              "absolute inset-y-0 left-0 flex items-center pl-3 text-slate-12",
              getNoOptionsMessageClassName(loading)
            )}
          >
            {noOptionsMessage}
          </div>
        )}

        {filtered.length > 0 && (
          <ComboboxOptions
            className={clsx(
              "absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-1 py-1 text-slate-12 shadow-lg ring-opacity-5 focus:outline-none sm:text-sm",
              getOptionsClassName(loading)
            )}
          >
            <ComboboxOptions
              className={clsx(
                "relative",
                getOptionsContainerClassName(loading)
              )}
            >
              {filtered.map((e, i) => (
                <Combobox.Option
                  key={keyExtractor(e)}
                  value={e}
                  className={({ active }) =>
                    clsx(
                      "relative cursor-default select-none py-2 pl-3 pr-9 ",
                      getOptionClassName
                        ? getOptionClassName(e, active, false)
                        : "",
                      active ? "hover:bg-slate-3" : "text-slate-12"
                    )
                  }
                  disabled={getOptionDisabled?.(e)}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={clsx(
                          "block truncate",
                          getSelectedOptionClassName
                            ? getSelectedOptionClassName(e)
                            : "",
                          selected && "font-semibold"
                        )}
                      >
                        {getOptionLabel(e)}
                      </span>

                      {selected && (
                        <span
                          className={clsx(
                            "absolute inset-y-0 right-0 flex items-center pr-4 text-slate-12"
                          )}
                        >
                          <HiCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </ComboboxOptions>
          </ComboboxOptions>
        )}
      </div>
    </Combobox>
  );
};

export default Combo;
