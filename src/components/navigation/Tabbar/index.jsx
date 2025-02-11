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
      className={`fixed z-10 bg-smt gap-4 border-smt left-0 right-0 bottom-0 h-20 row-between-center border-t shadow-lg`}
    >
      {children}
    </div>
  );
};
