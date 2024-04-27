import { useSession } from "next-auth/react";
import React from "react";

import { ExampleAgentButton } from "./ExampleAgentButton";
import { useSID } from "../../hooks/useSID";
import FadeIn from "../motions/FadeIn";

type ExampleAgentButtonProps = {
  name: string;
  setAgentRun: (name: string, goal: string) => void;
  goal: string;
  key: string;
  disabled: boolean;
  title: string;
};

type ExampleAgentsProps = {
  setAgentRun?: (name: string, goal: string) => void;
  setShowSignIn: (show: boolean) => void;
};

const ExampleAgents = ({ setAgentRun, setShowSignIn }: ExampleAgentsProps) => {
  const { data: session } = useSession();
  const sid = useSID(session);

  return (
    <>
      <FadeIn delay={0.9} duration={0.5}>
        <div className="my-2 grid grid-cols-1 items-stretch gap-2 sm:my-4 sm:grid-cols-3">
          <ExampleAgentButton
            name="TravelGPT 🌴"
            setAgentRun={setAgentRun}
            goal="Plan a detailed trip to Hawaii"
            key="travel-gpt"
            disabled={!sid}
            title="Plan a detailed trip to Hawaii with TravelGPT"
          />

          <ExampleAgentButton
            name="CalculusGPT 📚"
            setAgentRun={setAgentRun}
            goal="Create a study plan for an intro to Calculus exam"
            key="calculus-gpt"
            disabled={!sid}
            title="Create a study plan for an intro to Calculus exam with CalculusGPT"
          />

          <ExampleAgentButton
            name="HustleGPT 🚀"
            setAgentRun={setAgentRun}
            goal="Create a comprehensive report for how to scale a startup to 1000 customers"
            key="hustle-gpt"
            disabled={!sid}
            title="Create a comprehensive report for how to scale a startup to 1000 customers with HustleGPT"
          />
        </div>
      </FadeIn>
    </>
  );
};

export default ExampleAgents;
