import { Link, useNavigate } from 'react-router-dom';
import { isEmpty } from '../../../globals/functions';

export const LazyLink = ({
  to = null,
  state = null,
  duration = 0,
  onClick = null,
  children = null,
  ...props
}) => {
  const navigate = useNavigate();

  const handleOnClick = (e) => {
    e.preventDefault();
    if (!isEmpty(onClick)) {
      onClick();
    }
    setTimeout(() => {
      navigate(to, { state });
    }, duration);
  };

  return (
    <Link
      to={to}
      state={state}
      onClick={handleOnClick}
      { ...props}
    >
      {children}
    </Link>
  );
};