/* eslint-disable react-refresh/only-export-components -- Storybook story
   files mix the story object and small demo components by design. */
import { useState } from "react";
import { Modal } from "../";

const code = `
    import { useState } from "react";
    import { Modal } from "@cap-rel/smartcommon";

    const [isOpen, setIsOpen] = useState(false);

    <button onClick={() => setIsOpen(true)}>Open modal</button>
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="My Modal"
      size="md"
      position="center"
    >
      <div className="p-4">Modal content here</div>
    </Modal>
`;

export const Default = {
    args: {
        title: "My Modal",
        size: "md",
        position: "center",
        showCloseButton: true,
        closeOnOverlayClick: true,
    },
    parameters: {
        docs: { source: { code } },
    },
    render: (args) => <ModalStory {...args} />,
};

const ModalStory = (args) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="p-8">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Open modal
            </button>
            <Modal {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <div className="p-4">
                    <p>This is the modal body.</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Click outside or the X button to close.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
