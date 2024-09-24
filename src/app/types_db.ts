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
    fuel_type: string;
    drive_type: string;
    transmission: string;
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