import { MemoryRouter } from "react-router-dom";

// LazyLink needs a router context (useNavigate / <Link>).
export const withMemoryRouter = (Story) => (
    <MemoryRouter>
        <Story />
    </MemoryRouter>
);
