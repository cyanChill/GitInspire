import React from "react";
import {IconType} from 'react-icons'

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

export interface RouteObj {
  href: string;
  icon: IconType;
  name: string;
  security: "" | "no-auth" | "auth" | "admin" | "owner";
}

