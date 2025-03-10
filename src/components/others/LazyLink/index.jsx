import { Link, useNavigate } from 'react-router-dom';
import { propTypes } from './props';
import { isEmpty } from '../../../globals/functions';

export const LazyLink = ({
  duration = 0,
  lazyLinkProps,
  ...props
}) => {
  const lazyLinkPs = { ...props, ...lazyLinkProps };

  const { to, state, onClick, children } = lazyLinkPs;

  const navigate = useNavigate();

  const handleOnClick = (e) => {
    e.preventDefault();
    if (!isEmpty(onClick)) {
      onClick();
    }
    setTimeout(() => navigate(to, { state }), duration);
  };

  return (
    <Link
      { ...lazyLinkPs}
      onClick={handleOnClick}
    >
      {children}
    </Link>
  );
};

LazyLink.propTypes = propTypes;