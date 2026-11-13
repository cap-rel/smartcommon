// Demo content shared by the stories: a master list of interventions and
// the detail of one of them.
const INTERVENTIONS = [
    { id: 42, ref: "INT-0042", customer: "Atelier Martin", date: "13/11/2026", status: "In progress" },
    { id: 43, ref: "INT-0043", customer: "Boulangerie Petit", date: "14/11/2026", status: "Planned" },
    { id: 44, ref: "INT-0044", customer: "Garage du Centre", date: "15/11/2026", status: "Planned" },
];

export const MasterList = ({ selectedId, onSelect }) => (
    <ul className="divide-y divide-border">
        {INTERVENTIONS.map((item) => (
            <li key={item.id}>
                <button
                    type="button"
                    aria-current={item.id === selectedId ? "true" : undefined}
                    onClick={() => onSelect?.(item)}
                    className={`w-full text-left px-app-base py-app-sm text-app-sm transition-colors ${
                        item.id === selectedId ? "bg-primary/10 text-primary" : "hover:bg-medium-bg"
                    }`}
                >
                    <span className="font-app-semibold">{item.ref}</span>
                    <span className="block text-soft-text">{item.customer}</span>
                </button>
            </li>
        ))}
    </ul>
);

export const Detail = ({ id }) => {
    const item = INTERVENTIONS.find((entry) => entry.id === id);
    if (!item) {
        return null;
    }
    return (
        <div className="p-app-base text-app-sm">
            <p className="text-app-lg font-app-bold">{item.ref}</p>
            <p className="text-soft-text">{item.customer}</p>
            <p className="mt-app-sm">Date: {item.date}</p>
            <p>Status: {item.status}</p>
        </div>
    );
};

export const Placeholder = () => (
    <p className="p-app-base text-app-sm text-soft-text">Pick an intervention</p>
);
