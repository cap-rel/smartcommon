import { isNil } from 'lodash';

import { useVariantMerger } from 'lib/hooks';

import { propTypes } from './props';

const Link = () => {
  return null;
}

export const LazyLink = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("LazyLink", props);

  // Top-level to/onClick used to be dropped silently (only the Link slot was
  // read); the slot keeps priority, the top-level props act as fallback.
  const { duration = 0, to, onClick, children } = variantProps;

  const linkProps = variantProps.Link || {};

  const { to: slotTo, onClick: slotOnClick } = linkProps;

  // const navigate = useNavigate();

  const handleLinkOnClick = e => {
    e.preventDefault();
    if (!isNil(slotOnClick)) {
      slotOnClick();
    } else if (!isNil(onClick)) {
      onClick();
    }
    // setTimeout(() => navigate(slotTo ?? to, { ...linkProps }), duration);
  };

  return (
    <Link { ...mergeProps("Link", props => ({
      ...props,
      to: slotTo ?? to,
      onClick: handleLinkOnClick
    }))}>
      {children}
    </Link>
  );
};

LazyLink.propTypes = propTypes;
