import PropTypes from "prop-types";

export const propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  help: PropTypes.string,
  type: PropTypes.oneOf(["varchar", "mail", "password", "phone", "url", "link", "ip", "date", "timestamp", "time", "datetime"]),
  placeholder: PropTypes.string,
  pictogram: PropTypes.shape({
    library: PropTypes.string,
    icon: PropTypes.string
  }),
  min: PropTypes.number,
  size: PropTypes.number,
  max: PropTypes.number,
  pattern: PropTypes.string,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  className: PropTypes.string,
  color: PropTypes.string
};