"use client";

import { useState, useRef } from "react";
import DropDownInput from "@/app/components/DropdownInput";
import CustomTextArea from "@/app/components/CustomTextArea";
import { useAlert } from "@/app/components/alert/useAlert";
import Alert from "@/app/components/alert/Alert";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import { useUser } from "@/app/contexts/UserContext";
import { rimBoltPatterns, rimSizes, tireProfiles, tireSizes, tireWidths } from "@/app/types_db";

interface Props {
  vehicleId: string;
}

const WheelInput: React.FC<Props> = ({ vehicleId }) => {
  const [boltPattern, setBoltPattern] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [tireWidth, setTireWidth] = useState<string>("");
  const [tireProfile, setTireProfile] = useState<string>("");
  const [tireSize, setTireSize] = useState<string>("");
  const [additionalInformation, setAdditionalInformation] = useState<string>("");

  const [images, setImages] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const { showAlert, message, type, triggerAlert } = useAlert();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const supabase = createFrontEndClient();
  const router = useRouter();
  const { session } = useUser();
  
  /**
   * Handles the image change event for the wheel input form.
   * @param index
   * @param e
   */
  const handleImageChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);

      const newPreviews = [...imagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setImagePreviews(newPreviews);
    }
  };

  /**
   * Clears the image at the specified index.
   * @param index
   */
  const clearImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);

    if (fileInputRefs[index].current) {
      fileInputRefs[index].current!.value = "";
    }
  };

  /**
   * Handles the image upload process.
   * @param imageFile
   * @param wheelId
   * @param imageIndex
   * @returns
   */
  const handleImageUpload = async (
    imageFile: File,
    wheelId: number,
    imageIndex: number
  ) => {
    if (!imageFile) return null;

    // Get the signed URL for uploading the image
    const response = await fetch("/api/files/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        file_name: `wheel-${wheelId}-${imageIndex}`,
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
      return false;
    }

    return true;
  };

  const saveNewWheel = async () => {
    // Validate inputs
    if (!boltPattern || !size || !additionalInformation) {
      triggerAlert("Please fill in all required fields.", "error");
      return;
    }

    if (
      isNaN(Number(tireWidth)) ||
      isNaN(Number(tireProfile)) ||
      isNaN(Number(tireSize))
    ) {
      triggerAlert("Please enter a valid value for the numeric fields", "error");
      return;
    }

    if (!session || !session.user) {
      triggerAlert("User not authenticated.", "error");
      return;
    }

    // Check if at least one image is uploaded
    const uploadedImages = images.filter((img) => img !== null);
    if (uploadedImages.length === 0) {
      triggerAlert("Please upload at least one image.", "error");
      return;
    }

    setIsLoading(true);

    const wheelData = {
      rim_bolt_pattern: boltPattern,
      rim_size: size,
      tire_width: Number(tireWidth),
      tire_profile: Number(tireProfile),
      tire_size: Number(tireSize),
      additional_information: additionalInformation,
      owner_id: session?.user.id,
      vehicle_id: parseInt(vehicleId),
    };

    // Save wheel data to the database and get the wheel ID
    const { data: wheelDataResult, error } = await supabase
      .from("wheel")
      .insert([wheelData])
      .select()
      .single();

    if (error) {
      triggerAlert(error.message, "error");
      setIsLoading(false);
      return;
    }

    const wheelId = wheelDataResult.id;

    // Upload images to R2 Cloudflare storage
    for (let i = 0; i < images.length; i++) {
      const imageFile = images[i];

      if (imageFile) {
        const isUploadSuccess = await handleImageUpload(
          imageFile,
          wheelId,
          i
        );
        if (!isUploadSuccess) {
          triggerAlert("Error uploading image", "error");
          setIsLoading(false);
          return;
        }
      }
    }

    setIsLoading(false);
    triggerAlert("Wheel added successfully!", "success");
    router.push("/");
  };

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      {showAlert && <Alert message={message} type={type} />}

      {/* Wheel Part Section */}
      <div className="flex flex-col w-full items-center justify-center mt-10 px-20">
        {/* Image Upload Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <div
                className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg m-3 text-center cursor-pointer"
                onClick={() => fileInputRefs[index].current?.click()}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={`Wheel Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span>Select Image</span>
                )}
              </div>
              {preview && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage(index);
                  }}
                >
                  &#x2715;
                </button>
              )}
              <input
                type="file"
                className="hidden"
                ref={fileInputRefs[index]}
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 w-full">
          <h1 className="text-center mr-[50vw] font-bold text-lg">Rim</h1>

          <div className="flex flex-row space-x-5 w-full justify-center">
            <div className="w-64">
              <h1>Bolt Pattern</h1>
              <DropDownInput
                options={rimBoltPatterns}
                placeholder="Select a value"
                selectedText={boltPattern}
                setSelectedText={setBoltPattern}
              />
            </div>

            <div className="w-64">
              <h1>Size</h1>
              <DropDownInput
                options={rimSizes}
                placeholder="Select a value"
                selectedText={size}
                setSelectedText={setSize}
              />
            </div>
          </div>
        </div>

        {/* Tire Section */}
        <div className="mt-5">
          <h2 className="text-lg font-bold text-center mr-[50vw]">Tire</h2>
          <div className="grid grid-cols-3 gap-4 bg-gray-300 rounded-lg p-4">
            <div>
              <h3>Width</h3>
              <DropDownInput
                options={tireWidths}
                placeholder="Select a value"
                selectedText={tireWidth}
                setSelectedText={setTireWidth}
              />
            </div>

            <div>
              <h3>Profile</h3>
              <DropDownInput
                options={tireProfiles}
                placeholder="Select a value"
                selectedText={tireProfile}
                setSelectedText={setTireProfile}
              />
            </div>

            <div>
              <h3>Size</h3>
              <DropDownInput
                options={tireSizes}
                placeholder="Select a value"
                selectedText={tireSize}
                setSelectedText={setTireSize}
              />
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-5 w-full">
          <h3 className="text-lg font-bold text-center mr-[50vw]">Additional Information:</h3>
          <CustomTextArea
            val={additionalInformation}
            setVal={setAdditionalInformation}
            placeholder={`Describe your item as accurately as possible:
                                - Overall condition (technical, body, interior)
                                - Type and condition of rims and tires
                                - Maintenance and repairs
                                - Possible modifications and improvements`}
          />
        </div>

        {/* Save Button */}
        <div>
          <button className="btn btn-primary mt-5 w-32" onClick={saveNewWheel}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default WheelInput;
