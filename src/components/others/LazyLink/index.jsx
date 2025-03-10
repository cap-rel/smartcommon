import { Link, useNavigate } from 'react-router-dom';
import { propTypes } from './props';

export const LazyLink = ({
  to,
  state,
  duration = 0,
  onClick = () => {},
  children,
  ...props
}) => {
  const navigate = useNavigate();

  const handleOnClick = (e) => {
    e.preventDefault();
    onClick();
    setTimeout(() => navigate(to, { state }), duration);
  };

  return (
    <Link
      { ...props}
      onClick={handleOnClick}
    >
      {children}
    </Link>
  );
};

LazyLink.propTypes = propTypes;