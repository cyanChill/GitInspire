import React from "react";

export type ReactChildren = {
  children: React.ReactNode;
};

export type ChildrenClass = {
  className?: string;
} & ReactChildren;

export type UserObjType = {
  id: number;
  username: string;
  avatar_url: string;
  github_created_at: Date;
  account_status: "banned" | "user" | "admin" | "owner";
  last_updated: Date;
  ban_reason?: string;
};

export type NameValsType = { name: string; display_name: string };

export type LangObjType = NameValsType;

export type TagObjType = {
  type: string;
  suggested_by: UserObjType | null;
} & NameValsType;

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

export type ReportObjType = {
  id: number;
  content_id: string;
  type: string;
  reason: string;
  maintain_link: string;
  info: string;
  reported_by: UserObjType;
  created_at: Date;
};

export type LogObjType = {
  id: number;
  action: string;
  type: string;
  content_id: string;
  enacted_by: UserObjType;
  created_at: Date;
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
