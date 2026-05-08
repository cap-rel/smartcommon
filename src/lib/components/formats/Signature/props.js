import PropTypes from "prop-types";

export const propTypes = {
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.shape({
            signature: PropTypes.string,
            signer: PropTypes.string,
            coordinates: PropTypes.array,
            signedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        }),
    ]),
};
