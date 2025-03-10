import PropTypes from "prop-types";

export const propTypes = {
  label: PropTypes.string,
  labelRow: PropTypes.bool,
  help: PropTypes.string,
  variant: PropTypes.oneOf(["star", "heart", "like", "smile"]),
  divided: PropTypes.bool,
  maxRating: PropTypes.number,
  onValueChange: PropTypes.func,

  containerProps: PropTypes.object,
  labelContainerProps: PropTypes.object,
  labelProps: PropTypes.object,
  requiredStarProps: PropTypes.object,
  helpProps: PropTypes.object,
  inputProps: PropTypes.object,
  ratingContainerProps: PropTypes.object,
  iconProps: PropTypes.object
};