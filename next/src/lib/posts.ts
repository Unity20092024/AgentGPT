import fs from "fs";
import path from "path";

import matter from "gray-matter";

// Define the types for the data
export interface SlugData {
  id: string;
  date: string;

  [key: string]: string;
}

const postsDirectory = path.join(process.cwd(), "posts");

export function getSortedPostsData(): SlugData[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData: SlugData[] = fileNames.map((fileName) => {
    const id = fileName.replace(/\.mdx$/, "");
    const fullPath = path.join(postsDirectory, fileName);

    try {
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        id,
        date: matterResult.data?.date || "",
        ...matterResult.data,
      };
    } catch (error) {
      console.error(`Error reading file ${fullPath}:`, error);
      return { id };
    }
  });

  return allPostsData.sort((a, b) => {
    if (!a.date || !b.date) {
      return 0;
    }

    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export interface PostData {
  slug: string;
  content: string;

  [key: string]: string;
}

export function getPostData(slug: string): PostData {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      slug,
      ...matterResult.data,
      content: matterResult.content,
    };
  } catch (error) {
    console.error(`Error reading file ${fullPath}:`, error);
    return { slug };
  }
}
