import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import issueService from "../services/issueService";

const IssueContext = createContext(null);

const getError = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request failed. Please try again.";

const mapIssue = (issue) => ({
  ...issue,
  vehicle: issue.vehicle_number || "Unavailable",
  reportedBy: issue.reported_by || "Unknown",
  date: issue.reported_date,
});

function IssueSessionProvider({ children, token }) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const mounted = useRef(false);
  const requestId = useRef(0);
  const mutationBusy = useRef(false);

  const refreshIssues = useCallback(async () => {
    if (!token) return false;

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");

    try {
      const rows = await issueService.getAll();

      if (
        !mounted.current ||
        currentRequest !== requestId.current
      ) {
        return false;
      }

      setIssues(rows.map(mapIssue));
      return true;
    } catch (err) {
      if (
        mounted.current &&
        currentRequest === requestId.current
      ) {
        setError(getError(err));
      }

      return false;
    } finally {
      if (
        mounted.current &&
        currentRequest === requestId.current
      ) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    mounted.current = true;

    if (token) {
      refreshIssues();
    }

    return () => {
      mounted.current = false;
      requestId.current += 1;
    };
  }, [token, refreshIssues]);

  const updateIssueStatus = async (id, status) => {
    if (!token || mutationBusy.current) return false;

    mutationBusy.current = true;
    setUpdatingId(id);
    setError("");

    try {
      await issueService.updateStatus(id, status);

      if (!mounted.current) return false;

      return await refreshIssues();
    } catch (err) {
      if (mounted.current) {
        setError(getError(err));
      }

      return false;
    } finally {
      mutationBusy.current = false;

      if (mounted.current) {
        setUpdatingId(null);
      }
    }
  };

  const addIssue = async ({ title, description, priority }) => {
    if (!token || mutationBusy.current) return false;

    mutationBusy.current = true;
    setError("");

    try {
      await issueService.create({
        title,
        description,
        priority,
      });

      if (!mounted.current) return false;

      return await refreshIssues();
    } catch (err) {
      if (mounted.current) {
        setError(getError(err));
      }

      return false;
    } finally {
      mutationBusy.current = false;
    }
  };

  const openIssues = useMemo(
    () => issues.filter((issue) => issue.status !== "RESOLVED"),
    [issues]
  );

  return (
    <IssueContext.Provider
      value={{
        issues,
        openIssues,
        loading,
        error,
        updatingId,
        refreshIssues,
        addIssue,
        updateIssueStatus,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

export function IssueProvider({ children }) {
  const { token } = useAuth();

  return (
    <IssueSessionProvider key={token || "signed-out"} token={token}>
      {children}
    </IssueSessionProvider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);

  if (!context) {
    throw new Error("useIssues must be used inside IssueProvider");
  }

  return context;
}