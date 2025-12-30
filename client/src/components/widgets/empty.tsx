import emptyImg from "../../assets/icons/empty_box.png";
import notFoundImg from "../../assets/icons/empty_box.png";

interface EmptyStateProps {
  title: string;
  description?: string;
  variant?: "empty" | "notFound"; // switch between images
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, variant = "empty" }) => {
  const image = variant === "notFound" ? notFoundImg : emptyImg;

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 w-full p-14">
      <img src={image} className="size-16" alt={variant} />
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${ variant == "empty" ? "text-primary" : "text-black/70"}`}>{title}</h2>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default EmptyState;
