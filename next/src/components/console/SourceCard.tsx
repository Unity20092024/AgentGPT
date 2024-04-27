import SourceLink from "./SourceLink";

type SourceCardProps = {
  content: string;
};

const SourceCard = ({ content }: SourceCardProps) => {
  // Only run regex if content is not null or undefined
  if (!content) return null;

  // Regex pattern:
  // (?<=         - Lookbehind to match the pattern only if preceded by
  //   \[         - An opening square bracket
  //   (          - Start of first capture group
  //     (!        - Escaped exclamation mark
  //     \[.+?\]   - A string enclosed in square brackets
  //     \(.+?\)   - A string enclosed in parentheses
  //     |         - OR
  //     .+?       - Any character (non-greedy)
  //   )          - End of first capture group
  //   \]         - A closing square bracket
  //   \(         - An opening parenthesis
  //   (          - Start of second capture group
  //     https?:\/\/ - Either "http://" or "https://"
  //     [^\)]+    - One or more characters that are not a closing parenthesis
  //   )          - End of second capture group
  //   \)         - A closing parenthesis
  // )            - End of lookbehind
  const regex = /(?<=\[([!\[.+?\]\(.+?\)|.+?)]\((https?:\/\/[^\)]+)\)))/gi;
  const linksSet = new Set<string>();
  let linksMatches = content.match(regex);
  if (linksMatches) linksMatches.forEach((m) => linksSet.add(m));
  const linksArray = Array.from(linksSet);

  if (linksArray.length === 0) return null;

  return (
    <>
      <div className="my-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {linksArray.map((link, index) => (
          <SourceLink key={link} link={link} index={index} />
        ))}
      </div>
    </>
  );
};

export default SourceCard;
