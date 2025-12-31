export function formatDate(dateString: string, showTime: boolean = true) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Invalid date";

  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  if (!showTime) {
    return `${day}-${month}-${year}`;
  }

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  // Convert 24h to 12h format
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;
  const hoursStr = hours.toString().padStart(2, "0");

  return `${day}-${month}-${year} - ${hoursStr}:${minutes} ${ampm}`;
}
