import { Component } from "react";
import PropTypes from "prop-types";

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });

        // Log to console with the error's own stack first (more useful than
        // React's componentStack which is minified in production builds and
        // requires sourcemaps to be readable). The componentStack is still
        // dumped after for context.
        console.error(
            "ErrorBoundary caught an error:",
            error?.message || error,
            "\nStack:", error?.stack,
            "\nComponent stack:", errorInfo?.componentStack
        );

        // Call optional onError callback
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        const { hasError, error } = this.state;
        const { children, fallback, FallbackComponent } = this.props;

        if (hasError) {
            // Custom fallback component
            if (FallbackComponent) {
                return <FallbackComponent error={error} resetError={this.handleReset} />;
            }

            // Custom fallback element
            if (fallback) {
                return fallback;
            }

            // Default fallback UI
            return (
                <div style={{
                    padding: "20px",
                    margin: "20px",
                    borderRadius: "8px",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#991b1b"
                }}>
                    <h2 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>
                        Une erreur est survenue
                    </h2>
                    <p style={{ margin: "0 0 15px 0", fontSize: "14px" }}>
                        {error?.message || "Erreur inconnue"}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#dc2626",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        Réessayer
                    </button>
                </div>
            );
        }

        return children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
    FallbackComponent: PropTypes.elementType,
    onError: PropTypes.func,
};
