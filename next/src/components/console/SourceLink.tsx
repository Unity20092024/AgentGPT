import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { SyntheticEvent } from "react";
import { z } from "zod";

import { env } from "../../env/client.mjs";
import FadeIn from "../motions/FadeIn";

interface LinkInfo {
  link: string;
  index: number;
}

interface MetaData {
  title?: string;
  favicon?: string;
  hostname?: string;
}

const MetaDataSchema = z.object({
  title: z.string().optional(),
  favicon: z.string().optional(),
  hostname: z.string().optional(),
});

const SourceLink = ({ link, index }: LinkInfo) => {
  const linkMeta = useQuery<MetaData, Error>(
    ["linkMeta", link],
    async () => {
      const response = await axios.get<MetaData>(
        env.NEXT_PUBLIC_BACKEND_URL + "/api/metadata",
        {
          params: {
            url: link,
          },
        }
      );
      return MetaDataSchema.parse(response.data);
    }
  ).catch((error) => {
    console.error("Error fetching metadata:", error);
    return {} as MetaData;
  });

  const addImageFallback = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/errorFavicon.ico";
  };

  return (
    <FadeIn>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        key={link}
      >
        <div className="group h-full space-y-2 rounded-lg border border-slate-8 bg-slate-3 p-2 transition-colors duration-300 hover:bg-slate-4">
          {linkMeta.isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-2 rounded bg-slate-8"></div>
              <div className="h-2 rounded bg-slate-8"></div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-slate-8"></div>
                <div className="h-2 w-2/3  rounded bg-slate-8"></div>
              </div>
            </div>
          ) : linkMeta.isSuccess ? (
            <>
              <p className="line-clamp-2 text-xs">{linkMeta.data.title}</p>
              <div className="flex items-center gap-2 overflow-ellipsis">
                <img
                  className="inline h-4 w-4"
                  src={linkMeta.data.favicon ?? ""}
                  alt={`${linkMeta.data.hostname} logo`}
                  onError={addImageFallback}
                />
                <p className="line-clamp-1 overflow-ellipsis">
                  {linkMeta.data.hostname}
                </p>
                <p className="rounded-full bg-slate-5 px-2 text-slate-12 transition-colors duration-300 group-hover:bg-sky-600 group-hover:text-white">
                  {index + 1}
                </p>
              </div>
            </>
          ) : linkMeta.isError ? (
            <div className="flex gap-2">
              <p className="line-clamp-1">{link}</p>
              <p className="rounded-full bg-slate-5 px-3 text-slate-12">
                {index + 1}
              </p>
            </div>
          ) : null}
        </div>
      </a>
    </FadeIn>
  );
};

export default SourceLink;
