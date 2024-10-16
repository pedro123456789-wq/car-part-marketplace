import { useState, useEffect } from "react";
import { createFrontEndClient } from "@/app/utils/supabase/client";
import { Vehicle } from "@/app/types_db";
import { IoMdClose } from "react-icons/io";

interface LookupProp {
    isOpen: boolean,
    onClose: () => void;
    onSubmit: any
}

const QuickLookupModal = ({ isOpen, onClose, onSubmit }: LookupProp) => {
    const supabase = createFrontEndClient();

    const [makes, setMakes] = useState<string[]>([]);
    const [models, setModels] = useState<string[]>([]);
    const [years, setYears] = useState<string[]>([]);
    const [selectedMakeId, setSelectedMakeId] = useState<string | null>(null);
    const [selectedModelTrim, setSelectedModelTrim] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [matchingVehicles, setMatchingVehicles] = useState<Vehicle[]>([]);

    // Helper function to deduplicate array
    const deduplicateArray = (array: any[], key: string) => {
        const uniqueObj: { [key: string]: boolean } = {};
        array.forEach((item: any) => {
            if (item && item[key]) {
                uniqueObj[item[key]] = true;
            }
        });
        return Object.keys(uniqueObj);
    };

    // Fetch unique makes from Supabase
    useEffect(() => {
        const fetchMakes = async () => {
            const { data: makesData, error } = await supabase
                .from("distinct_makes")
                .select("model_make_id");


            if (error) {
                console.error("Error fetching makes:", error);
            } else {
                setMakes(makesData.map(item => item.model_make_id));
            }
        };

        fetchMakes();
    }, []);

    // Fetch models based on selected make
    useEffect(() => {
        if (!selectedMakeId) return;

        const fetchModels = async () => {
            const { data: modelsData, error } = await supabase
                .from("distinct_models")
                .select("model_trim")
                .eq("model_make_id", selectedMakeId);

            if (error) {
                console.error("Error fetching models:", error);
            } else {
                setModels(modelsData.map(item => item.model_trim));
            }
        };

        fetchModels();
    }, [selectedMakeId]);

    // Fetch years based on selected make and model
    useEffect(() => {
        if (!selectedMakeId || !selectedModelTrim) return;

        const fetchYears = async () => {
            const { data: yearsData, error } = await supabase
                .from("distinct_years")
                .select("model_year")
                .eq("model_make_id", selectedMakeId)
                .eq("model_trim", selectedModelTrim);

            if (error) {
                console.error("Error fetching years:", error);
            } else {
                setYears(yearsData.map(item => item.model_year));
            }
        };

        fetchYears();
    }, [selectedMakeId, selectedModelTrim]);

    const handleSubmit = async () => {
        if (!selectedMakeId || !selectedModelTrim || !selectedYear) return;

        const { data: vehiclesData, error } = await supabase
            .from("car_models")
            .select("*")
            .eq("model_make_id", selectedMakeId)
            .eq("model_trim", selectedModelTrim)
            .eq("model_year", selectedYear);

        if (error) {
            console.error("Error fetching matching vehicles:", error);
        } else {
            console.log("Matching vehicles:", vehiclesData.length);
            onSubmit(vehiclesData);
        }
    };

    return (
        <div
            className={`z-50 fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${isOpen ? 'block' : 'hidden'}`}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 relative">
                <h2 className="text-2xl font-semibold mb-4">Quick Lookup</h2>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                >
                    <IoMdClose size={24} />
                </button>
                <div className="mb-4">
                    <label htmlFor="makes" className="block mb-2">Select Make:</label>
                    <select
                        id="makes"
                        onChange={(e) => setSelectedMakeId(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Make</option>
                        {makes.map((make) => (
                            <option key={make} value={make}>
                                {make}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedMakeId && (
                    <div className="mb-4">
                        <label htmlFor="models" className="block mb-2">Select Model:</label>
                        <select
                            id="models"
                            onChange={(e) => setSelectedModelTrim(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Model</option>
                            {models.map((model) => (
                                <option key={model} value={model}>
                                    {model}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {selectedModelTrim && (
                    <div className="mb-4">
                        <label htmlFor="years" className="block mb-2">Select Year:</label>
                        <select
                            id="years"
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select Year</option>
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!selectedYear}
                    className={`w-full py-2 text-white bg-blue-500 rounded hover:bg-blue-600 ${!selectedYear ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    Submit
                </button>

                <div className="mt-4 max-h-40 overflow-y-auto">
                    {matchingVehicles.map((vehicle) => (
                        <div key={vehicle.id} className="p-2 border-b">
                            {JSON.stringify(vehicle)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QuickLookupModal;