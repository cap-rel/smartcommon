import { Link, useNavigate } from 'react-router-dom';

export const LazyLinkDol = (props) => {
  const { onClick, lazyTo, lazyState, duration, children } = props;
  const navigate = useNavigate();

  const handleOnClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    setTimeout(() => {
      navigate(lazyTo, { state: lazyState });
    }, duration || 0);
  };

  return (
    <Link { ...props } onClick={handleOnClick}>
        {children}
    </Link>
  );
};