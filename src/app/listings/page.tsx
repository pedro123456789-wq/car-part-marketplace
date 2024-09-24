"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "../utils/supabase/client";
import DropDownInput from "../components/DropdownInput";
import LoadingIndicator from "../components/LoadingIndicator";
import { useAlert } from "../components/alert/useAlert";
import Alert from "../components/alert/Alert";
import NavigationBar from "../components/NavigationBar";
import { Vehicle, Part, Wheel } from "../types_db";
import { useUser } from "../contexts/UserContext";

interface Props {
  isListSelf: boolean; // Determines if only the user's items should be displayed
}

const Listings: React.FC<Props> = ({ isListSelf }) => {
  const [selectedTab, setSelectedTab] = useState<string>("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showAlert, message, type, triggerAlert } = useAlert();
  const router = useRouter();
  const supabase = createFrontEndClient();
  const { session } = useUser();

  // Helper function to generate ranges
  const getRange = (startValue: number, endValue: number, interval: number) => {
    let output = [];
    for (let i = startValue; i <= endValue; i += interval) {
      output.push(i.toString());
    }
    return output;
  };

  // Bolt pattern options from WheelInput component
  const boltPatternOptions = [
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

  // Fetch data based on the selected tab and filters
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        if (selectedTab === "vehicles") {
          let query = supabase.from("vehicle").select("*");

          // Apply filters
          if (filters.type && filters.type !== "All") {
            query = query.eq("type", filters.type.toLocaleLowerCase());
          }
          if (filters.brand) {
            query = query.ilike("brand", `%${filters.brand}%`);
          }
          if (filters.model) {
            query = query.ilike("model", `%${filters.model}%`);
          }
          if (filters.year) {
            query = query.eq("year", filters.year);
          }
          if (filters.mileage_km) {
            query = query.lte("mileage_km", filters.mileage_km);
          }
          if (filters.fuel_type && filters.fuel_type !== "All") {
            query = query.eq("fuel_type", filters.fuel_type);
          }
          if (filters.drive_type && filters.drive_type !== "All") {
            query = query.eq("drive_type", filters.drive_type);
          }
          if (filters.transmission && filters.transmission !== "All") {
            query = query.eq("transmission", filters.transmission);
          }
          if (filters.seats_number) {
            query = query.eq("seats_number", filters.seats_number);
          }
          if (filters.doors_number) {
            query = query.eq("doors_number", filters.doors_number);
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
          if (filters.name) {
            query = query.ilike("name", `%${filters.name}%`);
          }
          if (filters.number) {
            query = query.ilike("number", `%${filters.number}%`);
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
          if (filters.rim_bolt_pattern) {
            query = query.eq("rim_bolt_pattern", filters.rim_bolt_pattern);
          }
          if (filters.rim_size) {
            query = query.eq("rim_size", filters.rim_size);
          }
          if (filters.tire_width) {
            query = query.eq("tire_width", filters.tire_width);
          }
          if (filters.tire_profile) {
            query = query.eq("tire_profile", filters.tire_profile);
          }
          if (filters.tire_size) {
            query = query.eq("tire_size", filters.tire_size);
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

    fetchData();
  }, [selectedTab, filters]);

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters({
      ...filters,
      [filterName]: value,
    });
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
                  options={["All", "Car", "Bike", "Snowmobile", "Other"]}
                  selectedText={filters.type || ""}
                  setSelectedText={(value) => handleFilterChange("type", value)}
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
                  value={filters.brand || ''}
                  onChange={(e) => handleFilterChange("brand", e.target.value)}
                />
              </div>

              {/* Model */}
              <div className="mt-4">
                <label className="font-semibold">Model</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter model"
                  onChange={(e) => handleFilterChange("model", e.target.value)}
                />
              </div>

              {/* Other vehicle filters... */}
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
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                />
              </div>

              {/* Part Number */}
              <div className="mt-4">
                <label className="font-semibold">Part Number</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-2"
                  placeholder="Enter part number"
                  onChange={(e) => handleFilterChange("number", e.target.value)}
                />
              </div>

              {/* Other part filters... */}
            </>
          )}

          {/* Wheels Filters */}
          {selectedTab === "wheels" && (
            <>
              {/* Bolt Pattern */}
              <div className="mt-4">
                <label className="font-semibold">Bolt Pattern</label>
                <DropDownInput
                  options={boltPatternOptions}
                  selectedText={filters.rim_bolt_pattern || ""}
                  setSelectedText={(value) =>
                    handleFilterChange("rim_bolt_pattern", value)
                  }
                  placeholder="Select Bolt Pattern"
                />
              </div>

              {/* Other wheel filters... */}
            </>
          )}
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
                    <p>Rim Size: {wheel.rim_size}"</p>
                    <p>Tire Width: {wheel.tire_width}</p>
                    <p>Tire Profile: {wheel.tire_profile}</p>
                    <p>Tire Size: {wheel.tire_size}"</p>
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
