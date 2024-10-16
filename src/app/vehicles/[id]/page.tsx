"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import NavigationBar from "@/app/components/NavigationBar";
import Alert from "@/app/components/alert/Alert";
import { useAlert } from "@/app/components/alert/useAlert";
import { Vehicle, Part, Wheel, FuelTypeValues, DriveTypeValues, TransmissionTypeValues } from "@/app/types_db";
import { FaArrowLeft, FaEdit } from "react-icons/fa";

import SellerInformation from "@/app/components/SellerInfo";
import Inbox from "@/app/components/Message/Inbox";

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

  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch the logged-in user's UUID
      const fetchLoggedInUser = async () => {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
        } else if (data.session?.user) {
          setLoggedInUserId(data.session.user.id);
        }
      };

      fetchLoggedInUser();
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
        setEditedVehicle(vehicleData); // Initialize edited vehicle state

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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedVehicle((prev) => ({ ...prev!, [name]: value }));
  };

  const handleSave = async () => {
    if (!editedVehicle) return;
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("vehicle")
        .update({
          fuel_type: editedVehicle.fuel_type,
          drive_type: editedVehicle.drive_type,
          transmission: editedVehicle.transmission,
          mileage_km: editedVehicle.mileage_km,
          seats_number: editedVehicle.seats_number,
          doors_number: editedVehicle.doors_number,
          details: editedVehicle.details,
        })
        .eq("id", editedVehicle.id);

      if (error) throw error;

      setVehicle(editedVehicle);
      setIsEditing(false);
      setIsSaving(false);
      triggerAlert("Vehicle information updated successfully.", "success");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      triggerAlert("Error updating vehicle information.", "error");
    }
  };

  const handleDelete = async () => {
    if (!vehicleId) {
      console.error("Vehicle ID not provided.");
      return;
    }
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('vehicle')
        .delete()
        .eq('id', vehicleId)
        .eq('creator', loggedInUserId)


      if (error) {
        console.error("Error deleting vehicle:", error);
        alert("Failed to delete the vehicle. Please try again.");
        return;
      }
      setIsSaving(false);
      router.push('/myParts');
    } catch (err) {
      console.error("Unexpected error during vehicle deletion:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleConversation = async (e: any, recipientId: string) => {
    e.preventDefault();
    try {
      if (!loggedInUserId) {
        window.location.href = "/login";
        return;
      }
      // Check if a conversation already exists between loggedInUserId and recipientId
      const { data: existingConversation, error: conversationCheckError } = await supabase
        .from("conversation")
        .select("*")
        .or(`user_one.eq.${loggedInUserId},user_two.eq.${loggedInUserId}`)
        .or(`user_one.eq.${recipientId},user_two.eq.${recipientId}`)
        .maybeSingle();

      if (conversationCheckError && conversationCheckError.code !== "PGRST116") {
        throw conversationCheckError; // Handle other errors, except "no data" error
      }

      let conversationId;

      if (existingConversation) {
        // Conversation already exists, use the existing conversation ID
        conversationId = existingConversation.id;
        console.log("Conversation already exists:", conversationId);
      } else {
        // No conversation exists, create a new one
        const { data: newConversation, error } = await supabase
          .from("conversation")
          .insert({
            user_one: loggedInUserId,
            user_two: recipientId,
          })
          .select()
          .single();

        if (error) throw error;

        conversationId = newConversation.id;
        console.log("Created new conversation:", conversationId);
      }
      window.location.href = `/chat?chatId=${conversationId}`;
    } catch (error) {
      console.log("ERROR TRYING TO HANDLE CONVERSATION[+]");
    }
  };

  if (isLoading || isSaving) return <LoadingIndicator />;

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
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-[3]">
            {/* Vehicle Information */}
            {vehicle ? (
              <div className="card bg-base-100 shadow-xl mb-10">
                <figure className="border rounded-lg p-2 m-5">
                  <img
                    src={`/api/files/download?file_name=vehicle-${vehicle.id}`}
                    alt="Vehicle"
                    className="max-w-full max-h-[500px] object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-2xl flex justify-between items-center">
                    <span>
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </span>
                    {loggedInUserId === vehicle?.creator && (
                      <FaEdit
                        className="cursor-pointer"
                        onClick={handleEdit}
                      />
                    )}
                  </h2>

                  <div>
                    {isEditing ? (
                      <div>
                        <label>
                          <strong>Mileage:</strong>
                          <input
                            type="number"
                            name="mileage_km"
                            value={editedVehicle?.mileage_km || ""}
                            onChange={handleInputChange}
                            className="input input-bordered w-full mb-2"
                          />
                        </label>
                        <label>
                          <strong>Fuel Type:</strong>
                          <select
                            name="fuel_type"
                            value={editedVehicle?.fuel_type || ""}
                            onChange={handleInputChange}
                            className="select select-bordered w-full mb-2"
                          >
                            {FuelTypeValues.map((fuel) => (
                              <option key={fuel} value={fuel}>
                                {fuel}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <strong>Drive Type:</strong>
                          <select
                            name="drive_type"
                            value={editedVehicle?.drive_type || ""}
                            onChange={handleInputChange}
                            className="select select-bordered w-full mb-2"
                          >
                            {DriveTypeValues.map((drive) => (
                              <option key={drive} value={drive}>
                                {drive}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <strong>Transmission:</strong>
                          <select
                            name="transmission"
                            value={editedVehicle?.transmission || ""}
                            onChange={handleInputChange}
                            className="select select-bordered w-full mb-2"
                          >
                            {TransmissionTypeValues.map((transmission) => (
                              <option key={transmission} value={transmission}>
                                {transmission}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <strong>Seats:</strong>
                          <input
                            type="number"
                            name="seats_number"
                            value={editedVehicle?.seats_number || ""}
                            onChange={handleInputChange}
                            className="input input-bordered w-full mb-2"
                          />
                        </label>
                        <label>
                          <strong>Doors:</strong>
                          <input
                            type="number"
                            name="doors_number"
                            value={editedVehicle?.doors_number || ""}
                            onChange={handleInputChange}
                            className="input input-bordered w-full mb-2"
                          />
                        </label>
                        <label>
                          <strong>Details:</strong>
                          <textarea
                            name="details"
                            value={editedVehicle?.details || ""}
                            onChange={handleInputChange}
                            className="textarea textarea-bordered w-full mb-2"
                          />
                        </label>
                        <button
                          className="btn btn-primary"
                          onClick={handleSave}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Mileage:</strong> {vehicle.mileage_km} km</p>
                        <p><strong>Fuel Type:</strong> {vehicle.fuel_type}</p>
                        <p><strong>Drive Type:</strong> {vehicle.drive_type}</p>
                        <p><strong>Transmission:</strong> {vehicle.transmission}</p>
                        <p><strong>Seats:</strong> {vehicle.seats_number}</p>
                        <p><strong>Doors:</strong> {vehicle.doors_number}</p>
                        <p><strong>Details:</strong> {vehicle.details}</p>
                      </div>
                    )}
                    {
                      loggedInUserId === vehicle?.creator &&
                      <div className="mt-3">
                        <button
                          className="btn btn-primary"
                          onClick={handleDelete}
                        >
                          Delete
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            ) : (
              <p>No vehicle found.</p>
            )}

            {/* Parts List */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-5">Parts</h2>
              {parts.length > 0 ? (
                <div className="space-y-4">
                  {parts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center bg-base-100 shadow-xl p-5 rounded-lg hover:bg-gray-200 hover:cursor-pointer"
                      onClick={() => router.push(`/parts/${part.id}`)}
                    >
                      <img
                        src={`/api/files/download?file_name=part-${part.id}-0`}
                        alt="Part"
                        className="w-32 h-32 object-cover mr-5 rounded-lg"
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
                      className="flex items-center bg-base-100 shadow-xl p-5 rounded-lg hover:bg-gray-200 hover:cursor-pointer"
                      onClick={() => router.push(`/wheels/${wheel.id}`)}
                    >
                      <img
                        src={`/api/files/download?file_name=wheel-${wheel.id}-0`}
                        alt="Wheel"
                        className="w-32 h-32 object-cover mr-5 rounded-lg"
                      />
                      <div>
                        <h3 className="text-xl font-semibold">
                          Bolt Pattern: {wheel.rim_bolt_pattern}
                        </h3>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No wheels available for this vehicle.</p>
              )}
            </div>
          </div>
          {
            vehicle &&
            <div className="flex-1 flex flex-col gap-1">
              <SellerInformation sellerId={vehicle?.creator} />
              {
                loggedInUserId != vehicle?.creator &&
                <button className="btn btn-primary w-full" onClick={(e: any) => handleConversation(e, vehicle?.creator)}>
                  Send Message
                </button>
              }
            </div>
          }
        </div>


      </div>
    </>
  );
};

export default VehicleInfo;
