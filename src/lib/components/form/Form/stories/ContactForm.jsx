import { useState } from "react";

import { Button, Input } from "lib/components";
import { useForm } from "lib/hooks";
import { Form } from "../";

// A Form needs the object returned by useForm(): the story renders a small
// component so the hook runs where React expects it.
export const ContactForm = () => {
    const form = useForm({ defaultValues: { name: "", email: "" } });
    const [sent, setSent] = useState(null);

    return (
        <div className="flex flex-col gap-app-base max-w-sm">
            <Form form={form} onSubmit={() => setSent({ ...form.values })}>
                <div className="flex flex-col gap-app-sm">
                    <Input name="name" label="Name" required />
                    <Input name="email" type="email" label="Email" required />
                    <Button type="submit" label="Send" />
                </div>
            </Form>
            {sent && (
                <pre className="text-app-xs bg-medium-bg p-app-sm rounded-app-md">
                    {`onSubmit called with ${JSON.stringify(sent)}`}
                </pre>
            )}
        </div>
    );
};
