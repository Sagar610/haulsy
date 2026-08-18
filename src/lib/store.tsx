"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { STORE_KEY } from "./constants";
import { uid } from "./format";
import { seedState } from "./seed";
import type {
  Booking,
  BookingStatus,
  Listing,
  Message,
  MoverProfile,
  MoveRequest,
  Review,
  Role,
  StoreState,
  User,
} from "./types";

type StoreContextValue = StoreState & {
  hydrated: boolean;
  currentUser: User | null;
  currentMover: MoverProfile | null;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    city: string;
    phone: string;
    role: Role;
  }) => { ok: true } | { ok: false; error: string };
  login: (
    email: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  logout: () => void;
  updateAccount: (patch: Partial<Pick<User, "name" | "phone" | "city" | "password">>) => void;
  createListing: (
    listing: Omit<Listing, "id" | "sellerId" | "createdAt" | "status">,
  ) => Listing;
  updateListingStatus: (id: string, status: Listing["status"]) => void;
  upsertMover: (
    profile: Omit<MoverProfile, "id" | "userId">,
  ) => MoverProfile;
  createMoveRequest: (
    req: Omit<MoveRequest, "id" | "customerId" | "createdAt">,
  ) => MoveRequest;
  createBooking: (
    booking: Omit<Booking, "id" | "customerId" | "createdAt" | "status" | "paid">,
  ) => Booking;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  acceptJob: (id: string) => void;
  declineJob: (id: string) => void;
  markPaid: (id: string, paymentId?: string) => void;
  sendMessage: (bookingId: string, body: string) => void;
  addReview: (input: {
    bookingId: string;
    toUserId: string;
    rating: number;
    comment: string;
  }) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function loadState(): StoreState {
  if (typeof window === "undefined") return seedState;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return seedState;
    const parsed = JSON.parse(raw) as StoreState;
    if (!parsed.users || !parsed.listings) return seedState;
    return {
      ...parsed,
      messages: parsed.messages ?? [],
      reviews: parsed.reviews ?? [],
    };
  } catch {
    return seedState;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(seedState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadState();
    const t = window.setTimeout(() => {
      setState(saved);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const currentUser =
    state.users.find((u) => u.id === state.currentUserId) ?? null;
  const currentMover =
    state.movers.find((m) => m.userId === state.currentUserId) ?? null;

  const signup: StoreContextValue["signup"] = useCallback((input) => {
    let result: { ok: true } | { ok: false; error: string } = {
      ok: false,
      error: "Could not create account",
    };
    setState((prev) => {
      if (prev.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
        result = { ok: false, error: "That email is already registered." };
        return prev;
      }
      const user: User = {
        id: uid("u"),
        name: input.name,
        email: input.email.toLowerCase(),
        password: input.password,
        phone: input.phone,
        city: input.city,
        roles: [input.role],
      };
      result = { ok: true };
      return {
        ...prev,
        users: [...prev.users, user],
        currentUserId: user.id,
      };
    });
    return result;
  }, []);

  const login: StoreContextValue["login"] = useCallback((email, password) => {
    let result: { ok: true } | { ok: false; error: string } = {
      ok: false,
      error: "Email or password is not right.",
    };
    setState((prev) => {
      const user = prev.users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password,
      );
      if (!user) return prev;
      result = { ok: true };
      return { ...prev, currentUserId: user.id };
    });
    return result;
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUserId: null }));
  }, []);

  const updateAccount: StoreContextValue["updateAccount"] = useCallback(
    (patch) => {
      setState((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.id === prev.currentUserId ? { ...u, ...patch } : u,
        ),
      }));
    },
    [],
  );

  const createListing: StoreContextValue["createListing"] = useCallback(
    (listing) => {
      const created: Listing = {
        ...listing,
        id: uid("l"),
        sellerId: state.currentUserId ?? "",
        status: "live",
        createdAt: new Date().toISOString(),
      };
      flushSync(() => {
        setState((prev) => {
          if (!prev.currentUserId) return prev;
          return {
            ...prev,
            listings: [{ ...created, sellerId: prev.currentUserId }, ...prev.listings],
            users: prev.users.map((u) =>
              u.id === prev.currentUserId && !u.roles.includes("seller")
                ? { ...u, roles: [...u.roles, "seller"] }
                : u,
            ),
          };
        });
      });
      return created;
    },
    [state.currentUserId],
  );

  const updateListingStatus = useCallback(
    (id: string, status: Listing["status"]) => {
      setState((prev) => ({
        ...prev,
        listings: prev.listings.map((l) =>
          l.id === id ? { ...l, status } : l,
        ),
      }));
    },
    [],
  );

  const upsertMover: StoreContextValue["upsertMover"] = useCallback(
    (profile) => {
      let saved: MoverProfile | null = null;
      setState((prev) => {
        if (!prev.currentUserId) return prev;
        const existing = prev.movers.find((m) => m.userId === prev.currentUserId);
        const next: MoverProfile = existing
          ? { ...existing, ...profile, id: existing.id, userId: existing.userId }
          : {
              ...profile,
              id: uid("m"),
              userId: prev.currentUserId,
            };
        saved = next;
        return {
          ...prev,
          movers: existing
            ? prev.movers.map((m) => (m.userId === prev.currentUserId ? next : m))
            : [...prev.movers, next],
          users: prev.users.map((u) =>
            u.id === prev.currentUserId && !u.roles.includes("mover")
              ? { ...u, roles: [...u.roles, "mover"] }
              : u,
          ),
        };
      });
      return saved as unknown as MoverProfile;
    },
    [],
  );

  const createMoveRequest: StoreContextValue["createMoveRequest"] = useCallback(
    (req) => {
      const created: MoveRequest = {
        ...req,
        id: uid("mv"),
        customerId: state.currentUserId ?? "",
        createdAt: new Date().toISOString(),
      };
      flushSync(() => {
        setState((prev) => {
          if (!prev.currentUserId) return prev;
          return { ...prev, moveRequests: [created, ...prev.moveRequests] };
        });
      });
      return created;
    },
    [state.currentUserId],
  );

  const createBooking: StoreContextValue["createBooking"] = useCallback(
    (booking) => {
      const created: Booking = {
        ...booking,
        id: uid("b"),
        customerId: "",
        paid: false,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      flushSync(() => {
        setState((prev) => {
          if (!prev.currentUserId) return prev;
          created.customerId = prev.currentUserId;
          return {
            ...prev,
            bookings: [created, ...prev.bookings],
            listings: booking.listingId
              ? prev.listings.map((l) =>
                  l.id === booking.listingId ? { ...l, status: "reserved" } : l,
                )
              : prev.listings,
            users: prev.users.map((u) =>
              u.id === prev.currentUserId && !u.roles.includes("buyer")
                ? { ...u, roles: [...u.roles, "buyer"] }
                : u,
            ),
          };
        });
      });
      return created;
    },
    [],
  );

  const updateBookingStatus = useCallback(
    (id: string, status: BookingStatus) => {
      setState((prev) => {
        const booking = prev.bookings.find((b) => b.id === id);
        return {
          ...prev,
          bookings: prev.bookings.map((b) =>
            b.id === id ? { ...b, status } : b,
          ),
          listings: booking?.listingId
            ? prev.listings.map((l) => {
                if (l.id !== booking.listingId) return l;
                if (status === "delivered") return { ...l, status: "sold" };
                if (status === "cancelled" || status === "declined") {
                  return { ...l, status: "live" };
                }
                return l;
              })
            : prev.listings,
        };
      });
    },
    [],
  );

  const acceptJob = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) =>
        b.id === id ? { ...b, status: "accepted" } : b,
      ),
    }));
  }, []);

  const declineJob = useCallback((id: string) => {
    setState((prev) => {
      const booking = prev.bookings.find((b) => b.id === id);
      return {
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, status: "declined" } : b,
        ),
        listings: booking?.listingId
          ? prev.listings.map((l) =>
              l.id === booking.listingId ? { ...l, status: "live" } : l,
            )
          : prev.listings,
      };
    });
  }, []);

  const markPaid = useCallback((id: string, paymentId?: string) => {
    setState((prev) => {
      const booking = prev.bookings.find((b) => b.id === id);
      return {
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === id
            ? { ...b, paid: true, paymentId, status: "assigned" }
            : b,
        ),
        listings: booking?.listingId
          ? prev.listings.map((l) =>
              l.id === booking.listingId ? { ...l, status: "sold" } : l,
            )
          : prev.listings,
      };
    });
  }, []);

  const sendMessage = useCallback((bookingId: string, body: string) => {
    const text = body.trim();
    if (!text) return;
    setState((prev) => {
      if (!prev.currentUserId) return prev;
      const msg: Message = {
        id: uid("msg"),
        bookingId,
        fromUserId: prev.currentUserId,
        body: text,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, messages: [...prev.messages, msg] };
    });
  }, []);

  const addReview: StoreContextValue["addReview"] = useCallback((input) => {
    setState((prev) => {
      if (!prev.currentUserId) return prev;
      if (
        prev.reviews.some(
          (r) =>
            r.bookingId === input.bookingId &&
            r.fromUserId === prev.currentUserId,
        )
      ) {
        return prev;
      }
      const review: Review = {
        id: uid("rv"),
        bookingId: input.bookingId,
        fromUserId: prev.currentUserId,
        toUserId: input.toUserId,
        rating: input.rating,
        comment: input.comment.trim(),
        createdAt: new Date().toISOString(),
      };
      return { ...prev, reviews: [...prev.reviews, review] };
    });
  }, []);

  const resetDemo = useCallback(() => {
    window.localStorage.removeItem(STORE_KEY);
    setState(seedState);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      hydrated,
      currentUser,
      currentMover,
      signup,
      login,
      logout,
      updateAccount,
      createListing,
      updateListingStatus,
      upsertMover,
      createMoveRequest,
      createBooking,
      updateBookingStatus,
      acceptJob,
      declineJob,
      markPaid,
      sendMessage,
      addReview,
      resetDemo,
    }),
    [
      state,
      hydrated,
      currentUser,
      currentMover,
      signup,
      login,
      logout,
      updateAccount,
      createListing,
      updateListingStatus,
      upsertMover,
      createMoveRequest,
      createBooking,
      updateBookingStatus,
      acceptJob,
      declineJob,
      markPaid,
      sendMessage,
      addReview,
      resetDemo,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
