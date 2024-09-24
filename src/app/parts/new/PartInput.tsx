"use client";

import { useState, useRef } from "react";
import CustomTextArea from "@/app/components/CustomTextArea";
import { useAlert } from "@/app/components/alert/useAlert";
import Alert from "@/app/components/alert/Alert";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/app/components/LoadingIndicator";
import { useUser } from "@/app/contexts/UserContext";

interface Props {
  vehicleId: string;
}

const PartInput: React.FC<Props> = ({ vehicleId }) => {
  const [partName, setPartName] = useState<string>("");
  const [partNumber, setPartNumber] = useState<string>("");
  const [partInfo, setPartInfo] = useState<string>("");

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
   * Handles the image change event for the part input form.
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
   * @param partId
   * @param imageIndex
   * @returns
   */
  const handleImageUpload = async (
    imageFile: File,
    partId: number,
    imageIndex: number
  ) => {
    if (!imageFile) return null;

    // Get the signed URL for uploading the image
    const response = await fetch("/api/files/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        file_name: `part-${partId}-${imageIndex}`,
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

  const saveNewPart = async () => {
    // Validate inputs
    if (!partName || !partNumber || !partInfo) {
      triggerAlert("Please fill in all required fields.", "error");
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

    //Save part data to the database
    const { data: partData, error } = await supabase
      .from("part")
      .insert([
        {
          name: partName,
          number: partNumber,
          info: partInfo,
          owner_id: session.user.id,
          vehicle_id: parseInt(vehicleId),
        },
      ])
      .select()
      .single();

    if (error) {
      triggerAlert(error.message, "error");
      setIsLoading(false);
      return;
    }

    // Upload images to R2 cloudflare storage
    for (let i = 0; i < images.length; i++) {
      const imageFile = images[i];

      if (imageFile) {
        const isUploadSuccess = await handleImageUpload(
          imageFile,
          partData.id,
          i
        );
        if (!isUploadSuccess) {
          triggerAlert("Error uploading image", "error");
          setIsLoading(false);
          return;
        }
      }
    }

    //success
    setIsLoading(false);
    triggerAlert("Part added successfully!", "success");
    router.push("/");
  };

  if (isLoading) return <LoadingIndicator />;

  return (
    <>
      {showAlert && <Alert message={message} type={type} />}

      <div className="flex flex-col w-full items-center justify-center mt-10 px-20">
        {/* Part Images */}
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
                    alt={`Part Image ${index + 1}`}
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

        <div className="flex flex-col w-full justify-center items-end space-y-2 md:items-center md:space-y-0 md:flex-row md:space-x-5 mt-5">
          <div className="flex flex-row items-center justify-center space-x-2">
            <p className="font-bold">Part name:</p>
            <input
              className="input bg-gray-300 w-48"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
            />
          </div>

          <div className="flex flex-row items-center justify-center space-x-2">
            <p className="font-bold">Number:</p>
            <input
              className="input bg-gray-300 text-sm w-48"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-row items-start justify-end mt-3 space-x-5 w-full md:w-[60vw]">
          <p className="font-bold">Info:</p>

          <CustomTextArea
            placeholder={`Describe the item as accurately as possible:
                             - General condition (mechanics, body, interior)
                             - Type and condition of wheels and tires
                             - Maintenance and repairs
                             - Possible modifications and improvements`}
            val={partInfo}
            setVal={setPartInfo}
          />
        </div>
        <div>
          <button className="btn btn-primary mt-5 w-32" onClick={saveNewPart}>
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default PartInput;
