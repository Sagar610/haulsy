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
import { DEMO_PASSWORD, STORE_KEY } from "./constants";
import { uid } from "./format";
import { seedState } from "./seed";
import type {
  AdminEvent,
  AppSettings,
  Booking,
  BookingStatus,
  Listing,
  ListingStatus,
  Message,
  MoverProfile,
  MoveRequest,
  OtpPurpose,
  Review,
  Role,
  StoreState,
  User,
} from "./types";
import { isAdmin } from "./admin";
import {
  e164Canada,
  isDemoPhone,
  looksLikePhone,
  samePhone,
} from "./phone";

function actor(prev: StoreState): User | null {
  const user = prev.users.find((u) => u.id === prev.currentUserId) ?? null;
  return user && isAdmin(user) ? user : null;
}

function withLog(
  prev: StoreState,
  admin: User,
  action: string,
  detail: string,
  patch: Partial<StoreState>,
): StoreState {
  const event: AdminEvent = {
    id: uid("adm"),
    at: new Date().toISOString(),
    actorId: admin.id,
    action,
    detail,
  };
  return {
    ...prev,
    ...patch,
    adminLog: [event, ...(patch.adminLog ?? prev.adminLog)].slice(0, 80),
  };
}

function applyBookingStatus(
  prev: StoreState,
  id: string,
  status: BookingStatus,
  paid?: boolean,
): StoreState {
  const booking = prev.bookings.find((b) => b.id === id);
  if (!booking) return prev;
  const nextPaid = paid ?? booking.paid;
  return {
    ...prev,
    bookings: prev.bookings.map((b) =>
      b.id === id ? { ...b, status, paid: nextPaid } : b,
    ),
    listings: booking.listingId
      ? prev.listings.map((l) => {
          if (l.id !== booking.listingId) return l;
          if (status === "delivered" && nextPaid) return { ...l, status: "sold" };
          if (
            (status === "cancelled" || status === "declined") &&
            !nextPaid
          ) {
            return { ...l, status: "live" };
          }
          return l;
        })
      : prev.listings,
  };
}

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
    identifier: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  loginGoogle: (input: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  }) => { ok: true } | { ok: false; error: string };
  requestOtp: (input: {
    target: string;
    purpose: OtpPurpose;
  }) => Promise<
    | { ok: true; sms: boolean; demoCode?: string }
    | { ok: false; error: string }
  >;
  verifyOtp: (target: string, code: string) => { ok: true } | { ok: false; error: string };
  resetPassword: (
    target: string,
    code: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  loginWithOtp: (
    phone: string,
    code: string,
  ) => { ok: true } | { ok: false; error: string };
  signupWithOtp: (input: {
    name: string;
    phone: string;
    email?: string;
    password?: string;
    city: string;
    role: Role;
    code: string;
  }) => { ok: true } | { ok: false; error: string };
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
  cancelJob: (id: string) => void;
  markPaid: (id: string, paymentId?: string) => void;
  sendMessage: (bookingId: string, body: string) => void;
  addReview: (input: {
    bookingId: string;
    toUserId: string;
    rating: number;
    comment: string;
  }) => void;
  resetDemo: () => void;
  adminCreateUser: (input: {
    name: string;
    email: string;
    phone: string;
    city: string;
    roles: Role[];
  }) => { ok: true } | { ok: false; error: string };
  adminUpdateUser: (
    id: string,
    patch: Partial<Pick<User, "name" | "phone" | "city" | "roles" | "password">>,
  ) => void;
  adminSetSuspended: (id: string, suspended: boolean) => void;
  adminUpdateListing: (
    id: string,
    patch: Partial<Pick<Listing, "title" | "price" | "status" | "city">>,
  ) => void;
  adminSetListingStatus: (id: string, status: ListingStatus) => void;
  adminRemoveMover: (userId: string) => void;
  adminUpdateMoverRates: (
    userId: string,
    patch: Partial<Pick<MoverProfile, "hourlyRate" | "jobRate" | "cities">>,
  ) => void;
  adminForceBookingStatus: (id: string, status: BookingStatus) => void;
  adminRefundJob: (id: string) => void;
  adminRemoveReview: (id: string) => void;
  adminSetSettings: (patch: Partial<AppSettings>) => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function findUser(users: User[], identifier: string): User | undefined {
  const raw = identifier.trim();
  if (!raw) return undefined;
  const em = raw.toLowerCase();
  return users.find((u) => {
    if (u.email && u.email.toLowerCase() === em) return true;
    if (u.googleId && u.googleId === raw) return true;
    return samePhone(u.phone, raw);
  });
}

function otpMatches(
  otp: StoreState["otp"],
  target: string,
  code: string,
  purpose?: OtpPurpose,
): boolean {
  if (!otp) return false;
  if (Date.now() > otp.expiresAt) return false;
  if (otp.code !== code.trim()) return false;
  if (purpose && otp.purpose !== purpose) return false;
  const same =
    otp.target.toLowerCase() === target.trim().toLowerCase() ||
    samePhone(otp.target, target);
  return same;
}

function mergeSeedUsers(stored: User[]): User[] {
  const ids = new Set(stored.map((u) => u.id));
  const emails = new Set(stored.map((u) => u.email.toLowerCase()));
  const missing = seedState.users.filter(
    (u) => !ids.has(u.id) && !emails.has(u.email.toLowerCase()),
  );
  return missing.length ? [...stored, ...missing] : stored;
}

function loadState(): StoreState {
  if (typeof window === "undefined") return seedState;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return seedState;
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.listings)) {
      return seedState;
    }
    return {
      ...seedState,
      ...parsed,
      users: mergeSeedUsers(parsed.users),
      listings: parsed.listings,
      movers: parsed.movers ?? seedState.movers,
      bookings: parsed.bookings ?? seedState.bookings,
      moveRequests: parsed.moveRequests ?? seedState.moveRequests,
      messages: parsed.messages ?? [],
      reviews: parsed.reviews ?? [],
      adminLog: parsed.adminLog ?? seedState.adminLog,
      settings: {
        serviceFeeRate:
          parsed.settings?.serviceFeeRate ?? seedState.settings.serviceFeeRate,
      },
      otp: parsed.otp ?? null,
      currentUserId: parsed.currentUserId ?? null,
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
      if (input.role === "admin") {
        result = { ok: false, error: "Admin accounts cannot be created here." };
        return prev;
      }
      const email = input.email.trim().toLowerCase();
      const phone = input.phone.trim();
      if (!email && !phone) {
        result = { ok: false, error: "Add an email or a mobile number." };
        return prev;
      }
      if (email && prev.users.some((u) => u.email && u.email.toLowerCase() === email)) {
        result = { ok: false, error: "That email is already registered." };
        return prev;
      }
      if (phone && prev.users.some((u) => samePhone(u.phone, phone))) {
        result = { ok: false, error: "That mobile number is already registered." };
        return prev;
      }
      const user: User = {
        id: uid("u"),
        name: input.name,
        email,
        password: input.password,
        phone,
        city: input.city,
        roles: [input.role],
        phoneVerified: Boolean(phone),
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

  const login: StoreContextValue["login"] = useCallback((identifier, password) => {
    let result: { ok: true } | { ok: false; error: string } = {
      ok: false,
      error: "Email, mobile or password is not right.",
    };
    const id = identifier.trim();
    const pw = password.trim();
    flushSync(() => {
      setState((prev) => {
        const user = findUser(prev.users, id);
        if (!user) return prev;
        if (!user.password) {
          result = {
            ok: false,
            error: "This account signs in with Google or a one-time code.",
          };
          return prev;
        }
        if (user.password !== pw) return prev;
        if (user.suspended) {
          result = {
            ok: false,
            error: "This account is suspended. Contact Haulsy support.",
          };
          return prev;
        }
        result = { ok: true };
        return { ...prev, currentUserId: user.id };
      });
    });
    return result;
  }, []);

  const logout = useCallback(() => {
    setState((prev) => ({ ...prev, currentUserId: null }));
  }, []);

  const loginGoogle: StoreContextValue["loginGoogle"] = useCallback((input) => {
    let result: { ok: true } | { ok: false; error: string } = {
      ok: false,
      error: "Google sign-in failed.",
    };
    flushSync(() => {
      setState((prev) => {
        const email = input.email.trim().toLowerCase();
        let user =
          prev.users.find((u) => u.googleId === input.googleId) ??
          prev.users.find((u) => u.email && u.email.toLowerCase() === email);
        if (user?.suspended) {
          result = {
            ok: false,
            error: "This account is suspended. Contact Haulsy support.",
          };
          return prev;
        }
        if (user) {
          result = { ok: true };
          return {
            ...prev,
            users: prev.users.map((u) =>
              u.id === user!.id
                ? {
                    ...u,
                    googleId: input.googleId,
                    name: u.name || input.name,
                    avatar: input.avatar ?? u.avatar,
                    email: u.email || email,
                  }
                : u,
            ),
            currentUserId: user.id,
          };
        }
        const created: User = {
          id: uid("u"),
          name: input.name || "Haulsy member",
          email,
          password: "",
          phone: "",
          city: "Toronto",
          roles: ["buyer"],
          googleId: input.googleId,
          avatar: input.avatar,
        };
        result = { ok: true };
        return {
          ...prev,
          users: [...prev.users, created],
          currentUserId: created.id,
        };
      });
    });
    return result;
  }, []);

  const requestOtp: StoreContextValue["requestOtp"] = useCallback(
    async ({ target, purpose }) => {
      const raw = target.trim();
      if (!raw) return { ok: false, error: "Enter an email or mobile number." };
      const code = String(Math.floor(100000 + Math.random() * 900000));
      let found = false;
      flushSync(() => {
        setState((prev) => {
          if (purpose === "reset" || purpose === "login") {
            const user = findUser(prev.users, raw);
            if (!user) return prev;
            found = true;
          } else {
            found = true;
            if (looksLikePhone(raw) && prev.users.some((u) => samePhone(u.phone, raw))) {
              found = false;
              return prev;
            }
          }
          return {
            ...prev,
            otp: {
              target: raw,
              code,
              purpose,
              expiresAt: Date.now() + 10 * 60 * 1000,
            },
          };
        });
      });
      if (purpose === "reset" || purpose === "login") {
        if (!found) {
          return {
            ok: false,
            error: "No account matches that email or mobile number.",
          };
        }
      } else if (!found) {
        return { ok: false, error: "That mobile number is already registered." };
      }

      if (looksLikePhone(raw) && !isDemoPhone(raw)) {
        try {
          const res = await fetch("/api/otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: e164Canada(raw),
              message: `Your Haulsy code is ${code}. It expires in 10 minutes.`,
            }),
          });
          const data = (await res.json()) as { ok?: boolean };
          if (data.ok) return { ok: true, sms: true };
        } catch {
          /* fall through to demo code */
        }
      }
      return { ok: true, sms: false, demoCode: code };
    },
    [],
  );

  const verifyOtp: StoreContextValue["verifyOtp"] = useCallback((target, code) => {
    const otp = state.otp;
    if (!otpMatches(otp, target, code)) {
      return { ok: false, error: "That code is wrong or has expired." };
    }
    return { ok: true };
  }, [state.otp]);

  const resetPassword: StoreContextValue["resetPassword"] = useCallback(
    (target, code, password) => {
      let result: { ok: true } | { ok: false; error: string } = {
        ok: false,
        error: "Could not reset password.",
      };
      const pw = password.trim();
      if (pw.length < 6) {
        return { ok: false, error: "Use at least 6 characters." };
      }
      flushSync(() => {
        setState((prev) => {
          if (!otpMatches(prev.otp, target, code, "reset")) {
            result = { ok: false, error: "That code is wrong or has expired." };
            return prev;
          }
          const user = findUser(prev.users, target);
          if (!user) {
            result = { ok: false, error: "No account matches that email or mobile." };
            return prev;
          }
          result = { ok: true };
          return {
            ...prev,
            otp: null,
            users: prev.users.map((u) =>
              u.id === user.id ? { ...u, password: pw } : u,
            ),
          };
        });
      });
      return result;
    },
    [],
  );

  const loginWithOtp: StoreContextValue["loginWithOtp"] = useCallback(
    (phone, code) => {
      let result: { ok: true } | { ok: false; error: string } = {
        ok: false,
        error: "That code is wrong or has expired.",
      };
      flushSync(() => {
        setState((prev) => {
          if (!otpMatches(prev.otp, phone, code, "login")) return prev;
          const user = findUser(prev.users, phone);
          if (!user) return prev;
          if (user.suspended) {
            result = {
              ok: false,
              error: "This account is suspended. Contact Haulsy support.",
            };
            return prev;
          }
          result = { ok: true };
          return {
            ...prev,
            otp: null,
            currentUserId: user.id,
            users: prev.users.map((u) =>
              u.id === user.id ? { ...u, phoneVerified: true } : u,
            ),
          };
        });
      });
      return result;
    },
    [],
  );

  const signupWithOtp: StoreContextValue["signupWithOtp"] = useCallback(
    (input) => {
      let result: { ok: true } | { ok: false; error: string } = {
        ok: false,
        error: "Could not create account",
      };
      flushSync(() => {
        setState((prev) => {
          if (input.role === "admin") {
            result = { ok: false, error: "Admin accounts cannot be created here." };
            return prev;
          }
          if (!otpMatches(prev.otp, input.phone, input.code, "signup")) {
            result = { ok: false, error: "That code is wrong or has expired." };
            return prev;
          }
          if (prev.users.some((u) => samePhone(u.phone, input.phone))) {
            result = { ok: false, error: "That mobile number is already registered." };
            return prev;
          }
          const email = (input.email ?? "").trim().toLowerCase();
          if (email && prev.users.some((u) => u.email.toLowerCase() === email)) {
            result = { ok: false, error: "That email is already registered." };
            return prev;
          }
          const user: User = {
            id: uid("u"),
            name: input.name.trim(),
            email,
            password: (input.password ?? "").trim(),
            phone: input.phone.trim(),
            city: input.city,
            roles: [input.role],
            phoneVerified: true,
          };
          result = { ok: true };
          return {
            ...prev,
            otp: null,
            users: [...prev.users, user],
            currentUserId: user.id,
          };
        });
      });
      return result;
    },
    [],
  );

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
                if (
                  (status === "cancelled" || status === "declined") &&
                  !booking.paid
                ) {
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
        listings:
          booking?.listingId && !booking.paid
            ? prev.listings.map((l) =>
                l.id === booking.listingId ? { ...l, status: "live" } : l,
              )
            : prev.listings,
      };
    });
  }, []);

  const cancelJob = useCallback((id: string) => {
    setState((prev) => {
      const booking = prev.bookings.find((b) => b.id === id);
      if (!booking || booking.paid) return prev;
      if (booking.status !== "pending" && booking.status !== "accepted") {
        return prev;
      }
      return {
        ...prev,
        bookings: prev.bookings.map((b) =>
          b.id === id ? { ...b, status: "cancelled" } : b,
        ),
        listings: booking.listingId
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

  const adminCreateUser: StoreContextValue["adminCreateUser"] = useCallback(
    (input) => {
      let result: { ok: true } | { ok: false; error: string } = {
        ok: false,
        error: "Could not create user",
      };
      setState((prev) => {
        const admin = actor(prev);
        if (!admin) return prev;
        const email = input.email.trim().toLowerCase();
        if (!input.name.trim() || !email) {
          result = { ok: false, error: "Name and email are required." };
          return prev;
        }
        if (prev.users.some((u) => u.email.toLowerCase() === email)) {
          result = { ok: false, error: "That email is already registered." };
          return prev;
        }
        const roles = input.roles.length ? input.roles : (["buyer"] as Role[]);
        const user: User = {
          id: uid("u"),
          name: input.name.trim(),
          email,
          password: DEMO_PASSWORD,
          phone: input.phone.trim(),
          city: input.city,
          roles,
        };
        result = { ok: true };
        return withLog(prev, admin, "create_user", `${user.name} · ${user.email}`, {
          users: [...prev.users, user],
        });
      });
      return result;
    },
    [],
  );

  const adminUpdateUser: StoreContextValue["adminUpdateUser"] = useCallback(
    (id, patch) => {
      setState((prev) => {
        const admin = actor(prev);
        const user = prev.users.find((u) => u.id === id);
        if (!admin || !user) return prev;
        if (id === admin.id && patch.roles && !patch.roles.includes("admin")) {
          return prev;
        }
        return withLog(
          prev,
          admin,
          "update_user",
          `${user.name}: ${Object.keys(patch).join(", ")}`,
          {
            users: prev.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
          },
        );
      });
    },
    [],
  );

  const adminSetSuspended: StoreContextValue["adminSetSuspended"] = useCallback(
    (id, suspended) => {
      setState((prev) => {
        const admin = actor(prev);
        const user = prev.users.find((u) => u.id === id);
        if (!admin || !user || user.id === admin.id) return prev;
        return withLog(
          prev,
          admin,
          suspended ? "suspend_user" : "restore_user",
          user.name,
          {
            users: prev.users.map((u) =>
              u.id === id ? { ...u, suspended } : u,
            ),
            currentUserId:
              suspended && prev.currentUserId === id ? prev.currentUserId : prev.currentUserId,
          },
        );
      });
    },
    [],
  );

  const adminUpdateListing: StoreContextValue["adminUpdateListing"] =
    useCallback((id, patch) => {
      setState((prev) => {
        const admin = actor(prev);
        const listing = prev.listings.find((l) => l.id === id);
        if (!admin || !listing) return prev;
        return withLog(
          prev,
          admin,
          "update_listing",
          `${listing.title}: ${Object.keys(patch).join(", ")}`,
          {
            listings: prev.listings.map((l) =>
              l.id === id ? { ...l, ...patch } : l,
            ),
          },
        );
      });
    }, []);

  const adminSetListingStatus: StoreContextValue["adminSetListingStatus"] =
    useCallback((id, status) => {
      setState((prev) => {
        const admin = actor(prev);
        const listing = prev.listings.find((l) => l.id === id);
        if (!admin || !listing) return prev;
        return withLog(prev, admin, "listing_status", `${listing.title} → ${status}`, {
          listings: prev.listings.map((l) =>
            l.id === id ? { ...l, status } : l,
          ),
        });
      });
    }, []);

  const adminRemoveMover: StoreContextValue["adminRemoveMover"] = useCallback(
    (userId) => {
      setState((prev) => {
        const admin = actor(prev);
        const user = prev.users.find((u) => u.id === userId);
        if (!admin || !user) return prev;
        const open = prev.bookings.filter(
          (b) =>
            b.moverId === userId &&
            (b.status === "pending" || b.status === "accepted") &&
            !b.paid,
        );
        let next: StoreState = {
          ...prev,
          movers: prev.movers.filter((m) => m.userId !== userId),
          users: prev.users.map((u) =>
            u.id === userId
              ? { ...u, roles: u.roles.filter((r) => r !== "mover") }
              : u,
          ),
        };
        for (const job of open) {
          next = applyBookingStatus(next, job.id, "declined");
        }
        return withLog(prev, admin, "remove_mover", user.name, {
          movers: next.movers,
          users: next.users,
          bookings: next.bookings,
          listings: next.listings,
        });
      });
    },
    [],
  );

  const adminUpdateMoverRates: StoreContextValue["adminUpdateMoverRates"] =
    useCallback((userId, patch) => {
      setState((prev) => {
        const admin = actor(prev);
        const mover = prev.movers.find((m) => m.userId === userId);
        const user = prev.users.find((u) => u.id === userId);
        if (!admin || !mover || !user) return prev;
        return withLog(prev, admin, "update_mover", user.name, {
          movers: prev.movers.map((m) =>
            m.userId === userId ? { ...m, ...patch } : m,
          ),
        });
      });
    }, []);

  const adminForceBookingStatus: StoreContextValue["adminForceBookingStatus"] =
    useCallback((id, status) => {
      setState((prev) => {
        const admin = actor(prev);
        const booking = prev.bookings.find((b) => b.id === id);
        if (!admin || !booking) return prev;
        const next = applyBookingStatus(prev, id, status);
        return withLog(prev, admin, "job_status", `${id} → ${status}`, {
          bookings: next.bookings,
          listings: next.listings,
        });
      });
    }, []);

  const adminRefundJob: StoreContextValue["adminRefundJob"] = useCallback(
    (id) => {
      setState((prev) => {
        const admin = actor(prev);
        const booking = prev.bookings.find((b) => b.id === id);
        if (!admin || !booking) return prev;
        const next = applyBookingStatus(prev, id, "cancelled", false);
        return withLog(prev, admin, "refund_job", id, {
          bookings: next.bookings,
          listings: next.listings,
        });
      });
    },
    [],
  );

  const adminRemoveReview: StoreContextValue["adminRemoveReview"] = useCallback(
    (id) => {
      setState((prev) => {
        const admin = actor(prev);
        if (!admin) return prev;
        return withLog(prev, admin, "remove_review", id, {
          reviews: prev.reviews.filter((r) => r.id !== id),
        });
      });
    },
    [],
  );

  const adminSetSettings: StoreContextValue["adminSetSettings"] = useCallback(
    (patch) => {
      setState((prev) => {
        const admin = actor(prev);
        if (!admin) return prev;
        const next = { ...prev.settings, ...patch };
        if (typeof next.serviceFeeRate === "number") {
          next.serviceFeeRate = Math.min(0.5, Math.max(0, next.serviceFeeRate));
        }
        return withLog(
          prev,
          admin,
          "settings",
          `Margin ${(next.serviceFeeRate * 100).toFixed(1)}%`,
          { settings: next },
        );
      });
    },
    [],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      hydrated,
      currentUser,
      currentMover,
      signup,
      login,
      loginGoogle,
      requestOtp,
      verifyOtp,
      resetPassword,
      loginWithOtp,
      signupWithOtp,
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
      cancelJob,
      markPaid,
      sendMessage,
      addReview,
      resetDemo,
      adminCreateUser,
      adminUpdateUser,
      adminSetSuspended,
      adminUpdateListing,
      adminSetListingStatus,
      adminRemoveMover,
      adminUpdateMoverRates,
      adminForceBookingStatus,
      adminRefundJob,
      adminRemoveReview,
      adminSetSettings,
    }),
    [
      state,
      hydrated,
      currentUser,
      currentMover,
      signup,
      login,
      loginGoogle,
      requestOtp,
      verifyOtp,
      resetPassword,
      loginWithOtp,
      signupWithOtp,
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
      cancelJob,
      markPaid,
      sendMessage,
      addReview,
      resetDemo,
      adminCreateUser,
      adminUpdateUser,
      adminSetSuspended,
      adminUpdateListing,
      adminSetListingStatus,
      adminRemoveMover,
      adminUpdateMoverRates,
      adminForceBookingStatus,
      adminRefundJob,
      adminRemoveReview,
      adminSetSettings,
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
