import type { PropsWithChildren } from "react";

import AppHead from "../components/AppHead";

interface Props extends PropsWithChildren {
  title: string;
  description?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function GridLayout(props: Props) {
  return (
    <div
      className={props.className}
      style={{
        backgroundSize: "80px 80px",
        backgroundImage:
          "linear-gradient(to right, #F1F3F5 2px, transparent 2px), linear-gradient(to bottom, #F1F3F5 1px, transparent 1px)",
      }}
    >
      <AppHead
        title={props.title}
        description={props.description}
        defaultChecked={props.defaultChecked}
        onChange={props.onChange}
        style={{
          fontSize: "2rem",
          color: "#333",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      />
      {props.children}
    </div>
  );
}

