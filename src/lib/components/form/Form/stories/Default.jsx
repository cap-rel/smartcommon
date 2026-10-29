import { setDefaultStory } from "../../../../../storybook";
import { ContactForm } from "./ContactForm";

export const Default = {
    ...setDefaultStory({
        code: `
            import { Form, Input, Button, useForm } from "@cap-rel/smartcommon";

            const ContactForm = () => {
              const form = useForm({ defaultValues: { name: "", email: "" } });

              return (
                <Form form={form} onSubmit={() => save(form.values)}>
                  <Input name="name" label="Name" required />
                  <Input name="email" type="email" label="Email" required />
                  <Button type="submit" label="Send" />
                </Form>
              );
            };
        `,
    }),
    render: () => <ContactForm />,
};
