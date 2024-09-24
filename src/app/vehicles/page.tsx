"use client";

import React, { useEffect, useState } from "react";
import NavigationBar from "@/app/components/NavigationBar";
import { createFrontEndClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useAlert } from "@/app/components/alert/useAlert";
import Alert from "@/app/components/alert/Alert";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import { useUser } from "@/app/contexts/UserContext";
import { FaPlus } from "react-icons/fa";
import { Vehicle } from "../types_db";

const VehicleSelectionPage: React.FC = () => {
  const [isShowAll, setIsShowAll] = useState<boolean>(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expandedVehicleId, setExpandedVehicleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showAlert, message, type: alertType, triggerAlert } = useAlert();
  const router = useRouter();
  const supabase = createFrontEndClient();
  const { session } = useUser();
  const [userId, setUserId] = useState<string>("");

  const fetchVehicles = async () => {
    setIsLoading(true);

    //get the user id
    const userId = session?.user.id;
    if (userId){
        setUserId(userId);
    } else {
        console.log('db');
        triggerAlert("Error getting user Id", "error");
        setIsLoading(false);
        return;
    }

    //get the list of vehicles
    const {data, error} = await supabase.from("vehicle").select("*");
    if (error) {
      triggerAlert(error.message, "error");
      setIsLoading(false);
      return;
    }

    setVehicles(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleSelect = (vehicleId: number) => {
    // Save the selected vehicle and redirect to '/newPart'
    // Passing the vehicleId via query parameters
    router.push(`/parts/new?vehicleId=${vehicleId}`);
  };

  const handleCreateNewVehicle = () => {
    router.push("/vehicles/new");
  };

  const toggleVehicleDetails = (vehicleId: number) => {
    setExpandedVehicleId((prevId) => (prevId === vehicleId ? null : vehicleId));
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      {showAlert && (
        <div className="absolute top-0 w-full">
          <Alert message={message} type={alertType} />
        </div>
      )}
      <div>
        <NavigationBar />

        <div className="bg-white p-10 min-h-screen flex flex-col w-full">
          <div className="text-sm breadcrumbs mb-8 items-start">
            <ul>
                <li>Sell Part</li>
              <li>Select Vehicle</li>
            </ul>
          </div>

          <div className="w-full flex flex-col items-center justify-center">
            {/* Tabs */}
            <div className="flex justify-center space-x-8 mb-6">
              <div
                className={`cursor-pointer ${
                  isShowAll ? "font-bold text-xl" : "text-base text-gray-500"
                }`}
                onClick={() => setIsShowAll(true)}
              >
                All Vehicles
              </div>
              <div
                className={`cursor-pointer ${
                  !isShowAll ? "font-bold text-xl" : "text-base text-gray-500"
                }`}
                onClick={() => setIsShowAll(false)}
              >
                Your Vehicles
              </div>
            </div>

            {/* Vehicle List */}
            <div
              className="w-full border rounded-lg p-4"
              style={{ maxHeight: "500px", overflowY: "auto" }}
            >
              {vehicles.length === 0 ? (
                <p>No vehicles found.</p>
              ) : (
                <div className="space-y-4">
                  {vehicles
                  .filter((vehicle) => isShowAll || vehicle.creator === userId)
                  .map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border-b pb-2 cursor-pointer"
                      onClick={() => toggleVehicleDetails(vehicle.id)}
                    >
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </h2>
                        <span className="text-gray-500">
                          {expandedVehicleId === vehicle.id ? "-" : "+"}
                        </span>
                      </div>
                      {expandedVehicleId === vehicle.id && (
                        <div className="mt-2">
                          <p>Mileage: {vehicle.mileage_km} km</p>
                          <p>Fuel Type: {vehicle.fuel_type}</p>
                          <p>Transmission: {vehicle.transmission}</p>
                          <p>Drive Type: {vehicle.drive_type}</p>
                          <p>Details: {vehicle.details}</p>
                          <div className="flex justify-end mt-2">
                            <button
                              className="btn btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVehicleSelect(vehicle.id);
                              }}
                            >
                              Select Vehicle
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Create New Vehicle Button */}
            <div className="mt-6">
              <button
                className="btn btn-primary"
                onClick={handleCreateNewVehicle}
              >
                <FaPlus className="mr-2" />
                Create New Vehicle
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleSelectionPage;
