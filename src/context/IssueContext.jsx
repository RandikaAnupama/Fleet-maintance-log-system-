import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { issuesSeed } from "../data/mockData";

const IssueContext = createContext(null);
const STORAGE_KEY = "fleet_issues";

function loadIssues() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : issuesSeed;
  } catch {
    return issuesSeed;
  }
}

export function IssueProvider({ children }) {
  const [issues, setIssues] = useState(loadIssues);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
  }, [issues]);

  const addIssue = ({ title, description, priority, vehicle, reportedBy }) => {
    const newIssue = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      vehicle,
      reportedBy,
      priority,
      status: "OPEN",
      date: new Date().toISOString().slice(0, 10)
    };

    setIssues((current) => [newIssue, ...current]);
    return newIssue;
  };

  const updateIssueStatus = (id, status) => {
    setIssues((current) =>
      current.map((issue) =>
        issue.id === id ? { ...issue, status } : issue
      )
    );
  };

  const openIssues = useMemo(
    () => issues.filter((issue) => issue.status !== "RESOLVED"),
    [issues]
  );

  const value = {
    issues,
    openIssues,
    addIssue,
    updateIssueStatus
  };

  return <IssueContext.Provider value={value}>{children}</IssueContext.Provider>;
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error("useIssues must be used inside IssueProvider");
  }
  return context;
}
