"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import NavigationBar from "@/app/components/NavigationBar";
import Alert from "@/app/components/alert/Alert";
import { useAlert } from "@/app/components/alert/useAlert";
import { Wheel, Vehicle } from "@/app/types_db";

interface Props {
  params: Params;
}

interface Params {
  id: string;
}

const WheelDetails: React.FC<Props> = ({ params }) => {
  const router = useRouter();
  const id = params.id;
  const wheelId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const [wheel, setWheel] = useState<Wheel | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [matchingWheels, setMatchingWheels] = useState<Wheel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showAlert, message, type, triggerAlert } = useAlert();
  const supabase = createFrontEndClient();

  useEffect(() => {
    const fetchData = async () => {
      if (!wheelId) {
        triggerAlert("Wheel ID not found.", "error");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch wheel data
        const { data, error: wheelError } = await supabase
          .from("wheel")
          .select("*")
          .eq("id", wheelId)
          .single();

        if (wheelError) throw wheelError;

        const wheelData: Wheel = data;
        setWheel(wheelData);

        // Fetch vehicle data
        const { data: vehicleData, error: vehicleError } = await supabase
          .from("vehicle")
          .select("*")
          .eq("id", wheelData.vehicle_id)
          .single();

        if (vehicleError) throw vehicleError;
        setVehicle(vehicleData);

        // Fetch matching wheels (same size and type, different vehicles)
        const { data: matchingWheelsData, error: matchingWheelsError } =
          await supabase
            .from("wheel")
            .select("*")
            .neq("id", wheelId)
            .eq("rim_bolt_pattern", wheelData.rim_bolt_pattern)
            .eq("rim_size", wheelData.rim_size)
            .eq("tire_width", wheelData.tire_width)
            .eq("tire_profile", wheelData.tire_profile)
            .eq("tire_size", wheelData.tire_size);

        if (matchingWheelsError) throw matchingWheelsError;
        setMatchingWheels(matchingWheelsData || []);
      } catch (error) {
        console.error(error);
        triggerAlert("Error fetching data.", "error");
      }

      setIsLoading(false);
    };

    fetchData();
  }, [wheelId]);

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      <NavigationBar />
      {showAlert && <Alert message={message} type={type} />}

      <div className="container mx-auto p-5">
        {/* Back Button */}
        <button className="btn btn-outline mb-5" onClick={() => router.back()}>
          Back
        </button>

        {/* Wheel Information */}
        {wheel ? (
          <div className="card bg-base-100 shadow-xl mb-10">
            <figure>
              <img
                src="https://via.placeholder.com/600x400"
                alt="Wheel"
                className="w-full h-64 object-cover"
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title text-2xl">Wheel</h2>
              <p>
                <strong>Size:</strong> {wheel.tire_size}
              </p>
              <p>
                <strong>Material:</strong>
              </p>
              <p>{wheel.additional_information}</p>

              {vehicle && (
                <div className="mt-5">
                  <h3 className="text-xl font-bold">Vehicle Information:</h3>
                  <p>
                    <strong>Vehicle:</strong> {vehicle.brand} {vehicle.model} (
                    {vehicle.year})
                  </p>
                  <p>
                    <strong>Type:</strong> {vehicle.type}
                  </p>
                  <p>
                    <strong>Mileage:</strong> {vehicle.mileage_km} km
                  </p>
                  <p>
                    <strong>Fuel Type:</strong> {vehicle.fuel_type}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-xl">Wheel not found.</p>
        )}

        <div className="w-full text-center">
            <p className="font-bold underline">Matching Wheels</p>
        </div>

        {/* Tab Content */}
        <div className="mt-5">
          {matchingWheels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {matchingWheels.map((matchingWheel) => (
                <div
                  key={matchingWheel.id}
                  className="card bg-base-100 shadow-xl"
                >
                  <figure>
                    <img
                      src="https://via.placeholder.com/300"
                      alt="Wheel"
                      className="w-full h-48 object-cover"
                    />
                  </figure>
                  <div className="card-body">
                    <h2 className="card-title">Wheel</h2>
                    <p>
                      <strong>Tire Size:</strong> {matchingWheel.tire_size}
                    </p>
                    <p>
                      <strong>Tire Profile:</strong>{" "}
                      {matchingWheel.tire_profile}
                    </p>

                    <button
                      className="btn btn-primary mt-2"
                      onClick={() => router.push(`/wheels/${matchingWheel.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No matching wheels found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default WheelDetails;
