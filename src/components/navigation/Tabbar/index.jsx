export const Tabbar = ({
  variant = "",
  customType = null,
  custom = {
    colors: null,
    classNames: null
  },
  children = null
}) => {

  return (
    <div 
      className={`fixed right-0 bottom-0 left-0 z-10 gap-4 h-20 shadow-md bg-strong border-soft-border row-between-center`}
    >
      {children}
    </div>
  );
};
