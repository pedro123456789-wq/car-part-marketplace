"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "../utils/supabase/client";
import DropDownInput from "../components/DropdownInput";
import LoadingIndicator from "../components/LoadingIndicator";
import { useAlert } from "../components/alert/useAlert";
import Alert from "../components/alert/Alert";
import NavigationBar from "../components/NavigationBar";
import {
  Vehicle,
  Part,
  Wheel,
  DriveType,
  TransmissionType,
  FuelType,
  VehicleType,
  FuelTypeValues,
  DriveTypeValues,
  TransmissionTypeValues,
  VehicleTypeValues,
  RimBoltPatternType,
  RimSizeType,
  TireWidthType,
  TireProfileType,
  TireSizeType,
  rimBoltPatterns,
  rimSizes,
  tireWidths,
  tireProfiles,
  tireSizes,
} from "../types_db";
import { useUser } from "../contexts/UserContext";

interface Props {
  isListSelf: boolean; // Determines if only the user's items should be displayed
}

interface VehicleFilters {
  type: VehicleType | "All";
  brand: string;
  model: string;
  year: string;
  mileage_km: string;
  fuel_type: FuelType | "All";
  drive_type: DriveType | "All";
  transmission: TransmissionType | "All";
  seats_number: string;
  doors_number: string;
}

interface PartFilters {
  name: string;
  number: string;
}

interface WheelFilters {
  rim_bolt_pattern: RimBoltPatternType | "All";
  rim_size: RimSizeType | "All";
  tire_width: TireWidthType | "All";
  tire_profile: TireProfileType | "All";
  tire_size: TireSizeType | "All";
}

type TabOptions = "vehicles" | "parts" | "wheels";

const Listings: React.FC<Props> = ({ isListSelf }) => {
  const [selectedTab, setSelectedTab] = useState<TabOptions>("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showAlert, message, type, triggerAlert } = useAlert();
  const router = useRouter();
  const supabase = createFrontEndClient();
  const { session } = useUser();

  const [vehicleFilters, setVehicleFilters] = useState<VehicleFilters>({
    type: "All",
    brand: "",
    model: "",
    year: "",
    mileage_km: "",
    fuel_type: "All",
    drive_type: "All",
    transmission: "All",
    seats_number: "",
    doors_number: "",
  });
  const [partFilters, setPartFilters] = useState<PartFilters>({
    name: "",
    number: "",
  });
  const [wheelFilters, setWheelFilters] = useState<WheelFilters>({
    rim_bolt_pattern: "All",
    rim_size: "All",
    tire_width: "All",
    tire_profile: "All",
    tire_size: "All",
  });

  // Fetch data function
  const fetchData = async () => {
    setIsLoading(true);

    try {
      if (selectedTab === "vehicles") {
        let query = supabase.from("vehicle").select("*");

        // Apply filters
        if (vehicleFilters.type && vehicleFilters.type !== "All") {
          console.log(vehicleFilters.type);
          query = query.eq("type", vehicleFilters.type);
        }
        if (vehicleFilters.brand) {
          query = query.ilike("brand", `%${vehicleFilters.brand}%`);
        }
        if (vehicleFilters.model) {
          query = query.ilike("model", `%${vehicleFilters.model}%`);
        }
        if (vehicleFilters.year && !isNaN(parseInt(vehicleFilters.year))) {
          query = query.eq("year", parseInt(vehicleFilters.year));
        }
        if (
          vehicleFilters.mileage_km &&
          !isNaN(parseInt(vehicleFilters.mileage_km))
        ) {
          query = query.lte("mileage_km", parseInt(vehicleFilters.mileage_km));
        }
        if (vehicleFilters.fuel_type && vehicleFilters.fuel_type !== "All") {
          query = query.eq("fuel_type", vehicleFilters.fuel_type);
        }
        if (vehicleFilters.drive_type && vehicleFilters.drive_type !== "All") {
          query = query.eq("drive_type", vehicleFilters.drive_type);
        }
        if (
          vehicleFilters.transmission &&
          vehicleFilters.transmission !== "All"
        ) {
          query = query.eq("transmission", vehicleFilters.transmission);
        }
        if (
          vehicleFilters.seats_number &&
          !isNaN(parseInt(vehicleFilters.seats_number))
        ) {
          query = query.eq(
            "seats_number",
            parseInt(vehicleFilters.seats_number)
          );
        }
        if (
          vehicleFilters.doors_number &&
          !isNaN(parseInt(vehicleFilters.doors_number))
        ) {
          query = query.eq(
            "doors_number",
            parseInt(vehicleFilters.doors_number)
          );
        }
        if (isListSelf) {
          query = query.eq("creator", session?.user.id || "");
        }

        const { data: vehicleData, error } = await query;
        if (error) throw error;
        setVehicles(vehicleData || []);
      } else if (selectedTab === "parts") {
        let query = supabase.from("part").select("*");

        // Apply filters
        if (partFilters.name) {
          query = query.ilike("name", `%${partFilters.name}%`);
        }
        if (partFilters.number) {
          query = query.ilike("number", `%${partFilters.number}%`);
        }
        if (isListSelf) {
          query = query.eq("owner_id", session?.user.id || "");
        }

        const { data: partData, error } = await query;
        if (error) throw error;
        setParts(partData || []);
      } else if (selectedTab === "wheels") {
        let query = supabase.from("wheel").select("*");

        // Apply filters
        if (wheelFilters.rim_bolt_pattern && wheelFilters.rim_bolt_pattern !== "All") {
          query = query.eq("rim_bolt_pattern", wheelFilters.rim_bolt_pattern);
        }
        if (wheelFilters.rim_size && wheelFilters.rim_size !== "All") {
          query = query.eq("rim_size", parseInt(wheelFilters.rim_size));
        }
        if (
          wheelFilters.tire_width &&
          wheelFilters.tire_width !== "All"
        ) {
          query = query.eq("tire_width", parseInt(wheelFilters.tire_width));
        }
        if (
          wheelFilters.tire_profile &&
          wheelFilters.tire_profile !== "All"
        ) {
          query = query.eq("tire_profile", parseInt(wheelFilters.tire_profile));
        }
        if (
          wheelFilters.tire_size &&
          wheelFilters.tire_size !== "All"
        ) {
          query = query.eq("tire_size", parseInt(wheelFilters.tire_size));
        }
        if (isListSelf) {
          query = query.eq("owner_id", session?.user.id || "");
        }

        const { data: wheelData, error } = await query;
        if (error) throw error;
        setWheels(wheelData || []);
      }
    } catch (error) {
      console.error(error);
      triggerAlert("Error loading data", "error");
    }

    setIsLoading(false);
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
  }, [selectedTab]); // Fetch data when the selected tab changes

  const handleFilterChange = (
    section: TabOptions,
    filterName: string,
    value: any
  ) => {
    if (section === "vehicles") {
      setVehicleFilters({
        ...vehicleFilters,
        [filterName]: value,
      });
    } else if (section === "parts") {
      setPartFilters({
        ...partFilters,
        [filterName]: value,
      });
    } else if (section === "wheels") {
      setWheelFilters({
        ...wheelFilters,
        [filterName]: value,
      });
    }
  };

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <NavigationBar />
      {showAlert && <Alert message={message} type={type} />}

      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Sidebar for Filters */}
        <div className="md:w-1/4 w-full bg-base-200 p-5 md:min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Filters</h2>

          {selectedTab === "vehicles" && (
            <>
              {/* Vehicle Type */}
              <div className="mt-4">
                <label className="font-semibold">Vehicle Type</label>
                <DropDownInput
                  options={[...(VehicleTypeValues as any as string[]), "All"]}
                  selectedText={vehicleFilters.type}
                  setSelectedText={(value) =>
                    handleFilterChange("vehicles", "type", value)
                  }
                  placeholder="Select Vehicle Type"
                />
              </div>

              {/* Brand */}
              <div className="mt-4">
                <label className="font-semibold">Brand</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter brand"
                  value={vehicleFilters.brand || ""}
                  onChange={(e) =>
                    handleFilterChange("vehicles", "brand", e.target.value)
                  }
                />
              </div>

              {/* Model */}
              <div className="mt-4">
                <label className="font-semibold">Model</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter model"
                  value={vehicleFilters.model}
                  onChange={(e) =>
                    handleFilterChange("vehicles", "model", e.target.value)
                  }
                />
              </div>

              {/* Year */}
              <div className="mt-4">
                <label className="font-semibold">Year</label>
                <input
                  type="number"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter year"
                  value={vehicleFilters.year}
                  onChange={(e) =>
                    handleFilterChange("vehicles", "year", e.target.value)
                  }
                />
              </div>

              {/* Mileage (km) */}
              <div className="mt-4">
                <label className="font-semibold">Max. Mileage (km)</label>
                <input
                  type="number"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter max mileage"
                  value={vehicleFilters.mileage_km}
                  onChange={(e) =>
                    handleFilterChange("vehicles", "mileage_km", e.target.value)
                  }
                />
              </div>

              {/* Fuel Type */}
              <div className="mt-4">
                <label className="font-semibold">Fuel Type</label>
                <DropDownInput
                  options={[...(FuelTypeValues as any as string[]), "All"]}
                  selectedText={vehicleFilters.fuel_type || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("vehicles", "fuel_type", value)
                  }
                  placeholder="Select Fuel Type"
                />
              </div>

              {/* Drive Type */}
              <div className="mt-4">
                <label className="font-semibold">Drive Type</label>
                <DropDownInput
                  options={[...(DriveTypeValues as any as string[]), "All"]}
                  selectedText={vehicleFilters.drive_type || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("vehicles", "drive_type", value)
                  }
                  placeholder="Select Drive Type"
                />
              </div>

              {/* Transmission */}
              <div className="mt-4">
                <label className="font-semibold">Transmission</label>
                <DropDownInput
                  options={[
                    ...(TransmissionTypeValues as any as string[]),
                    "All",
                  ]}
                  selectedText={vehicleFilters.transmission || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("vehicles", "transmission", value)
                  }
                  placeholder="Select Transmission"
                />
              </div>

              {/* Seats Number */}
              <div className="mt-4">
                <label className="font-semibold">Seats Number</label>
                <input
                  type="number"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter number of seats"
                  value={vehicleFilters.seats_number}
                  onChange={(e) =>
                    handleFilterChange(
                      "vehicles",
                      "seats_number",
                      e.target.value
                    )
                  }
                />
              </div>

              {/* Doors Number */}
              <div className="mt-4">
                <label className="font-semibold">Doors Number</label>
                <input
                  type="number"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter number of doors"
                  value={vehicleFilters.doors_number}
                  onChange={(e) =>
                    handleFilterChange(
                      "vehicles",
                      "doors_number",
                      e.target.value
                    )
                  }
                />
              </div>
            </>
          )}

          {/* Parts Filters */}
          {selectedTab === "parts" && (
            <>
              {/* Part Name */}
              <div className="mt-4">
                <label className="font-semibold">Part Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter part name"
                  value={partFilters.name}
                  onChange={(e) =>
                    handleFilterChange("parts", "name", e.target.value)
                  }
                />
              </div>

              {/* Part Number */}
              <div className="mt-4">
                <label className="font-semibold">Part Number</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter part number"
                  value={partFilters.number}
                  onChange={(e) =>
                    handleFilterChange("parts", "number", e.target.value)
                  }
                />
              </div>
            </>
          )}

          {/* Wheels Filters */}
          {selectedTab === "wheels" && (
            <>
              {/* Bolt Pattern */}
              <div className="mt-4">
                <label className="font-semibold">Rim Bolt Pattern</label>
                <DropDownInput
                  options={[...rimBoltPatterns, 'All']}
                  selectedText={wheelFilters.rim_bolt_pattern || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("wheels", "rim_bolt_pattern", value)
                  }
                  placeholder="Select Bolt Pattern"
                />
              </div>

              {/* Rim Size */}
              <div className="mt-4">
                <label className="font-semibold">Rim Size</label>
                <DropDownInput
                  options={[...rimSizes, 'All']}
                  selectedText={wheelFilters.rim_size || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("wheels", "rim_size", value)
                  }
                  placeholder="Select Rim Size"
                />
              </div>

              {/* Tire Width */}
              <div className="mt-4">
                <label className="font-semibold">Tire Width</label>
                <DropDownInput
                  options={[...tireWidths, 'All']}
                  selectedText={wheelFilters.tire_width || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("wheels", "tire_width", value)
                  }
                  placeholder="Select Tire Width"
                />
              </div>

              {/* Tire Profile */}
              <div className="mt-4">
                <label className="font-semibold">Tire Profile</label>
                <DropDownInput
                  options={[...tireProfiles, 'All']}
                  selectedText={wheelFilters.tire_profile || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("wheels", "tire_profile", value)
                  }
                  placeholder="Select Tire Profile"
                />
              </div>

              {/* Tire Size */}
              <div className="mt-4">
                <label className="font-semibold">Tire Size</label>
                <DropDownInput
                  options={[...tireSizes, 'All']}
                  selectedText={wheelFilters.tire_size || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("wheels", "tire_size", value)
                  }
                  placeholder="Select Tire Size"
                />
              </div>
            </>
          )}

          {/* Apply Filters Button */}
          <button
            className="btn btn-outline mt-4"
            onClick={() => {
              // Perform validation before calling fetchData
              let isValid = true;

              if (selectedTab === "vehicles") {
                const numericFields = [
                  "year",
                  "mileage_km",
                  "seats_number",
                  "doors_number",
                ];
                for (const field of numericFields) {
                  const value = vehicleFilters[field as keyof VehicleFilters];
                  if (value && isNaN(Number(value))) {
                    triggerAlert(`Invalid value for ${field}`, "error");
                    isValid = false;
                    break;
                  }
                }
              }
              
              if (isValid) {
                fetchData();
              }
            }}
          >
            Apply Filters
          </button>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4 w-full p-5">
          {/* Tabs */}
          <div className="flex space-x-4">
            <p
              className={`cursor-pointer ${
                selectedTab === "vehicles" ? "font-bold underline" : ""
              }`}
              onClick={() => setSelectedTab("vehicles")}
            >
              Vehicles
            </p>
            <p
              className={`cursor-pointer ${
                selectedTab === "parts" ? "font-bold underline" : ""
              }`}
              onClick={() => setSelectedTab("parts")}
            >
              Parts
            </p>
            <p
              className={`cursor-pointer ${
                selectedTab === "wheels" ? "font-bold underline" : ""
              }`}
              onClick={() => setSelectedTab("wheels")}
            >
              Wheels
            </p>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-5">
            {/* Render Vehicles */}
            {selectedTab === "vehicles" &&
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="card bg-base-100 shadow-xl hover:bg-blue-100 hover:cursor-pointer"
                  onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                >
                  <figure>
                    <img
                      src={`/api/files/download?file_name=vehicle-${vehicle.id}`}
                      alt="Vehicle"
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </h2>
                    <p>Mileage: {vehicle.mileage_km} km</p>
                    <p>Fuel: {vehicle.fuel_type}</p>
                    <p>Drive Type: {vehicle.drive_type}</p>
                    <p>Transmission: {vehicle.transmission}</p>
                    <p>Seats: {vehicle.seats_number}</p>
                    <p>Doors: {vehicle.doors_number}</p>
                  </div>
                </div>
              ))}

            {/* Render Parts */}
            {selectedTab === "parts" &&
              parts.map((part) => (
                <div
                  key={part.id}
                  className="card bg-base-100 shadow-xl hover:bg-blue-100 hover:cursor-pointer"
                  onClick={() => router.push(`/parts/${part.id}`)}
                >
                  <figure>
                    <img
                      src={`/api/files/download?file_name=part-${part.id}-0`}
                      alt="Part"
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">{part.name}</h2>
                    <p>Part Number: {part.number}</p>
                  </div>
                </div>
              ))}

            {/* Render Wheels */}
            {selectedTab === "wheels" &&
              wheels.map((wheel) => (
                <div
                  key={wheel.id}
                  className="card bg-base-100 shadow-xl hover:bg-blue-100 hover:cursor-pointer"
                  onClick={() => router.push(`/wheels/${wheel.id}`)}
                >
                  <figure>
                    <img
                      src={`/api/files/download?file_name=wheel-${wheel.id}-0`}
                      alt="Wheel"
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">
                      Bolt Pattern: {wheel.rim_bolt_pattern}
                    </h2>
                    <p>Rim Size: {wheel.rim_size}</p>
                    <p>Tire Width: {wheel.tire_width}</p>
                    <p>Tire Profile: {wheel.tire_profile}</p>
                    <p>Tire Size: {wheel.tire_size}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Listings;
