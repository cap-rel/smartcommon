import PropTypes from "prop-types";

export const propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  help: PropTypes.string,
  type: PropTypes.arrayOf(PropTypes.oneOf(["int", "stock", "reel", "price", "pricey"])),
  placeholder: PropTypes.arrayOf(PropTypes.string),
  min: PropTypes.arrayOf(PropTypes.number),
  max: PropTypes.arrayOf(PropTypes.number),
  step: PropTypes.arrayOf(PropTypes.number),
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string,
  color: PropTypes.string
};