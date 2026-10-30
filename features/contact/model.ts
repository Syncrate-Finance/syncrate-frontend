export const businessSegments = [
  "Jeweler",
  "Gold retailer",
  "Bullion dealer",
  "Wholesaler",
  "Manufacturer",
  "Refiner",
  "Other",
] as const;
export type Inquiry = {
  name: string;
  email: string;
  company: string;
  segment: (typeof businessSegments)[number];
  region: string;
  capacity: string;
  message: string;
  consent: true;
  website: string;
};
