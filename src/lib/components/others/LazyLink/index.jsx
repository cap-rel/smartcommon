import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useVariantMerger } from 'lib/hooks';
import { applyFunctionIfNotNil } from 'lib/utils';

import { propTypes } from './props';

// Router link that waits `duration` ms before navigating, so an exit
// animation or a pending side effect started by onClick can finish first.
// Modified clicks (ctrl/meta/shift, middle button) keep the native behaviour
// (new tab / window) and bypass the delay.
export const LazyLink = (props) => {
  const { variantProps, mergeProps } = useVariantMerger("LazyLink", props);

  // The Link slot keeps priority over the top-level props.
  const { duration = 0, to, state, replace, onClick, children } = variantProps;

  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <Link { ...mergeProps("Link", props => {
      const target = props.to ?? to;
      const navigateOptions = { state: props.state ?? state, replace: props.replace ?? replace };

      return {
        ...props,
        to: target,
        state: navigateOptions.state,
        replace: navigateOptions.replace,
        onClick: e => {
          applyFunctionIfNotNil(props.onClick ?? onClick, e);

          const isModifiedClick = e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
          if (e.defaultPrevented || isModifiedClick) return;

          e.preventDefault();
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => navigate(target, navigateOptions), duration);
        }
      };
    })}>
      {children}
    </Link>
  );
};

LazyLink.propTypes = propTypes;
