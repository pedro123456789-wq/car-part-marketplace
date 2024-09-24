"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NavigationBar from "@/app/components/NavigationBar";
import WheelInput from "@/app/parts/new/WheelInput";
import PartInput from "@/app/parts/new/PartInput";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import LoadingIndicator from "@/app/components/LoadingIndicator";

type PartType = "part" | "wheel";

const NewPart: React.FC = () => {
  const [partType, setPartType] = useState<PartType>("part");
  const [vehicle, setVehicle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) {
        // If no vehicleId is provided, redirect back to vehicle selection
        router.push("/vehicles");
        return;
      }

      setIsLoading(true);

      const supabase = createFrontEndClient();
      const { data, error } = await supabase
        .from("vehicle")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (error || !data) {
        // Handle error or no data found
        console.error("Error fetching vehicle:", error);
        // Redirect back to vehicle selection
        router.push("/vehicles");
        return;
      }

      setVehicle(data);
      setIsLoading(false);
    };

    fetchVehicle();
  }, [vehicleId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      <NavigationBar />

      <div className="bg-white p-10 min-h-screen">
        {/* Breadcrumb */}
        <div className="text-sm breadcrumbs mb-8">
          <ul>
            <li>Sell Part</li>
            <li>
              <a href="/vehicles" className="text-blue-500 hover:underline">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </a>
            </li>
            <li>Add Part</li>
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* Main Car Info Section */}
          <div className="flex justify-start items-start mb-10 bg-gray-300 p-5">
            <img className="max-w-48 max-h-48 bg-gray-200 flex items-center justify-center"
                 src={`/api/files/download?file_name=vehicle-${vehicle.id}`} />
            <div className="ml-5">
              <h2 className="text-xl font-bold">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </h2>
              <p>Mileage: {vehicle.mileage_km} km</p>
              <p>Fuel Type: {vehicle.fuel_type}</p>
              {/* Add more vehicle details as needed */}
            </div>
          </div>

          {/* Part Type Selection */}
          <div className="flex flex-row space-x-20 justify-center items-center">
            <h1
              className={`text-xl ${
                partType === "part" && "font-bold"
              } hover:underline hover:cursor-pointer`}
              onClick={() => setPartType("part")}
            >
              Part
            </h1>

            <h1
              className={`text-xl ${
                partType === "wheel" && "font-bold"
              } hover:underline hover:cursor-pointer`}
              onClick={() => setPartType("wheel")}
            >
              Wheel
            </h1>
          </div>

          {/* Part Input Section */}
          {partType === "part" ? (
            <PartInput vehicleId={vehicleId || ''} />
          ) : (
            <WheelInput vehicleId={vehicleId || ''} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewPart;
