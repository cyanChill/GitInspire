import React from "react";

export interface ReactChildren {
  children: React.ReactNode;
}

export interface UserObj {
  id: number;
  username: string;
  avatar_url: string;
  github_created_at: Date;
  account_status: "banned" | "user" | "admin" | "owner";
  last_updated: Date;
}

export interface LangObj {
  name: string;
  display_name: string;
}

export interface TagObj {
  name: string;
  display_name: string;
  type: string;
  suggested_by: UserObj | null;
}

export interface RepositoryObj {
  id: number;
  author: string;
  repo_name: string;
  description: string | null;
  stars: number;
  repo_link: string;
  maintain_link: string | null;
  languages: LangObj[];
  primary_tag: TagObj;
  tags: TagObj[];
  suggested_by: UserObj;
  last_updated: Date;
}

export interface Generic_Obj {
  [key: string]: any;
}

export interface RouteObj {
  href: string;
  icon: JSX.Element;
  name: string;
}
