"use client";
import CustomTextArea from "@/app/components/CustomTextArea";
import NavigationBar from "@/app/components/NavigationBar";
import { useState, useRef } from "react";
import {
  FaBus,
  FaCar,
  FaMotorcycle,
  FaSearch,
  FaSleigh,
  FaTrash,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import { useAlert } from "@/app/components/alert/useAlert";
import Alert from "@/app/components/alert/Alert";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import {
  DriveType,
  DriveTypeValues,
  FuelType,
  FuelTypeValues,
  TransmissionType,
  TransmissionTypeValues,
  VehicleType,
} from "@/app/types_db";
import DropDownInput from "@/app/components/DropdownInput";
import QuickLookupModal from "../lookup";
const NewVehicle: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType>("Car");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [mileage, setMileage] = useState<string>("");
  const [fuelType, setFuelType] = useState<FuelType | null>(null);
  const [driveType, setDriveType] = useState<DriveType | null>(null);
  const [transmission, setTransmission] = useState<TransmissionType | null>(
    null
  );
  const [numberOfSeats, setNumberOfSeats] = useState<string>("");
  const [numberOfDoors, setNumberOfDoors] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { showAlert, message, type: alertType, triggerAlert } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [openQuickLookModal, setOpenQuickLookModal] = useState<boolean>(false);

  const vehicleTypes = [
    { type: "Car", label: "Car", icon: FaCar },
    { type: "Bike", label: "Bike", icon: FaMotorcycle },
    { type: "Snowmobile", label: "Snowmobile ATV", icon: FaSleigh },
    { type: "Other", label: "Other Vehicle", icon: FaBus },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageUpload = async (vehicleId: number) => {
    if (!imageFile) return null;

    // Get the signed URL for uploading the image
    const response = await fetch("/api/files/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        file_name: `vehicle-${vehicleId}`,
        file_type: imageFile.type,
      },
    });

    const { url } = await response.json();
    if (!url) {
      triggerAlert("Error generating upload URL", "error");
      return null;
    }

    // Upload the image to the CDN
    const uploadResponse = await fetch(url, {
      method: "PUT",
      body: imageFile,
      headers: {
        "Content-Type": imageFile.type,
      },
    });

    if (!uploadResponse.ok) {
      return null;
    }

    // The image URL to be stored in the database
    const imageUrl = url.split("?")[0];
    return imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (openQuickLookModal)
      return;
    // Validate inputs
    if (
      !brand ||
      !model ||
      !year ||
      !details ||
      !mileage ||
      !fuelType ||
      !driveType ||
      !transmission ||
      !numberOfSeats ||
      !numberOfDoors
    ) {
      triggerAlert("Please fill in all the fields", "error");
      return;
    }

    if (isNaN(Number(mileage))) {
      triggerAlert("Invalid value for mileage", "error");
      return;
    }

    if (isNaN(Number(numberOfSeats))) {
      triggerAlert("Invalid value for number of seats", "error");
      return;
    }

    if (isNaN(Number(numberOfDoors))) {
      triggerAlert("Invalid value for number of doors", "error");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createFrontEndClient();

      // Prepare data to insert
      const data = {
        type: vehicleType,
        brand,
        model,
        year,
        details,
        mileage_km: parseInt(mileage),
        fuel_type: fuelType,
        drive_type: driveType,
        transmission,
        seats_number: parseInt(numberOfSeats),
        doors_number: parseInt(numberOfDoors),
      };

      const { data: vehicle, error } = await supabase
        .from("vehicle")
        .insert([data])
        .select()
        .single();

      if (error) {
        triggerAlert(error.message, "error");
        setIsLoading(false);
        return;
      }

      // Upload the image if available
      const imageUrl = await handleImageUpload(vehicle.id);
      if (!imageUrl) {
        triggerAlert("Error uploading image", "error");
        setIsLoading(false);
        return;
      }

      router.push("/vehicles");
    } catch (error) {
      console.error(error);
      triggerAlert("Error creating vehicle", "error");
      setIsLoading(false);
    }
  };



  const isValidValue = (value: any): boolean => {
    return value !== null && value !== undefined && value !== -1;
  };

  const handleQuickLookUpSubmit = (lookupVehicle: any) => {
    console.log("LOOKED UP VEHICLE: ", lookupVehicle)
    setOpenQuickLookModal(false);
    lookupVehicle = lookupVehicle[0];

    if (isValidValue(lookupVehicle.model_make_id)) {
      setBrand(lookupVehicle.model_make_id);
    }
    if (isValidValue(lookupVehicle.model_trim)) {
      setModel(lookupVehicle.model_trim);
    }
    if (isValidValue(lookupVehicle.model_year)) {
      setYear(lookupVehicle.model_year);
    }
    if (isValidValue(lookupVehicle.model_engine_fuel)) {
      if (FuelTypeValues.includes(lookupVehicle.model_engine_fuel))
        setFuelType(lookupVehicle.model_engine_fuel);
      else
        setFuelType('Other');
    }
    if (isValidValue(lookupVehicle.model_drive)) {
      if (DriveTypeValues.includes(lookupVehicle.model_drive))
        setDriveType(lookupVehicle.model_drive);
      else
        setDriveType('Other')
    }
    if (isValidValue(lookupVehicle.model_transmission_type)) {
      if (TransmissionTypeValues.includes(lookupVehicle.model_transmission_type))
        setTransmission(lookupVehicle.model_transmission_type);
      else
        setTransmission('Other')
    }
    if (isValidValue(lookupVehicle.model_seats)) {
      setNumberOfSeats(lookupVehicle.model_seats);
    }
    if (isValidValue(lookupVehicle.model_doors)) {
      setNumberOfDoors(lookupVehicle.model_doors);
    }
  }

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div>
      {showAlert && (
        <div className="absolute top-0 w-full">
          <Alert message={message} type={alertType} />
        </div>
      )}
      {
        openQuickLookModal &&
        <QuickLookupModal isOpen={openQuickLookModal} onClose={() => setOpenQuickLookModal(false)} onSubmit={handleQuickLookUpSubmit} />
      }

      <div>
        <div>
          <NavigationBar />
        </div>

        {/* Breadcrumb */}
        <div className="bg-white p-10 min-h-screen">
          <div className="text-sm breadcrumbs mb-8">
            <ul>
              <li>Sell Part</li>
              <li>
                <a href="/vehicles" className="text-blue-500 hover:underline">
                  Select vehicle
                </a>
              </li>
              <li>New Vehicle</li>
            </ul>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-row justify-center mb-6 border-b border-gray-300 space-x-5">
              {vehicleTypes.map(({ type, label, icon: Icon }) => (
                <div
                  key={type}
                  className="flex flex-col items-center justify-center px-2 cursor-pointer"
                  onClick={() => setVehicleType(type as VehicleType)}
                >
                  <Icon
                    className={`text-xl ${vehicleType === type
                      ? "font-bold text-black"
                      : "text-gray-400"
                      }`}
                  />
                  <p
                    className={`text-sm ${vehicleType === type
                      ? "font-bold text-black"
                      : "text-gray-400"
                      }`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <form
              className="w-full shadow-lg p-6 bg-white rounded-lg px-20 mx-20"
              onSubmit={handleSubmit}
            >
              <div className="form-control mb-4 flex flex-col items-center">
                <label className="label mb-2"></label>
                <div
                  className="relative w-48 h-48 border border-dashed border-gray-400 flex items-center justify-center text-gray-500 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Vehicle"
                        className="absolute w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <span>Select Image</span>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-full text-start">
                  <button className="btn btn-primary" onClick={() => setOpenQuickLookModal(true)}>
                    <FaSearch />
                    Quick Lookup
                  </button>
                </div>
                <div className="flex flex-row space-x-2 items-center mt-2">
                  <label className="label">
                    <span className="label-text">Brand</span>
                  </label>
                  <input
                    className="input input-bordered w-64 text-sm"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  ></input>
                </div>

                <div className="flex flex-row space-x-2 items-center mt-2">
                  <label className="label">
                    <span className="label-text">Model</span>
                  </label>

                  <input
                    className="input input-bordered w-64 text-sm"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  ></input>
                </div>

                <div className="flex flex-row space-x-2 items-center mt-2">
                  <label className="label">
                    <span className="label-text">Year</span>
                  </label>
                  <input
                    className="input input-bordered text-sm w-32"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  ></input>
                </div>

                <div className="flex flex-row items-start justify-center w-full mt-2">
                  <label className="label">
                    <span className="label-text">Details: </span>
                  </label>

                  <CustomTextArea
                    placeholder={`Describe your item as precisely as possible:
                                      - General condition (mechanics, body, interior)
                                      - Type and condition of wheels and tires
                                      - Maintenance and repairs
                                      - Possible modifications and improvements`}
                    setVal={setDetails}
                    val={details}
                  />
                </div>

                <div className="flex flex-row space-x-2 items-center mt-2">
                  <label className="label">
                    <span className="label-text">Mileage (km)</span>
                  </label>
                  <input
                    className="input input-bordered text-sm w-32"
                    type="number"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                  ></input>
                </div>

                <div className="flex flex-col md:flex-row md:space-x-5 items-start justify-center my-5">
                  <div className="flex flex-col items-start mt-2 w-full justify-center">
                    <label className="label">
                      <span className="label-text">Fuel type</span>
                    </label>

                    <DropDownInput
                      options={FuelTypeValues as any as string[]}
                      placeholder="Fuel Type"
                      selectedText={fuelType || ""}
                      setSelectedText={(text) => setFuelType(text as FuelType)}
                    />
                  </div>

                  <div className="flex flex-col items-start mt-2 w-full justify-center">
                    <label className="label">
                      <span className="label-text">Drive type</span>
                    </label>

                    <DropDownInput
                      options={DriveTypeValues as any as string[]}
                      placeholder="Drive Type"
                      selectedText={driveType || ""}
                      setSelectedText={(text) =>
                        setDriveType(text as DriveType)
                      }
                    />
                  </div>

                  <div className="flex flex-col items-start mt-2 w-full justify-center">
                    <label className="label">
                      <span className="label-text">Transmission</span>
                    </label>

                    <DropDownInput
                      options={TransmissionTypeValues as any as string[]}
                      placeholder="Transmission"
                      selectedText={transmission || ""}
                      setSelectedText={(text) =>
                        setTransmission(text as TransmissionType)
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-row space-x-2 items-center mt-2">
                  <label className="label">
                    <span className="label-text">Number of seats</span>
                  </label>
                  <input
                    className="input input-bordered w-32 text-sm"
                    value={numberOfSeats}
                    type="number"
                    onChange={(e) => setNumberOfSeats(e.target.value)}
                  ></input>
                </div>

                <div className="flex flex-row space-x-2 items-center mt-2">
                  <label className="label">
                    <span className="label-text">Number of doors</span>
                  </label>
                  <input
                    className="input input-bordered w-32 text-sm"
                    value={numberOfDoors}
                    type="number"
                    onChange={(e) => setNumberOfDoors(e.target.value)}
                  ></input>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button type="submit" className="btn btn-primary">
                  Create Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewVehicle;
