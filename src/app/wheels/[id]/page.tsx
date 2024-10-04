"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import NavigationBar from "@/app/components/NavigationBar";
import Alert from "@/app/components/alert/Alert";
import { useAlert } from "@/app/components/alert/useAlert";
import { Wheel, Vehicle } from "@/app/types_db";
import ImageGallery from "@/app/components/ImageGallery";
import { FaArrowLeft } from "react-icons/fa";
import SellerInformation from "@/app/components/SellerInfo";
import Inbox from "@/app/components/Message/Inbox";

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

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  useEffect(() => {
    // Fetch the logged-in user's UUID
    const fetchLoggedInUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
      } else if (data.session?.user) {
        // Set the user's uuid (which is the user's unique identifier in Supabase)
        setLoggedInUserId(data.session.user.id);
      }
    };

    fetchLoggedInUser();

    const fetchData = async () => {
      if (!wheelId) {
        triggerAlert("Wheel ID not found.", "error");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch wheel data
        const { data: wheelData, error: wheelError } = await supabase
          .from("wheel")
          .select("*")
          .eq("id", wheelId)
          .single();

        if (wheelError) throw wheelError;
        setWheel(wheelData);

        // Create image URLs and check if they exist
        const urls: string[] = [];
        for (let i = 0; i < 4; i++) {
          const url = `/api/files/download?file_name=wheel-${wheelId}-${i}`;
          try {
            const response = await fetch(url, { method: "HEAD" });
            if (response.ok) {
              urls.push(url);
            }
          } catch (error) {
            // Image doesn't exist; do nothing
          }
        }
        setImageUrls(urls);

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
    <div>
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
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-[3]">

            {/* Wheel Information */}
            {wheel ? (
              <div className="card bg-base-100 shadow-xl mb-10">
                <div className="card-body">
                  {/* Image Gallery */}
                  <ImageGallery imageUrls={imageUrls} />

                  <h2 className="card-title text-2xl mt-5">Wheel Details</h2>
                  <p>
                    <strong>Rim Bolt Pattern:</strong> {wheel.rim_bolt_pattern}
                  </p>
                  <p>
                    <strong>Rim Size:</strong> {wheel.rim_size}
                  </p>
                  <p>
                    <strong>Tire Width:</strong> {wheel.tire_width}
                  </p>
                  <p>
                    <strong>Tire Profile:</strong> {wheel.tire_profile}
                  </p>
                  <p>
                    <strong>Tire Size:</strong> {wheel.tire_size}
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

                      <button
                        className="btn btn-outline mt-2"
                        onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                      >
                        Full Vehicle Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-center text-xl">Wheel not found.</p>
            )}

            {/* Matching Wheels */}
            <div className="w-full text-center">
              <p className="font-bold underline text-2xl">Matching Wheels</p>
            </div>

            {/* Matching Wheels Content */}
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
                          src={`/api/files/download?file_name=wheel-${matchingWheel.id}-0`}
                          alt="Wheel"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/300";
                          }}
                        />
                      </figure>
                      <div className="card-body">
                        <h2 className="card-title">Wheel</h2>
                        <p>
                          <strong>Rim Bolt Pattern:</strong>{" "}
                          {matchingWheel.rim_bolt_pattern}
                        </p>
                        <p>
                          <strong>Rim Size:</strong> {matchingWheel.rim_size}
                        </p>
                        <p>
                          <strong>Tire Width:</strong> {matchingWheel.tire_width}
                        </p>
                        <p>
                          <strong>Tire Profile:</strong>{" "}
                          {matchingWheel.tire_profile}
                        </p>
                        <p>
                          <strong>Tire Size:</strong> {matchingWheel.tire_size}
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
          {
            wheel && loggedInUserId &&
            <div className="flex-1 flex flex-col gap-5">
              <SellerInformation sellerId={wheel?.owner_id} />
              <Inbox recipient={wheel?.owner_id} loggedInUserId={loggedInUserId} />
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default WheelDetails;
