import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const supportsSmoothScroll = typeof window !== "undefined" && "scrollBehavior" in document.documentElement.style;

/**
 * ScrollToTop
 * - Smooth scrolls to top on every route/pathname change
 * - Falls back to instant scroll if the browser does not support smooth behavior
 * - Works globally when placed inside BrowserRouter
 */
function ScrollToTop({ behavior = "smooth" }) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollBehavior = behavior === "instant" || !supportsSmoothScroll ? "auto" : "smooth";

    window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior });
  }, [pathname, behavior]);

  return null;
}

export default ScrollToTop;
