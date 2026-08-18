export type Role = "buyer" | "seller" | "mover" | "admin";

export type VehicleType = "car" | "estate" | "van" | "large_van" | "luton";

export type ListingCategory =
  | "sofa"
  | "table"
  | "bed"
  | "storage"
  | "appliance"
  | "gym"
  | "other";

export type ListingStatus = "live" | "reserved" | "sold" | "withdrawn";

export type BookingType = "marketplace" | "move";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "assigned"
  | "en_route"
  | "delivered"
  | "declined"
  | "cancelled";

export type LoadPreset = "few_items" | "studio" | "one_bed" | "two_bed" | "three_bed";

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type AvailabilityWindow = {
  day: DayOfWeek;
  start: string;
  end: string;
};

export type TimeSlot = {
  date: string;
  start: string;
  end: string;
};

export type GeoPoint = {
  lat: number;
  lng: number;
  label: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  roles: Role[];
  avatar?: string;
  suspended?: boolean;
  googleId?: string;
  phoneVerified?: boolean;
};

export type Listing = {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  category: ListingCategory;
  photos: string[];
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  weightKg: number;
  price: number;
  city: string;
  pickupAddress: string;
  status: ListingStatus;
  createdAt: string;
};

export type MoverProfile = {
  id: string;
  userId: string;
  vehicle: VehicleType;
  capacityM3: number;
  maxKg: number;
  hourlyRate: number;
  jobRate: number;
  cities: string[];
  availability: AvailabilityWindow[];
  bio: string;
  photo?: string;
};

export type MoveRequest = {
  id: string;
  customerId: string;
  fromAddress: string;
  fromCity: string;
  toAddress: string;
  toCity: string;
  loadPreset: LoadPreset;
  notes: string;
  when: TimeSlot;
  createdAt: string;
};

export type Booking = {
  id: string;
  type: BookingType;
  customerId: string;
  moverId: string;
  listingId?: string;
  moveRequestId?: string;
  slot: TimeSlot;
  pickupAddress: string;
  pickupCity: string;
  deliveryAddress: string;
  deliveryCity: string;
  pickup: GeoPoint;
  dropoff: GeoPoint;
  distanceKm: number;
  itemPrice: number;
  haulFee: number;
  serviceFee: number;
  total: number;
  paid: boolean;
  paymentId?: string;
  status: BookingStatus;
  notes: string;
  createdAt: string;
};

export type Message = {
  id: string;
  bookingId: string;
  fromUserId: string;
  body: string;
  createdAt: string;
};

export type Review = {
  id: string;
  bookingId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type AdminEvent = {
  id: string;
  at: string;
  actorId: string;
  action: string;
  detail: string;
};

export type OtpPurpose = "reset" | "signup" | "login";

export type OtpChallenge = {
  target: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: number;
};

export type AppSettings = {
  serviceFeeRate: number;
};

export type StoreState = {
  users: User[];
  listings: Listing[];
  movers: MoverProfile[];
  bookings: Booking[];
  moveRequests: MoveRequest[];
  messages: Message[];
  reviews: Review[];
  adminLog: AdminEvent[];
  settings: AppSettings;
  otp: OtpChallenge | null;
  currentUserId: string | null;
};
