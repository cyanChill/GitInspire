import { createContext, useState, useEffect } from "react";
import { LangObjType, TagObjType, ReactChildren } from "~utils/types";

interface TagsType {
  primary: TagObjType[];
  user_gen: TagObjType[];
}

interface AppContextInterface {
  languages: LangObjType[];
  tags: TagsType;
  addTag: (newTag: TagObjType) => void;
}

export const AppContext = createContext<AppContextInterface | undefined>(
  undefined
);

export default function AppContextProvider({ children }: ReactChildren) {
  const [languages, setLanguages] = useState<LangObjType[]>([]);
  const [tags, setTags] = useState<TagsType>({ primary: [], user_gen: [] });

  // Function to add locally a tag [does not add to backend database]
  const addTag = (newTag: TagObjType) => {
    if (newTag.type === "user_gen") {
      if (tags.user_gen.findIndex((el) => el.name === newTag.name) === -1) {
        setTags((prev) => ({ ...prev, user_gen: [...prev.user_gen, newTag] }));
      }
    } else if (newTag.type === "primary") {
      if (tags.primary.findIndex((el) => el.name === newTag.name) === -1) {
        setTags((prev) => ({ ...prev, primary: [...prev.primary, newTag] }));
      }
    }
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
          langData.languages.sort((a: LangObjType, b: LangObjType) =>
            a.name.localeCompare(b.name)
          )
        );
      }

      if (tagRes.ok) {
        const tagData = await tagRes.json();
        setTags({
          primary: tagData.primary.sort((a: TagObjType, b: TagObjType) =>
            a.name.localeCompare(b.name)
          ),
          user_gen: tagData.user_gen.sort((a: TagObjType, b: TagObjType) =>
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
    <AppContext.Provider value={{ languages, tags, addTag }}>
      {children}
    </AppContext.Provider>
  );
}
