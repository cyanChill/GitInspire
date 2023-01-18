import { useState, useEffect } from "react";

import { RepositoryObj } from "~utils/types";

type RepoInfoCardProps = {
  handleRefresh: (exists: boolean, refreshData?: RepositoryObj) => void;
  handleClose: () => void;
  repository: RepositoryObj;
};

export default function RepoInfoCard({
  handleRefresh,
  handleClose,
  repository,
}: RepoInfoCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const refreshInfo = () => {};

  useEffect(() => {
    setIsVisible(true);
  }, [repository]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isVisible) timeout = setTimeout(() => handleClose(), 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isVisible, handleClose]);

  return (
    <div className={`animate-load-in ${!isVisible ? "animate-load-out" : ""}`}>
      Suggested Repository Info Card
    </div>
  );
}
