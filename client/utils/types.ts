import React from "react";

export interface ReactChildren {
  children: React.ReactNode;
}

export type UserObjType = {
  id: number;
  username: string;
  avatar_url: string;
  github_created_at: Date;
  account_status: "banned" | "user" | "admin" | "owner";
  last_updated: Date;
};

export type LangObjType = {
  name: string;
  display_name: string;
};

export type TagObjType = {
  name: string;
  display_name: string;
  type: string;
  suggested_by: UserObjType | null;
};

export type RepositoryObjType = {
  id: number;
  author: string;
  repo_name: string;
  description: string | null;
  stars: number;
  repo_link: string;
  maintain_link: string | null;
  languages: LangObjType[];
  primary_tag: TagObjType;
  tags: TagObjType[];
  suggested_by: UserObjType;
  last_updated: Date;
};

export interface Generic_Obj {
  [key: string]: any;
}

export type RouteObjType = {
  href: string;
  icon: JSX.Element;
  name: string;
};

export type URLQueryValType = string | string[] | undefined;
