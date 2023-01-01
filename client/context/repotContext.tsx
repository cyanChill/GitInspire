import { createContext, useState, useEffect } from "react";
import { LangObj, TagObj, ReactChildren } from "~utils/types";

interface TagsType {
  primary: TagObj[];
  user_gen: TagObj[];
}

interface RepotContextInterface {
  languages: LangObj[];
  tags: TagsType;
  addTag: (newTag: TagObj) => void;
}

export const RepotContext = createContext<RepotContextInterface | undefined>(
  undefined
);

export default function RepotContextProvider({ children }: ReactChildren) {
  const [languages, setLanguages] = useState<LangObj[]>([]);
  const [tags, setTags] = useState<TagsType>({ primary: [], user_gen: [] });

  // Function to add locally a tag [does not add to backend database]
  const addTag = (newTag: TagObj) => {
    const exists = tags.user_gen.findIndex((el) => el.name === newTag.name);
    if (exists > -1) return;

    setTags((prev) => ({
      primary: prev.primary,
      user_gen: [...prev.user_gen, newTag],
    }));
  };

  const loadData = async () => {
    try {
      const [langRes, tagRes] = await Promise.all([
        fetch("/api/languages"),
        fetch("/api/tags"),
      ]);

      if (langRes.ok) {
        const langData = await langRes.json();
        setLanguages(
          langData.languages.sort((a: LangObj, b: LangObj) =>
            a.name.localeCompare(b.name)
          )
        );
      }

      if (tagRes.ok) {
        const tagData = await tagRes.json();
        setTags({
          primary: tagData.primary.sort((a: TagObj, b: TagObj) =>
            a.name.localeCompare(b.name)
          ),
          user_gen: tagData.user_gen.sort((a: TagObj, b: TagObj) =>
            a.name.localeCompare(b.name)
          ),
        });
      }
    } catch (err) {
      console.log("Failed to get response from server.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <RepotContext.Provider value={{ languages, tags, addTag }}>
      {children}
    </RepotContext.Provider>
  );
}
