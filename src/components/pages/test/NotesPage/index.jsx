import { useStates } from "../../../../hooks";
import { PrivateLayout } from "../../../layouts/test/PrivateLayout";
import { Button, Panel } from "../../../others";

export const NotesPage = (props) => {
    const { states, set } = useStates({
        isVisible: false
    })

    const { isVisible } = states;

    return (
        <PrivateLayout>
            <div className={`p-4`}>
                <Button onClick={() => set("isVisible", true)}>
                    Ouvre Panel
                </Button>
                <Panel
                    floating
                    position={`top`}
                    isVisible={isVisible}
                    setVisibility={value => set("isVisible", value)}
                >
                    Bonjour
                </Panel>
            </div>
        </PrivateLayout>
    );
};