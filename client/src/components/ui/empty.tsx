import emptyImg from "../../assets/icons/empty_box.png";
import notFoundImg from "../../assets/icons/empty_box.png";
import inProgressImg from "../../assets/icons/maintenance.png";


// Specific Images------------------------------------------------
import prjectImg from "../../assets/icons/project.png";
import memberImg from "../../assets/icons/members.png";
import famillyImg from "../../assets/icons/familly.png";
import assistanceImg from "../../assets/icons/assitance.png";
import deliveryImg from "../../assets/icons/delivery.png";
import reportImg from "../../assets/icons/report.png";
import auditImg from "../../assets/icons/audit.png";
import analyticImg from "../../assets/icons/analytics.png";

const initEmptyState: any = {
  empty: emptyImg,
  inProgress: inProgressImg,
  notFound: notFoundImg,
  project: prjectImg,
  member: memberImg,
  familiy: famillyImg,
  assistance: assistanceImg,
  delivery: deliveryImg,
  report: reportImg,
  audit: auditImg,
  analytics: analyticImg
}

interface EmptyStateProps {
  title: string;
  description?: any;
  variant?: "empty" | "notFound" | "inProgress" | "project" | "member" | "familiy" | "assistance" | "delivery" | "report" | "audit" | "analytics" | "analytics"; 
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, variant = "empty" }) => {
  // const image = variant === "notFound" ? notFoundImg : variant === "inProgress" ? inProgressImg : emptyImg;

  return (
    <div className="flex flex-col justify-center items-center gap-y-4 w-full p-14">
      <img src={initEmptyState[variant]} className="size-16" alt={variant} />
      <div className="text-center">
        <h2 className={`text-2xl font-bold ${ variant == "empty" || "inProgress" ? "text-primary" : "text-black/70"}`}>{title}</h2>
        {description && <p className="text-gray-500">{description}</p>}
      </div>
    </div>
  );
};

export default EmptyState;
