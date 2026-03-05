import type { Metadata } from "next";
import HolidayAIProposal from "./HolidayAIProposal";

export const metadata: Metadata = {
  title: "Holiday AI — Investor Proposal",
  description:
    "AI-powered travel planning for everyone. Seed investment proposal for Holiday AI.",
};

export default function HolidayAIPage() {
  return <HolidayAIProposal />;
}
