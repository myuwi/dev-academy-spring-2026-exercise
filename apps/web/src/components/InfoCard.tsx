import { formatNumber } from "@/utils";

interface InfoCardProps {
  label: string;
  value?: number;
  unit: string;
}

export const InfoCard = ({ label, value, unit }: InfoCardProps) => {
  return (
    <div className="flex flex-col gap-1">
      <span>
        {value ? (
          <>
            <span className="text-4xl">{formatNumber(value)}</span>
            <span className="text-subtle"> {unit}</span>
          </>
        ) : (
          <span className="text-4xl">No data</span>
        )}
      </span>
      <span className="text-sm text-subtle">{label}</span>
    </div>
  );
};
