/**
 * Offline Store-and-Forward Telemetry & Handover Queue for Drivers
 * References: ADR-007, DOC-REQ-DRI-001 (DRI-04), UX-SPEC-DRI-001
 */

import { authenticatedFetch } from "./auth";

export interface QueuedDriverEvent {
  idempotency_key: string;
  event_type: "TELEMETRY_PING" | "PICKUP_HANDSHAKE" | "GATE_ARRIVAL";
  batch_id: string;
  lat: number;
  lng: number;
  tank_temp_c: string;
  recorded_at: string;
}

const STORAGE_KEY = "zaminflow_driver_offline_queue_v1";

export function getQueuedDriverEvents(): QueuedDriverEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function enqueueDriverEvent(
  event: Omit<QueuedDriverEvent, "idempotency_key" | "recorded_at">
): QueuedDriverEvent {
  const fullEvent: QueuedDriverEvent = {
    ...event,
    idempotency_key: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    recorded_at: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const existing = getQueuedDriverEvents();
    existing.push(fullEvent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
  return fullEvent;
}

export async function flushDriverOfflineQueue(): Promise<{
  syncedCount: number;
  remainingCount: number;
}> {
  const queued = getQueuedDriverEvents();
  if (queued.length === 0) {
    return { syncedCount: 0, remainingCount: 0 };
  }

  try {
    const res = await authenticatedFetch("/driver/offline-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: queued }),
    });
    if (res.ok) {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
      return { syncedCount: queued.length, remainingCount: 0 };
    }
  } catch {
    // Still offline — retain queue for next reconnect
  }
  return { syncedCount: 0, remainingCount: queued.length };
}
