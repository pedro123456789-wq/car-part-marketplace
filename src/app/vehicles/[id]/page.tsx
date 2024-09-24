"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import NavigationBar from "@/app/components/NavigationBar";
import Alert from "@/app/components/alert/Alert";
import { useAlert } from "@/app/components/alert/useAlert";
import { Vehicle, Part, Wheel } from "@/app/types_db";
import { FaArrowLeft } from "react-icons/fa";

interface Props {
    params: Params;
}

interface Params {
    id: string;
}

const VehicleInfo: React.FC<Props> = ({ params }) => {
  const router = useRouter();
  const id = params.id;
  const vehicleId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [wheels, setWheels] = useState<Wheel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showAlert, message, type, triggerAlert } = useAlert();
  const supabase = createFrontEndClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!vehicleId) {
        triggerAlert("Vehicle ID not found.", "error");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch vehicle data
        const { data: vehicleData, error: vehicleError } = await supabase
          .from("vehicle")
          .select("*")
          .eq("id", vehicleId)
          .single();

        if (vehicleError) throw vehicleError;
        setVehicle(vehicleData);

        // Fetch parts associated with the vehicle
        const { data: partsData, error: partsError } = await supabase
          .from("part")
          .select("*")
          .eq("vehicle_id", vehicleId);

        if (partsError) throw partsError;
        setParts(partsData || []);

        // Fetch wheels associated with the vehicle
        const { data: wheelsData, error: wheelsError } = await supabase
          .from("wheel")
          .select("*")
          .eq("vehicle_id", vehicleId);

        if (wheelsError) throw wheelsError;
        setWheels(wheelsData || []);
      } catch (error) {
        console.error(error);
        triggerAlert("Error fetching data.", "error");
      }

      setIsLoading(false);
    };

    fetchData();
  }, [vehicleId]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <NavigationBar />
      {showAlert && <Alert message={message} type={type} />}

      <div className="container mx-auto p-5">
        {/* Back Button */}
        <button
          className="btn btn-outline mb-5"
          onClick={() => router.back()}
        >
          <FaArrowLeft />
        </button>

        {/* Vehicle Information */}
        {vehicle ? (
          <div className="card bg-base-100 shadow-xl mb-10">
            <figure className="border rounded-lg p-2 m-5">
              <img
                src={`/api/files/download?file_name=vehicle-${vehicle.id}`}
                alt="Vehicle"
                className="max-w-full max-h-[500px] object-"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-2xl">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h2>
              <p>
                <strong>Type:</strong> {vehicle.type}
              </p>
              <p>
                <strong>Mileage:</strong> {vehicle.mileage_km} km
              </p>
              <p>
                <strong>Fuel Type:</strong> {vehicle.fuel_type}
              </p>
              <p>
                <strong>Drive Type:</strong> {vehicle.drive_type}
              </p>
              <p>
                <strong>Transmission:</strong> {vehicle.transmission}
              </p>
              <p>
                <strong>Seats:</strong> {vehicle.seats_number}
              </p>
              <p>
                <strong>Doors:</strong> {vehicle.doors_number}
              </p>
              <p>
                <strong>Details:</strong> {vehicle.details}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-xl">Vehicle not found.</p>
        )}

        {/* Parts List */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-5">Parts</h2>
          {parts.length > 0 ? (
            <div className="space-y-4">
              {parts.map((part) => (
                <div
                  key={part.id}
                  className="flex items-center bg-base-100 shadow-xl p-5 rounded-lg"
                >
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Part"
                    className="w-32 h-32 object-cover mr-5"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">{part.name}</h3>
                    <p>
                      <strong>Part Number:</strong> {part.number}
                    </p>
                    <p>{part.info}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No parts available for this vehicle.</p>
          )}
        </div>

        {/* Wheels List */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-5">Wheels</h2>
          {wheels.length > 0 ? (
            <div className="space-y-4">
              {wheels.map((wheel) => (
                <div
                  key={wheel.id}
                  className="flex items-center bg-base-100 shadow-xl p-5 rounded-lg"
                >
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Wheel"
                    className="w-32 h-32 object-cover mr-5"
                  />
                  <div>
                    <h3 className="text-xl font-semibold">
                      Bolt Pattern: {wheel.rim_bolt_pattern}
                    </h3>
                    <p>
                      <strong>Rim Size:</strong> {wheel.rim_size}"
                    </p>
                    <p>
                      <strong>Tire Width:</strong> {wheel.tire_width}
                    </p>
                    <p>
                      <strong>Tire Profile:</strong> {wheel.tire_profile}
                    </p>
                    <p>
                      <strong>Tire Size:</strong> {wheel.tire_size}"
                    </p>
                    <p>{wheel.additional_information}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No wheels available for this vehicle.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default VehicleInfo;
