import React from "react";
import PropTypes from "prop-types";

export const ExampleAgentButton = ({
  name,
  children,
  setAgentRun,
  goal,
}: {
  name: string;
  children: string;
  setAgentRun?: (name: string, goal: string) => void;
  goal: string;
}) => {
  if (setAgentRun && typeof setAgentRun === "function") {
    const handleClick = () => {
      setAgentRun(name, goal);
    };

    return (
      <button
        type="button"
        className="w-full rounded-lg border-2 border-slate-7 bg-slate-1 p-4 text-sm text-slate-12 opacity-90 shadow-depth-2 transition-all duration-300 hover:bg-slate-3 sm:text-base"
        onClick={handleClick}
        data-testid={`example-agent-button-${name}`}
        title={`Run ${name} with goal ${goal}`}
      >
        <p className="text-lg font-bold">{name}</p>
        <p className="mt-2 text-sm">{children}</p>
      </button>
    );
  }

  return null;
};

ExampleAgentButton.propTypes = {
  name: PropTypes.string.isRequired,
  children: PropTypes.string.isRequired,
  setAgentRun: PropTypes.func,
  goal: PropTypes.string.isRequired,
};
