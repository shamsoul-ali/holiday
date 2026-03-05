import type { Metadata } from "next";
import HolidayAIFinancials from "./HolidayAIFinancials";

export const metadata: Metadata = {
  title: "Holiday AI — Financial Analysis",
  description:
    "Interactive financial workbook: P&L, Cash Flow, Balance Sheet, Unit Economics, and ROI Calculator for Holiday AI.",
};

export default function Page() {
  return <HolidayAIFinancials />;
}
