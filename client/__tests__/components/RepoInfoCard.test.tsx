import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import RepoInfoCard from "~components/repository/RepoInfoCard";
import { RepositoryObjType, TagObjType, UserObjType } from "~utils/types";

// Mock useRouter Hook
const useRouter = jest.spyOn(require("next/router"), "useRouter");
// Mocking Custom Hooks:
//  - Ref: https://stackoverflow.com/a/65340319
jest.mock("~hooks/useUserContext", () => ({
  __esModule: true,
  default: () => ({ isAuthenticated: false }),
}));

describe("<RepoInfoCard />", () => {
  const handleRefresh = jest.fn();
  const handleClose = jest.fn();
  const user: UserObjType = {
    id: 83375816,
    username: "cyanChill",
    avatar_url: "https://avatars.githubusercontent.com/u/83375816?v=4",
    github_created_at: new Date("2020-04-28T21:49:19Z"),
    account_status: "admin",
    last_updated: new Date("2022-01-01T21:49:19Z"),
  };
  const primaryTag: TagObjType = {
    display_name: "Project Idea",
    name: "project_idea",
    type: "primary",
    suggested_by: user,
  };
  const repository: RepositoryObjType = {
    id: 407959883,
    author: "cyanChill",
    repo_name: "Battleship",
    description: null,
    stars: 0,
    repo_link: "https://github.com/cyanChill/Battleship",
    maintain_link: null,
    languages: [
      { display_name: "JavaScript", name: "javascript" },
      { display_name: "CSS", name: "css" },
      { display_name: "HTML", name: "html" },
    ],
    primary_tag: primaryTag,
    tags: [],
    suggested_by: user,
    last_updated: new Date("2022-01-01T21:49:19Z"),
  };

  useRouter.mockImplementation(() => ({ push: () => {} }));

  beforeEach(() => {
    render(
      <RepoInfoCard
        repository={repository}
        handleRefresh={handleRefresh}
        handleClose={handleClose}
      />
    );
  });

  it("displays <author>/<reponame>", () => {
    expect(screen.getByTestId("RepoInfoCard-card-title")).toHaveTextContent(
      "cyanChill/Battleship"
    );
  });

  it("displays correct number of stars", () => {
    expect(screen.getByTestId("RepoInfoCard-stars")).toHaveTextContent("0");
  });

  it("displays correct number of widgets (tags + languages)", () => {
    expect(screen.getByTestId("RepoInfoCard-widgets")).toHaveTextContent(
      "JavaScriptCSSHTMLProject Idea"
    );
  });

  it("displays correct description", () => {
    expect(screen.getByTestId("RepoInfoCard-description")).toHaveTextContent(
      "No Description"
    );
  });

  it("displays correct accredition", () => {
    expect(screen.getByTestId("RepoInfoCard-suggested_by")).toHaveTextContent(
      "Suggested By: cyanChill"
    );
    expect(screen.getByTestId("RepoInfoCard-last_updated")).toHaveTextContent(
      "Last Updated: 01/01/2022 21:49:19"
    );
  });
});
