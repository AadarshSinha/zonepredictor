import { useCallback, useEffect, useRef, useState } from "react";

import { getHealth } from "../api/client";
import { getApiBaseUrl } from "../config";

const ONLINE_POLL_MS = 60000;
const OFFLINE_POLL_MS = 10000; // recover quickly once the server comes back

/**
 * Polls /health so the UI can say "the server is down" before the user has
 * wasted a screenshot on it.
 *
 * `status` is one of:
 *   checking  — first probe in flight, say nothing yet to avoid a flash
 *   online    — server answered; `info` carries version / supported maps
 *   offline   — server unreachable or erroring
 */
export function useBackendStatus() {
  const [status, setStatus] = useState("checking");
  const [info, setInfo] = useState(null);

  // Re-probe immediately when the endpoint is switched from the footer.
  const baseUrl = getApiBaseUrl();
  const timerRef = useRef(null);
  const aliveRef = useRef(true);

  const check = useCallback(async () => {
    try {
      const data = await getHealth();
      if (!aliveRef.current) return "online";
      setInfo(data);
      setStatus("online");
      return "online";
    } catch {
      if (!aliveRef.current) return "offline";
      setStatus("offline");
      return "offline";
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;

    const tick = async () => {
      const next = await check();
      if (!aliveRef.current) return;
      timerRef.current = setTimeout(
        tick,
        next === "online" ? ONLINE_POLL_MS : OFFLINE_POLL_MS
      );
    };
    tick();

    return () => {
      aliveRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [check, baseUrl]);

  return { status, info, recheck: check };
}
