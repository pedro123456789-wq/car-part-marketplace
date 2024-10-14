import { getRange } from "./components/utils";

// Enumerated types
export const DriveTypeValues = ['FWD', 'RWD', 'AWD', '4WD', 'Other'] as const;
export type DriveType = typeof DriveTypeValues[number];

export const FuelTypeValues = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'Gasoline', 'Other'] as const;
export type FuelType = typeof FuelTypeValues[number];

export const TransmissionTypeValues = ['Automatic', 'Semi-automatic', 'Manual', 'Other'] as const;
export type TransmissionType = typeof TransmissionTypeValues[number];

export const VehicleTypeValues = ['Car', 'Bike', 'Snowmobile', 'Other'] as const;
export type VehicleType = typeof VehicleTypeValues[number];

export const rimBoltPatterns = [
    "3x98",
    "4x98",
    "4x100",
    "4x108",
    "4x110",
    "4x114,3",
    "4x130",
    "4x140",
    "5x98",
    "5x100",
    "5x105",
    "5x108",
    "5x110",
    "5x112",
    "5x114,3",
    "5x115",
    "5x118",
    "5x120",
    "5x120,6",
    "5x127",
    "5x130",
    "5x135",
    "5x139,7",
    "5x150",
    "5x165,1",
    "6x114,3",
    "6x115",
    "6x120",
    "6x127",
    "6x130",
    "6x135",
    "6x139,7",
    "6x170",
    "6x180",
    "8x165,1",
    "8x170",
];
export type RimBoltPatternType = typeof rimBoltPatterns[number];

export const rimSizes = getRange(10, 23, 1).map((el) => el.toString());
export type RimSizeType = typeof rimSizes[number];

export const tireWidths = getRange(135, 345, 5).map((el) => el.toString());
export type TireWidthType = typeof tireWidths[number];

export const tireProfiles = getRange(25, 85, 5).map((el) => el.toString());
export type TireProfileType = typeof tireProfiles[number];

export const tireSizes = getRange(10, 23, 1).map((el) => el.toString());
export type TireSizeType = typeof tireSizes[number];
export interface Part {
    id: number;
    created_at: string;
    name: string;
    number: string;
    info: string;
    owner_id: string;
    vehicle_id: number;
}

export interface Vehicle {
    id: number;
    created_at: string;
    type: string;
    brand: string;
    model: string;
    year: string;
    details: string;
    mileage_km: number;
    fuel_type: FuelType;
    drive_type: DriveType;
    transmission: TransmissionType;
    seats_number: number;
    doors_number: number;
    creator: string;
}

export interface Wheel {
    id: number;
    created_at: string;
    rim_bolt_pattern: string;
    rim_size: string;
    tire_width: number;
    tire_profile: number;
    tire_size: number;
    additional_information: string;
    owner_id: string;
    vehicle_id: number;
}


export interface User {
    email: string;
    uuid: string;
    name: string;
    phone: string;
    address: string;
    postcode: string;
    area: string;
    business_id: string;
    company_name: string;
    account_type: string;
}
export interface Conversation {
    id: string;
    user_one: string;
    user_two: string;
}

export interface Message {
    id: string;
    sender_id: string;
    conversation_id: string;
    created_at: string;
    content: string;
}