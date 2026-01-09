import csv from "../assets/img-icons/csv.png";
import doc from "../assets/img-icons/doc.png";
import attach from "../assets/img-icons/document.png"; // fallback
import docx from "../assets/img-icons/docx.png";
import img from "../assets/img-icons/image_file.png";
import jpg from "../assets/img-icons/jpg.png";
import pdf from "../assets/img-icons/pdf.png";
import png from "../assets/img-icons/png.png";
import ppt from "../assets/img-icons/ppt.png";
import pptx from "../assets/img-icons/pptx.png";
import txt from "../assets/img-icons/txt.png";
import xls from "../assets/img-icons/xls.png";
import xlsx from "../assets/img-icons/xlsx.png";

const iconMap: Record<string, string> = {
  // Images
  jpg: jpg,
  jpeg: jpg,
  png: png,
  gif: img,
  webp: img,
  svg: img,

  // Documents
  pdf: pdf,
  doc: doc,
  docx: docx,

  // Excel
  xls: xls,
  xlsx: xlsx,

  // PowerPoint
  ppt: ppt,
  pptx: pptx,

  // Text / CSV
  txt: txt,
  csv: csv,

  // Default fallback
  default: attach,
};

export const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (!ext) return iconMap.default;

  return iconMap[ext] || iconMap.default;
};