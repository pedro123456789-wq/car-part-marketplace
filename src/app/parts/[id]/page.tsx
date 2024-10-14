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
import { FaArrowLeft, FaEdit, FaSave } from "react-icons/fa";

import SellerInformation from "@/app/components/SellerInfo";
import Inbox from "@/app/components/Message/Inbox";

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
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  // Editable state management
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editablePart, setEditablePart] = useState<Part | null>(null);

  useEffect(() => {
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
        setEditablePart(partData); // Initialize editable part data

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

        // Fetch matching parts
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

  const handleConversation = async (e: any, recipientId: string) => {
    e.preventDefault();
    try {
      const { data: existingConversation, error: conversationCheckError } = await supabase
        .from("conversation")
        .select("*")
        .or(`user_one.eq.${loggedInUserId},user_two.eq.${loggedInUserId}`)
        .or(`user_one.eq.${recipientId},user_two.eq.${recipientId}`)
        .maybeSingle();

      if (conversationCheckError && conversationCheckError.code !== "PGRST116") {
        throw conversationCheckError;
      }

      let conversationId;

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
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
      }
      window.location.href = `/chat?chatId=${conversationId}`;

    } catch (error) {
      console.log("ERROR TRYING TO HANDLE CONVERSATION[+]");
    }
  }

  const handleEdit = () => {
    setIsEditing(true);
    if (part)
      setEditablePart({ ...part }); // Create a copy of the part to edit
  };

  const handleSave = async () => {
    if (!editablePart) return;

    try {
      const { error } = await supabase
        .from("part")
        .update({
          name: editablePart.name,
          number: editablePart.number,
          info: editablePart.info,
        })
        .eq("id", partId);

      if (error) throw error;

      setPart(editablePart); // Update the part state with the edited values
      setIsEditing(false);
      triggerAlert("Part updated successfully.", "success");
    } catch (error) {
      console.error("Error updating part:", error);
      triggerAlert("Error updating part.", "error");
    }
  }

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

        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex-[3]">
            {/* Part Information */}
            {part ? (
              <div className="card bg-base-100 shadow-xl mb-10">
                <div className="card-body">
                  {/* Image Gallery */}
                  <ImageGallery imageUrls={imageUrls} />

                  <div className="flex items-center justify-between">
                    {editablePart && isEditing ? (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={editablePart?.name}
                        onChange={(e) => setEditablePart({ ...editablePart, name: e.target.value })}
                      />
                    ) : (
                      <h2 className="card-title text-2xl mt-5">{part.name}</h2>
                    )}
                    {
                      loggedInUserId == part?.owner_id && !isEditing &&
                      <button className="btn btn-ghost text-2xl" onClick={handleEdit}>
                        <FaEdit />
                      </button>
                    }
                  </div>

                  {editablePart && isEditing ? (
                    <input
                      type="text"
                      className="input input-bordered w-full mt-2"
                      value={editablePart.number}
                      onChange={(e) => setEditablePart({ ...editablePart, number: e.target.value })}
                    />
                  ) : (
                    <h3 className="text-lg mt-2">Number: {part.number}</h3>
                  )}

                  {editablePart && isEditing ? (
                    <textarea
                      className="textarea textarea-bordered w-full mt-2"
                      value={editablePart.info}
                      onChange={(e) => setEditablePart({ ...editablePart, info: e.target.value })}
                    />
                  ) : (
                    <p className="mt-2">{part.info}</p>
                  )}
                  {
                    isEditing &&
                    <button
                      className="btn btn-primary"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                  }
                  <div>
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

              </div>
            ) : (
              <p>Part details not found.</p>
            )}
            {/* Tabs */}
            <div className="flex flex-row justify-center items-center space-x-10 w-full mt-10">
              <p
                className={`cursor-pointer ${selectedTab === "matching" ? "font-bold underline" : ""
                  }`}
                onClick={() => setSelectedTab("matching")}
              >
                Matching Parts
              </p>
              <p
                className={`cursor-pointer ${selectedTab === "other" ? "font-bold underline" : ""
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
          {
            part && loggedInUserId &&
            <div className="flex-1 flex flex-col gap-5">
              <SellerInformation sellerId={part?.owner_id} />
              {
                loggedInUserId != part?.owner_id &&
                <button className="btn btn-primary w-full" onClick={(e: any) => handleConversation(e, part?.owner_id)}>
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

export default PartDetails;
