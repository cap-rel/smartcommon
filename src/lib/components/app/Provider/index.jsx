import { LibProvider } from "../LibProvider";
import { NavigationProvider } from "../NavigationProvider";

export const Provider = (props) => {
  const { children, config } = props;
  
  return (
    <LibProvider value={{ config }}>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </LibProvider>
  );
};