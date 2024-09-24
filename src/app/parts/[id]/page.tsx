"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import NavigationBar from "@/app/components/NavigationBar";
import Alert from "@/app/components/alert/Alert";
import { useAlert } from "@/app/components/alert/useAlert";
import { Part, Vehicle } from "@/app/types_db";
import ImageGallery from "@/app/components/ImageGallery";
import { FaArrowLeft } from "react-icons/fa";

interface Props {
  params: Params;
}

interface Params {
  id: string;
}

const PartDetails: React.FC<Props> = ({ params }) => {
  const router = useRouter();
  const id = params.id;
  const partId = typeof id === "string" ? parseInt(id, 10) : undefined;

  const [part, setPart] = useState<Part | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [matchingParts, setMatchingParts] = useState<Part[]>([]);
  const [otherParts, setOtherParts] = useState<Part[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("matching");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showAlert, message, type, triggerAlert } = useAlert();
  const supabase = createFrontEndClient();

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!partId) {
        triggerAlert("Part ID not found.", "error");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // Fetch part data
        const { data: partData, error: partError } = await supabase
          .from("part")
          .select("*")
          .eq("id", partId)
          .single();

        if (partError) throw partError;
        setPart(partData);

        // Create image URLs and check if they exist
        const urls: string[] = [];
        for (let i = 0; i < 4; i++) {
          const url = `/api/files/download?file_name=part-${partId}-${i}`;
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
          .eq("id", partData.vehicle_id)
          .single();

        if (vehicleError) throw vehicleError;
        setVehicle(vehicleData);

        // Fetch matching parts (same name and number, different vehicles)
        const { data: matchingPartsData, error: matchingPartsError } =
          await supabase
            .from("part")
            .select("*")
            .neq("id", partId)
            .eq("name", partData.name)
            .eq("number", partData.number);

        if (matchingPartsError) throw matchingPartsError;
        setMatchingParts(matchingPartsData || []);

        // Fetch other parts from the same vehicle
        const { data: otherPartsData, error: otherPartsError } =
          await supabase
            .from("part")
            .select("*")
            .neq("id", partId)
            .eq("vehicle_id", partData.vehicle_id);

        if (otherPartsError) throw otherPartsError;
        setOtherParts(otherPartsData || []);
      } catch (error) {
        console.error(error);
        triggerAlert("Error fetching data.", "error");
      }

      setIsLoading(false);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partId]);

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

        {/* Part Information */}
        {part ? (
          <div className="card bg-base-100 shadow-xl mb-10">
            <div className="card-body">
              {/* Image Gallery */}
              <ImageGallery imageUrls={imageUrls} />

              <h2 className="card-title text-2xl mt-5">{part.name}</h2>
              <p>
                <strong>Part Number:</strong> {part.number}
              </p>
              <p>{part.info}</p>
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
          <p className="text-center text-xl">Part not found.</p>
        )}

        {/* Tabs */}
        <div className="flex flex-row justify-center items-center space-x-10 w-full mt-10">
          <p
            className={`cursor-pointer ${
              selectedTab === "matching" ? "font-bold underline" : ""
            }`}
            onClick={() => setSelectedTab("matching")}
          >
            Matching Parts
          </p>
          <p
            className={`cursor-pointer ${
              selectedTab === "other" ? "font-bold underline" : ""
            }`}
            onClick={() => setSelectedTab("other")}
          >
            Other Parts in Same Vehicle
          </p>
        </div>

        {/* Tab Content */}
        <div className="mt-5">
          {selectedTab === "matching" && (
            <>
              {matchingParts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {matchingParts.map((matchingPart) => (
                    <div
                      key={matchingPart.id}
                      className="card bg-base-100 shadow-xl"
                    >
                      <figure>
                        <img
                          src={`/api/files/download?file_name=part-${matchingPart.id}-0`}
                          alt="Part"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/300";
                          }}
                        />
                      </figure>
                      <div className="card-body">
                        <h2 className="card-title">{matchingPart.name}</h2>
                        <p>
                          <strong>Part Number:</strong> {matchingPart.number}
                        </p>
                        <p>{matchingPart.info}</p>
                        <button
                          className="btn btn-primary mt-2"
                          onClick={() =>
                            router.push(`/parts/${matchingPart.id}`)
                          }
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No matching parts found.</p>
              )}
            </>
          )}

          {selectedTab === "other" && (
            <>
              {otherParts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {otherParts.map((otherPart) => (
                    <div
                      key={otherPart.id}
                      className="card bg-base-100 shadow-xl"
                    >
                      <figure>
                        <img
                          src={`/api/files/download?file_name=part-${otherPart.id}-0`}
                          alt="Part"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/300";
                          }}
                        />
                      </figure>
                      <div className="card-body">
                        <h2 className="card-title">{otherPart.name}</h2>
                        <p>
                          <strong>Part Number:</strong> {otherPart.number}
                        </p>
                        <p>{otherPart.info}</p>
                        <button
                          className="btn btn-primary mt-2"
                          onClick={() => router.push(`/parts/${otherPart.id}`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No other parts in this vehicle.</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PartDetails;
