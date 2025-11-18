import { isNil } from 'lib/utils';
import { useVariantMerger } from 'lib/hooks';

import { propTypes } from './props';

const Link = () => {
  return null;
}

export const LazyLink = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("LazyLink", props);

  const { duration = 0, children } = variantProps;

  const linkProps = variantProps.Link || {};

  const { to, onClick } = linkProps;

  // const navigate = useNavigate();

  const handleLinkOnClick = e => {
    e.preventDefault();
    if (!isNil(onClick)) {
      onClick();
    }
    // setTimeout(() => navigate(to, { ...linkProps }), duration);
  };

  return (
    <Link { ...mergeProps("Link", props => ({
      ...props,
      onClick: handleLinkOnClick
    }))}>
      {children}
    </Link>
  );
};

LazyLink.propTypes = propTypes;