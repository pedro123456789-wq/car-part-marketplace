"use client";

interface Props {
    placeholder: string;
    val: string;
    setVal: (newVal: string) => void;
}

const CustomTextArea: React.FC<Props> = ({ placeholder, val, setVal }) => (
  <div className="relative w-full">
    {/* Use background div to add multi-line placeholder to textarea */}
    {val.length === 0 && (
        <div className="absolute inset-0 text-gray-400 text-sm p-4 pointer-events-none whitespace-pre-line">
            {placeholder}
        </div>
    )}

    <textarea
      className="relative z-10 textarea text-sm border-black w-full h-64 bg-transparent p-4"
      style={{ resize: "none" }}
      value={val}
      onChange={(e) => setVal(e.target.value)}
    ></textarea>
  </div>
);

export default CustomTextArea;
