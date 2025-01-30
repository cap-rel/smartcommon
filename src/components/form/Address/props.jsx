import PropTypes from "prop-types";

export const propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  help: PropTypes.string,
  placeholder: PropTypes.string,
  min: PropTypes.number,
  size: PropTypes.number,
  max: PropTypes.number,
  pattern: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,   
  value: PropTypes.string.isRequired, 
  onChange: PropTypes.func,
  color: PropTypes.string,
  className: PropTypes.string,
};