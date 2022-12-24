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

export interface Generic_Obj {
  [key: string]: any;
}
