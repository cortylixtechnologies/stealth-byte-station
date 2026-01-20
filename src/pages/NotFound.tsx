import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursor((c) => !c);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground font-mono">
      <div className="max-w-xl w-full border border-border rounded-lg bg-card p-6 shadow-lg">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2">root@cyberninja:~</span>
        </div>

        {/* Terminal Body */}
        <div className="text-left space-y-3 text-sm">
          <p>
            <span className="text-secondary">{">"}</span> accessing:{" "}
            <span className="text-primary">{location.pathname}</span>
          </p>

          <p className="text-red-500">
            <span className="text-secondary">{">"}</span> ERROR 404: TARGET NOT FOUND
          </p>

          <p className="text-muted-foreground">
            The requested resource does not exist or access is restricted.
          </p>

          <p>
            <span className="text-secondary">{">"}</span> abort mission
          </p>

          <p>
            <span className="text-secondary">{">"}</span>{" "}
            <Link
              to="/"
              className="text-primary hover:underline"
            >
              return_to_home
            </Link>
            <span className="ml-1">{cursor ? "█" : " "}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
