import React from "react";

export interface ReactChildren {
  children: React.ReactNode;
}


enum UserAccountStatusEnum {
  banned = 1,
  user = 2,
  admin = 50,
  owner = 100
}

export interface UserDataObj {
  id: number;
  username: string;
  avatar_url: string;
  github_created_at: Date;
  account_status: UserAccountStatusEnum;
  last_updated: Date;
}


export interface Generic_Obj {
  [key: string]: any
}
