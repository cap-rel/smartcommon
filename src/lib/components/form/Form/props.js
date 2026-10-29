import PropTypes from "prop-types";

export const propTypes = {
    /** The object returned by useForm(): values, errors, submit state and
     * setters. Fields placed inside the Form read and write it by `name`. */
    form: PropTypes.object.isRequired,
    /** Called first on submit, before the validation rules are checked. */
    onPreSubmit: PropTypes.func,
    /** Called only when every field passes its rules. */
    onSubmit: PropTypes.func,
    /** Fields and the submit Button (type="submit"). */
    children: PropTypes.node,
};
