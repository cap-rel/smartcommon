import { FaCircleQuestion, FaHouse, FaRocket, FaUsers } from "react-icons/fa6";

// Shared by the stories: router links (`to`), a counter badge, and a button
// entry (no `to`, an onClick).
export const demoLinks = (onHelp) => [
    { id: "home", label: "Home", icon: FaHouse, to: "/" },
    { id: "interventions", label: "Interventions", icon: FaRocket, to: "/interventions", badge: 3 },
    { id: "clients", label: "Clients", icon: FaUsers, to: "/clients" },
    { id: "help", label: "Help", icon: FaCircleQuestion, onClick: onHelp },
];

export const demoBrand = ({ collapsed }) => (
    <span className="font-app-bold text-primary truncate">{collapsed ? "SI" : "smartInterventions"}</span>
);
