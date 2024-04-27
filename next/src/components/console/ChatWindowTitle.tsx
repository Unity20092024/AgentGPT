import React from "react";

type GPTModelNames = "GPT-3.5" | "GPT-3.5-16K" | "GPT-4";

export const ChatWindowTitle: React.FC<{ model: GPTModelNames }> = ({ model }) => {
  const getModelName = () => {
    if (model === "GPT-4") {
      return <span className="text-amber-500">GPT-4</span>;
    }

    if (model === "GPT-3.5-16K") {
      return (
        <span className="text-neutral-400">
          GPT-3.5<span className="text-amber-500">-16K</span>
        </span>
      );
    }

    return <span className="text-neutral-400">GPT-3.5</span>;
  };

  return (
    <>
      Agent {getModelName()}
    </>
  );
};
